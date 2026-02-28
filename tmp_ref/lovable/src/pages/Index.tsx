import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame, Snowflake, Users, TrendingUp, Target, MessageSquare, X, CalendarIcon } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import LeadScoreGauge from "@/components/dashboard/LeadScoreGauge";
import CaptureChart from "@/components/dashboard/CaptureChart";
import LeadDistributionChart from "@/components/dashboard/LeadDistributionChart";
import PerformanceTable from "@/components/dashboard/PerformanceTable";
import LeadProgressBar from "@/components/dashboard/LeadProgressBar";
import SurveyDashboard from "@/components/dashboard/SurveyDashboard";
import type { SurveyResponse } from "@/data/surveyData";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DEFAULT_LEAD_GOAL = 2500;

type SaveStatus = "idle" | "saving" | "saved" | "error";

type DashboardTreeNode = {
  id: string;
  name: string;
  leadCount: number;
  leadScoreAvg: number;
  children: DashboardTreeNode[];
};

type DashboardPayload = {
  totals: {
    filteredLeads: number;
    respondedLeads: number;
    responseRate: number;
    filteredLeadScoreAvg: number;
  };
  acquisition: {
    paid: { count: number };
    organic: { count: number };
  };
  scoreBands: {
    hot: { count: number };
    warm: { count: number };
    cold: { count: number };
  };
  questions: Array<{
    title: string;
    slices: Array<{ label: string; count: number }>;
  }>;
  dimensions: {
    selectedCampaignId: string | null;
    selectedAdsetId: string | null;
    selectedCreativeId: string | null;
  };
  tree: DashboardTreeNode[];
};

type DashboardLeadRowPayload = {
  email: string;
  firstName: string;
  experience: string;
  languageSkill: string;
  englishLevel: string;
  hasInternationalInterview: string;
  internationalInterest: string;
  salaryRange: string;
  leadScore: number;
};
type AuthStatus = "checking" | "authenticated" | "unauthenticated";

const formatPeriodDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const toIsoDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const normalizeExperience = (value: string): SurveyResponse["tempoProgramador"] => {
  const text = value.toLowerCase();
  if (text.includes("mais de 1 ano")) return "Mais de 1 ano";
  if (text.includes("1 ano")) return "1 ano";
  if (text.includes("6 meses")) return "6 meses";
  if (text.includes("estágio") || text.includes("estagio")) return "Estágio";
  return "Nunca";
};

const normalizeLanguageSkill = (value: string): SurveyResponse["dominaLinguagem"] => {
  const text = value.toLowerCase();
  if (text.includes("domino bem")) return "Domino bem";
  if (text.includes("aprend")) return "Aprendendo";
  if (text.includes("básico") || text.includes("basico")) return "Básico";
  if (text.includes("começando") || text.includes("comecando")) return "Começando";
  return "Nunca programei";
};

const normalizeEnglish = (value: string): SurveyResponse["nivelIngles"] => {
  const text = value.toLowerCase();
  if (text.includes("avançado") || text.includes("avancado") || text.includes("fluente")) {
    return "Avançado/Fluente";
  }
  if (text.includes("intermedi")) return "Intermediário";
  if (text.includes("básico") || text.includes("basico")) return "Básico";
  if (text.includes("iniciante")) return "Iniciante";
  return "Não falo inglês";
};

const normalizeInterview = (
  value: string
): SurveyResponse["entrevistaInternacional"] => {
  const text = value.toLowerCase();
  if (text.includes("regularmente")) return "Regularmente";
  if (text.includes("algumas")) return "Algumas vezes";
  if (text.includes("uma vez")) return "Uma vez";
  if (text.includes("vontade")) return "Sempre tive vontade";
  return "Primeira vez";
};

const normalizeMotivation = (value: string): SurveyResponse["motivacao"] => {
  const text = value.toLowerCase();
  if (text.includes("muito motiv")) return "Muito motivado";
  if (text.includes("interessad")) return "Interessado";
  if (text.includes("curios")) return "Curioso";
  return "Sem interesse";
};

const normalizeSalary = (value: string): SurveyResponse["faixaSalarial"] => {
  const text = value.toLowerCase();
  if (text.includes("15.000") && text.includes("acima")) return "Acima de R$ 15.000";
  if (text.includes("10.000") && text.includes("15.000")) return "R$ 10.001 - R$ 15.000";
  if (text.includes("6.000") && (text.includes("10.000") || text.includes("8.000"))) {
    return "R$ 6.001 - R$ 10.000";
  }
  if (
    text.includes("3.000") ||
    text.includes("4.000") ||
    text.includes("5.000") ||
    text.includes("6.000")
  ) {
    return "R$ 3.001 - R$ 6.000";
  }
  return "Até R$ 3.000";
};

const todayIso = toIsoDate(new Date());

const Index = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [surveyRows, setSurveyRows] = useState<DashboardLeadRowPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<string | null>(null);
  const [leadGoal, setLeadGoal] = useState<number>(DEFAULT_LEAD_GOAL);
  const [configReady, setConfigReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const [startDate, setStartDate] = useState(todayIso);
  const [endDate, setEndDate] = useState(todayIso);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          setAuthStatus("unauthenticated");
          return;
        }
        const payload = (await response.json()) as { authenticated: boolean };
        setAuthStatus(payload.authenticated ? "authenticated" : "unauthenticated");
      } catch {
        setAuthStatus("unauthenticated");
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const loadConfig = async () => {
      try {
        const response = await fetch("/api/dashboard/config");
        if (!response.ok) {
          if (response.status === 401) setAuthStatus("unauthenticated");
          setConfigReady(true);
          return;
        }
        const payload = (await response.json()) as {
          config?: { startDate: string; endDate: string; leadGoal: number } | null;
        };
        if (payload.config) {
          setStartDate(payload.config.startDate);
          setEndDate(payload.config.endDate);
          setLeadGoal(payload.config.leadGoal);
        }
      } finally {
        setConfigReady(true);
      }
    };

    void loadConfig();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !configReady || !startDate || !endDate) return;

    let statusTimeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const timeout = setTimeout(() => {
      void (async () => {
        try {
          setSaveStatus("saving");
          const response = await fetch("/api/dashboard/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startDate, endDate, leadGoal }),
          });
          if (response.status === 401) {
            setAuthStatus("unauthenticated");
            return;
          }
          if (!response.ok) throw new Error("save_failed");
          if (cancelled) return;
          setSaveStatus("saved");
          statusTimeout = setTimeout(() => setSaveStatus("idle"), 1500);
        } catch {
          if (cancelled) return;
          setSaveStatus("error");
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (statusTimeout) clearTimeout(statusTimeout);
    };
  }, [authStatus, configReady, startDate, endDate, leadGoal]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !configReady) return;
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        if (selectedCampaign) params.set("campaignId", selectedCampaign);
        if (selectedAdSet) params.set("adsetId", selectedAdSet);
        params.set("startDate", startDate);
        params.set("endDate", endDate);

        const [dashboardResponse, rowsResponse] = await Promise.all([
          fetch(`/api/dashboard?${params.toString()}`),
          fetch(`/api/dashboard/rows?${params.toString()}`),
        ]);
        if (!dashboardResponse.ok || !rowsResponse.ok) {
          if (dashboardResponse.status === 401 || rowsResponse.status === 401) {
            setAuthStatus("unauthenticated");
            return;
          }
          throw new Error("Falha ao carregar dashboard");
        }
        const data = (await dashboardResponse.json()) as DashboardPayload;
        const rowsPayload = (await rowsResponse.json()) as { rows: DashboardLeadRowPayload[] };
        if (cancelled) return;
        setDashboard(data);
        setSurveyRows(rowsPayload.rows ?? []);
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Erro ao carregar dados");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [authStatus, configReady, selectedCampaign, selectedAdSet, startDate, endDate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!response.ok) {
        setLoginError("E-mail ou senha inválidos.");
        return;
      }
      setConfigReady(false);
      setAuthStatus("authenticated");
      setLoginPassword("");
    } catch {
      setLoginError("Falha no login. Tente novamente.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setDashboard(null);
      setSurveyRows([]);
      setConfigReady(false);
      setAuthStatus("unauthenticated");
    }
  };

  const campaigns = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.tree.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      leads: campaign.leadCount,
      score: campaign.leadScoreAvg,
      campaignName: campaign.name,
    }));
  }, [dashboard]);

  const adsets = useMemo(() => {
    if (!dashboard) return [];
    if (selectedCampaign) {
      const campaign = dashboard.tree.find((node) => node.id === selectedCampaign);
      if (!campaign) return [];
      return campaign.children.map((adset) => ({
        id: adset.id,
        name: adset.name,
        leads: adset.leadCount,
        score: adset.leadScoreAvg,
        campaignName: campaign.name,
      }));
    }

    return dashboard.tree.flatMap((campaign) =>
      campaign.children.map((adset) => ({
        id: adset.id,
        name: adset.name,
        leads: adset.leadCount,
        score: adset.leadScoreAvg,
        campaignName: campaign.name,
      }))
    );
  }, [dashboard, selectedCampaign]);

  const creatives = useMemo(() => {
    if (!dashboard) return [];
    if (selectedAdSet) {
      for (const campaign of dashboard.tree) {
        const adset = campaign.children.find((item) => item.id === selectedAdSet);
        if (adset) {
          return adset.children.map((creative) => ({
            id: creative.id,
            name: creative.name,
            leads: creative.leadCount,
            score: creative.leadScoreAvg,
            campaignName: campaign.name,
          }));
        }
      }
      return [];
    }

    if (selectedCampaign) {
      const campaign = dashboard.tree.find((node) => node.id === selectedCampaign);
      if (!campaign) return [];
      return campaign.children.flatMap((adset) =>
        adset.children.map((creative) => ({
          id: creative.id,
          name: creative.name,
          leads: creative.leadCount,
          score: creative.leadScoreAvg,
          campaignName: campaign.name,
        }))
      );
    }

    return dashboard.tree.flatMap((campaign) =>
      campaign.children.flatMap((adset) =>
        adset.children.map((creative) => ({
          id: creative.id,
          name: creative.name,
          leads: creative.leadCount,
          score: creative.leadScoreAvg,
          campaignName: campaign.name,
        }))
      )
    );
  }, [dashboard, selectedCampaign, selectedAdSet]);

  const captureChartData = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        date: "Atual",
        paid: dashboard.acquisition.paid.count,
        organic: dashboard.acquisition.organic.count,
      },
    ];
  }, [dashboard]);

  const scoreDistributionData = useMemo(() => {
    if (!dashboard) return [];
    return [
      { range: "hot", label: "Quente", count: dashboard.scoreBands.hot.count },
      { range: "warm", label: "Morno", count: dashboard.scoreBands.warm.count },
      { range: "cold", label: "Frio", count: dashboard.scoreBands.cold.count },
    ];
  }, [dashboard]);

  const surveyDashboardData = useMemo<SurveyResponse[]>(() => {
    return surveyRows
      .filter((row) => row.experience !== "Sem pesquisa")
      .map((row, index) => ({
        id: index + 1,
        name: row.firstName?.trim() || "Lead",
        email: row.email,
        date: endDate,
        tempoProgramador: normalizeExperience(row.experience),
        dominaLinguagem: normalizeLanguageSkill(row.languageSkill),
        nivelIngles: normalizeEnglish(row.englishLevel),
        entrevistaInternacional: normalizeInterview(row.hasInternationalInterview),
        motivacao: normalizeMotivation(row.internationalInterest),
        faixaSalarial: normalizeSalary(row.salaryRange),
        leadScore: row.leadScore,
      }));
  }, [surveyRows, endDate]);

  const getSaveStatusStyle = () => {
    if (saveStatus === "saving") return "border-primary/50 bg-primary/15 text-primary";
    if (saveStatus === "saved") return "border-green-500/50 bg-green-500/15 text-green-400";
    if (saveStatus === "error") return "border-destructive/50 bg-destructive/15 text-destructive";
    return "border-border text-muted-foreground";
  };

  const getSaveStatusLabel = () => {
    if (saveStatus === "saving") return "Salvando...";
    if (saveStatus === "saved") return "Salvo";
    if (saveStatus === "error") return "Erro ao salvar";
    return "Sem alterações";
  };

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen bg-background grid-bg scanline p-8 text-muted-foreground">
        Verificando autenticação...
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background grid-bg scanline flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="glass-card w-full max-w-md p-6 space-y-4 border border-border"
        >
          <h1 className="text-xl font-bold text-foreground">Entrar no Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Use suas credenciais para acessar os dados.
          </p>
          <label className="block text-xs text-muted-foreground uppercase tracking-wider">
            E-mail
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="mt-1 w-full rounded-md bg-background border border-border px-2 py-1.5 text-foreground"
            />
          </label>
          <label className="block text-xs text-muted-foreground uppercase tracking-wider">
            Senha
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="mt-1 w-full rounded-md bg-background border border-border px-2 py-1.5 text-foreground"
            />
          </label>
          {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background grid-bg scanline p-8 text-destructive">
        Erro ao carregar dashboard: {loadError}
      </div>
    );
  }

  const totalLeads = dashboard?.totals.filteredLeads ?? 0;
  const avgLeadScore = dashboard?.totals.filteredLeadScoreAvg ?? 0;
  const hotLeads = dashboard?.scoreBands.hot.count ?? 0;
  const coldLeads = dashboard?.scoreBands.cold.count ?? 0;
  const warmLeads = dashboard?.scoreBands.warm.count ?? 0;
  const paidLeads = dashboard?.acquisition.paid.count ?? 0;
  const organicLeads = dashboard?.acquisition.organic.count ?? 0;
  const respondedLeads = dashboard?.totals.respondedLeads ?? 0;
  const responseRate = dashboard?.totals.responseRate ?? 0;

  return (
    <div className="min-h-screen bg-background grid-bg scanline">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 rounded-full bg-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Lead Score <span className="text-primary">Dashboard</span>
            </h1>
            <button
              onClick={handleLogout}
              className="ml-auto text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Sair
            </button>
          </div>
          <p className="text-sm text-muted-foreground ml-5">
            Período ativo · {startDate ? formatPeriodDate(startDate) : "--"} até {endDate ? formatPeriodDate(endDate) : "--"}
          </p>
          <div className="ml-5 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider ${getSaveStatusStyle()}`}>
              Configuração: {getSaveStatusLabel()}
            </span>
          </div>
        </motion.header>

        <div className="glass-card p-4 mb-6 flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              <p className="mb-1">Data inicial</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon />
                    {startDate ? format(parseIsoDate(startDate), "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate ? parseIsoDate(startDate) : undefined} onSelect={(date) => date && setStartDate(toIsoDate(date))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              <p className="mb-1">Data final</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon />
                    {endDate ? format(parseIsoDate(endDate), "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate ? parseIsoDate(endDate) : undefined} onSelect={(date) => date && setEndDate(toIsoDate(date))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Meta total de leads
              <input
                type="number"
                min={0}
                step={10}
                value={leadGoal}
                onChange={(e) => setLeadGoal(Math.max(0, Number(e.target.value || 0)))}
                className="mt-1 w-full rounded-md bg-background border border-border px-2 py-1.5 text-foreground"
              />
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="glass-card p-8 text-center text-muted-foreground mb-6">Carregando dados reais do banco...</div>
        ) : null}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <KPICard title="Total Leads" value={totalLeads} icon={<Users size={16} />} delay={0.05} />
          <KPICard title="Leads Quentes" value={hotLeads} subtitle="Campanha PQ" icon={<Flame size={16} />} variant="hot" delay={0.1} />
          <KPICard title="Leads Frios" value={coldLeads} subtitle="Campanha PF" icon={<Snowflake size={16} />} variant="cold" delay={0.15} />
          <KPICard title="Orgânicos" value={organicLeads} icon={<TrendingUp size={16} />} variant="accent" delay={0.2} />
          <KPICard title="Pagos" value={paidLeads} icon={<Target size={16} />} delay={0.25} />
          <KPICard
            title="Respostas"
            value={`${(responseRate * 100).toFixed(1)}%`}
            subtitle={`${respondedLeads} de ${totalLeads} leads`}
            icon={<MessageSquare size={16} />}
            variant="success"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-3">
            <LeadProgressBar totalLeads={totalLeads} leadGoal={leadGoal} />
          </div>
          <LeadScoreGauge score={avgLeadScore} label="Média de Score" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <CaptureChart data={captureChartData} />
          <LeadDistributionChart data={scoreDistributionData} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
            <span className="text-muted-foreground">Filtro Hierárquico:</span>
            <span className={`px-2 py-0.5 rounded-full border ${selectedCampaign ? "border-primary/40 text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
              Campanha: {selectedCampaign ?? "Todas"}
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${selectedAdSet ? "border-accent/50 text-accent bg-accent/10" : "border-border text-muted-foreground"}`}>
              Conjunto: {selectedAdSet ?? "Todos"}
            </span>
          </div>
          {(selectedCampaign || selectedAdSet) && (
            <button
              onClick={() => {
                setSelectedCampaign(null);
                setSelectedAdSet(null);
              }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
            >
              <X size={12} />
              Limpar filtro
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <PerformanceTable title="Campanhas" data={campaigns} delay={0.6} selectedName={selectedCampaign} onSelectRow={(id) => { setSelectedCampaign((prev) => (prev === id ? null : id)); setSelectedAdSet(null); }} />
          <PerformanceTable title="Conjuntos" data={adsets} delay={0.7} selectedName={selectedAdSet} onSelectRow={(id) => setSelectedAdSet((prev) => (prev === id ? null : id))} emptyMessage="Nenhum conjunto encontrado para o filtro selecionado." />
          <PerformanceTable title="Criativos" data={creatives} delay={0.8} emptyMessage="Nenhum anúncio encontrado para o filtro selecionado." />
        </div>

        <SurveyDashboard data={surveyDashboardData} />

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center text-xs text-muted-foreground pb-4">
          Dados atualizados em tempo real · Lead Score Dashboard · Quentes: {hotLeads} · Mornos: {warmLeads} · Frios: {coldLeads}
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
