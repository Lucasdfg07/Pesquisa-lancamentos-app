import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from "recharts";
import { X, Filter, Users, TrendingUp } from "lucide-react";
import {
  surveyData,
  questionLabels,
  questionKeys,
  questionWeights,
  answerColors,
  scoreMap,
  type QuestionKey,
  type SurveyResponse,
} from "@/data/surveyData";

type Filters = Partial<Record<QuestionKey, string[]>>;
type SortDirection = "asc" | "desc";
type SortableColumn = "name" | "email" | "tempoProgramador" | "nivelIngles" | "motivacao" | "leadScore";

interface SurveyDashboardProps {
  data?: SurveyResponse[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      style={{ filter: `drop-shadow(0 0 8px ${fill})` }}
    />
  );
};

const PieSliceTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const count = item.value ?? 0;
  const percentage = item.percent ? (item.percent * 100).toFixed(1) : "0.0";

  return (
    <div className="glass-card px-2 py-1 text-[10px] border border-glass-border shadow-lg">
      <p className="text-foreground font-medium">{item.name}</p>
      <p className="text-muted-foreground font-mono">
        {count} leads ({percentage}%)
      </p>
    </div>
  );
};

interface SurveyChartProps {
  questionKey: QuestionKey;
  filteredData: SurveyResponse[];
  activeFilters: string[];
  onToggleFilter: (questionKey: QuestionKey, value: string) => void;
}

const SurveyChart = ({ questionKey, filteredData, activeFilters, onToggleFilter }: SurveyChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    const options = Object.keys(scoreMap[questionKey]);
    options.forEach((opt) => (counts[opt] = 0));
    filteredData.forEach((r) => {
      const val = r[questionKey] as string;
      if (counts[val] !== undefined) counts[val]++;
    });
    return options
      .map((opt) => ({ name: opt, value: counts[opt], color: answerColors[questionKey][opt] }))
      .filter((d) => d.value > 0);
  }, [filteredData, questionKey]);

  const total = filteredData.length;
  const weight = questionWeights[questionKey];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`glass-card p-4 relative ${activeFilters.length > 0 ? "ring-1 ring-primary/50 glow-primary" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          {questionLabels[questionKey]}
        </h4>
        <span className="text-[10px] font-mono text-primary font-bold">{weight} pts</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-[140px] h-[140px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                dataKey="value"
                activeIndex={hoveredIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(_, index) => onToggleFilter(questionKey, chartData[index].name)}
                className="cursor-pointer"
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    opacity={activeFilters.length > 0 && !activeFilters.includes(entry.name) ? 0.3 : 1}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<PieSliceTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-lg font-bold font-mono text-foreground">{total}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          {chartData.map((entry) => {
            const isActive = activeFilters.includes(entry.name);
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
            return (
              <button
                key={entry.name}
                onClick={() => onToggleFilter(questionKey, entry.name)}
                className={`flex items-center gap-1.5 w-full text-left text-[10px] rounded px-1.5 py-0.5 transition-all ${
                  isActive
                    ? "bg-primary/20 text-foreground"
                    : activeFilters.length > 0
                    ? "opacity-40 hover:opacity-70 text-muted-foreground"
                    : "hover:bg-secondary text-muted-foreground"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate flex-1">{entry.name}</span>
                <span className="font-mono font-bold shrink-0">{pct}%</span>
                <span className="font-mono text-[9px] shrink-0 opacity-60">({entry.value})</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const SurveyDashboard = ({ data = surveyData }: SurveyDashboardProps) => {
  const [filters, setFilters] = useState<Filters>({});
  const [sortColumn, setSortColumn] = useState<SortableColumn>("leadScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleFilter = useCallback((key: QuestionKey, value: string) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const isActive = current.includes(value);
      const next = isActive ? current.filter((v) => v !== value) : [...current, value];
      const result = { ...prev };
      if (next.length === 0) {
        delete result[key];
      } else {
        result[key] = next;
      }
      return result;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const filteredData = useMemo(() => {
    return data.filter((r) => {
      return Object.entries(filters).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        return values.includes(r[key as QuestionKey] as string);
      });
    });
  }, [data, filters]);

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const avgScore = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return filteredData.reduce((sum, r) => sum + r.leadScore, 0) / filteredData.length;
  }, [filteredData]);

  const handleSort = useCallback(
    (column: SortableColumn) => {
      if (sortColumn === column) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }
      setSortColumn(column);
      setSortDirection("asc");
    },
    [sortColumn]
  );

  const sortedLeads = useMemo(() => {
    const list = [...filteredData];

    const scoreByOption = (lead: SurveyResponse, column: SortableColumn) => {
      if (column === "tempoProgramador") return scoreMap.tempoProgramador[lead.tempoProgramador] ?? 0;
      if (column === "nivelIngles") return scoreMap.nivelIngles[lead.nivelIngles] ?? 0;
      if (column === "motivacao") return scoreMap.motivacao[lead.motivacao] ?? 0;
      return 0;
    };

    list.sort((a, b) => {
      let comparison = 0;

      if (sortColumn === "leadScore") {
        comparison = a.leadScore - b.leadScore;
      } else if (sortColumn === "tempoProgramador" || sortColumn === "nivelIngles" || sortColumn === "motivacao") {
        comparison = scoreByOption(a, sortColumn) - scoreByOption(b, sortColumn);
        if (comparison === 0) {
          comparison = String(a[sortColumn]).localeCompare(String(b[sortColumn]), "pt-BR");
        }
      } else {
        comparison = String(a[sortColumn]).localeCompare(String(b[sortColumn]), "pt-BR");
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [filteredData, sortColumn, sortDirection]);

  const getSortIndicator = (column: SortableColumn) => {
    if (sortColumn !== column) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    if (score >= 30) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-accent" />
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Pesquisas · <span className="text-accent">Lead Score</span>
          </h2>
        </div>
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-medium hover:bg-destructive/30 transition-colors"
            >
              <X size={12} />
              Limpar {activeFilterCount} filtro{activeFilterCount > 1 ? "s" : ""}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-3 flex items-center gap-3">
          <Users size={16} className="text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Leads Filtrados</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {filteredData.length}
              <span className="text-xs text-muted-foreground font-normal ml-1">/ {data.length}</span>
            </p>
          </div>
        </div>
        <div className="glass-card p-3 flex items-center gap-3">
          <TrendingUp size={16} className="text-accent" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score Médio</p>
            <p className={`text-lg font-bold font-mono ${getScoreColor(avgScore)}`}>
              {avgScore.toFixed(1)}
              <span className="text-xs text-muted-foreground font-normal ml-1">/ 100</span>
            </p>
          </div>
        </div>
        <div className="glass-card p-3 flex items-center gap-3">
          <Filter size={16} className="text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Filtros Ativos</p>
            <p className="text-lg font-bold font-mono text-foreground">{activeFilterCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {questionKeys.map((key) => (
          <SurveyChart
            key={key}
            questionKey={key}
            filteredData={filteredData}
            activeFilters={filters[key] || []}
            onToggleFilter={toggleFilter}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {Object.entries(filters).map(([key, values]) =>
              values?.map((val) => (
                <motion.button
                  key={`${key}-${val}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => toggleFilter(key as QuestionKey, val)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-medium hover:bg-primary/25 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: answerColors[key]?.[val] }} />
                  <span className="text-muted-foreground">{questionLabels[key as QuestionKey]}:</span>
                  {val}
                  <X size={10} />
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-4 border-b border-glass-border">
          <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
            Lista de Leads ({filteredData.length})
          </h3>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-glass-border">
                <th className="text-left p-3 text-muted-foreground font-medium">
                  <button onClick={() => handleSort("name")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                    Nome <span className="font-mono text-[10px]">{getSortIndicator("name")}</span>
                  </button>
                </th>
                <th className="text-left p-3 text-muted-foreground font-medium">
                  <button onClick={() => handleSort("email")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                    Email <span className="font-mono text-[10px]">{getSortIndicator("email")}</span>
                  </button>
                </th>
                <th className="text-left p-3 text-muted-foreground font-medium">
                  <button onClick={() => handleSort("tempoProgramador")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                    Experiência <span className="font-mono text-[10px]">{getSortIndicator("tempoProgramador")}</span>
                  </button>
                </th>
                <th className="text-left p-3 text-muted-foreground font-medium">
                  <button onClick={() => handleSort("nivelIngles")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                    Inglês <span className="font-mono text-[10px]">{getSortIndicator("nivelIngles")}</span>
                  </button>
                </th>
                <th className="text-left p-3 text-muted-foreground font-medium">
                  <button onClick={() => handleSort("motivacao")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                    Motivação <span className="font-mono text-[10px]">{getSortIndicator("motivacao")}</span>
                  </button>
                </th>
                <th className="text-right p-3 text-muted-foreground font-medium">
                  <button
                    onClick={() => handleSort("leadScore")}
                    className="inline-flex items-center justify-end gap-1 hover:text-foreground transition-colors w-full"
                  >
                    Score <span className="font-mono text-[10px]">{getSortIndicator("leadScore")}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {sortedLeads.map((lead) => (
                  <motion.tr
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-glass-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3 font-medium text-foreground">{lead.name}</td>
                    <td className="p-3 text-muted-foreground font-mono text-[10px]">{lead.email}</td>
                    <td className="p-3 text-muted-foreground">{lead.tempoProgramador}</td>
                    <td className="p-3 text-muted-foreground">{lead.nivelIngles}</td>
                    <td className="p-3 text-muted-foreground">{lead.motivacao}</td>
                    <td className="p-3 text-right">
                      <span className={`font-mono font-bold ${getScoreColor(lead.leadScore)}`}>{lead.leadScore}</span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {sortedLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default SurveyDashboard;
