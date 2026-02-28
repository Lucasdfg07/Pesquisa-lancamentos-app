import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  getDashboard,
  getAttributionReport,
  ingestHotmartPayload,
  ingestSurvey,
  initializeDatabase,
  registerCheckoutIntent,
  registerClickSession
} from "../packages/core/src/index.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
  delete process.env.LEADSCORE_DB_PATH;
});

describe("leadscore local pipeline", () => {
  it("atribui compra ao criativo e calcula score médio", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "leadscore-test-"));
    tempDirs.push(tempDir);
    process.env.LEADSCORE_DB_PATH = path.join(tempDir, "leadscore.db");

    initializeDatabase();

    registerClickSession({
      sessionId: "sess-1",
      landingUrl: "https://seusite.com",
      utmSource: "meta",
      utmCampaign: "bootcamp_fev",
      creativeId: "criativo-01"
    });

    registerCheckoutIntent({
      sessionId: "sess-1",
      email: "lead@example.com",
      checkoutUrl: "https://pay.hotmart.com/ABC?src=sess-1"
    });

    ingestSurvey({
      email: "lead@example.com",
      experience: "Já faz mais de 1 ano que trabalho como programador",
      languageSkill: "Sim, domino bem uma ou mais linguagens",
      englishLevel: "Avançado/Fluente - consigo trabalhar normalmente",
      hasInternationalInterview: "Sim, já fiz algumas vezes",
      internationalInterest:
        "Muito motivado(a) - é meu objetivo principal e estou disposto(a) a me preparar",
      salaryRange: "de R$ 6.000,00 até R$ 8.000,00 por mês (ou mais)",
      helpText: "Quero arrumar meu linkedin para gringa"
    });

    ingestHotmartPayload({
      event: "PURCHASE_COMPLETE",
      data: {
        buyer: {
          email: "lead@example.com",
          name: "Lead Teste"
        },
        purchase: {
          transaction: "HP123456",
          status: "COMPLETED",
          price: {
            value: 37,
            currency_value: "BRL"
          }
        }
      }
    });

    const report = getAttributionReport();
    expect(report).toHaveLength(1);
    expect(report[0].creativeId).toBe("criativo-01");
    expect(report[0].purchases).toBe(1);
    expect(report[0].revenue).toBe(37);
    expect(report[0].avgLeadScore).toBeGreaterThanOrEqual(80);
  });

  it("aplica filtros dinâmicos e monta árvore campanha->conjunto->criativo", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "leadscore-test-"));
    tempDirs.push(tempDir);
    process.env.LEADSCORE_DB_PATH = path.join(tempDir, "leadscore.db");

    initializeDatabase();

    registerClickSession({
      sessionId: "sess-1",
      landingUrl: "https://seusite.com",
      utmCampaign: "Campanha A|111",
      utmMedium: "Conjunto A1|211",
      utmContent: "Criativo A1|311"
    });

    registerClickSession({
      sessionId: "sess-2",
      landingUrl: "https://seusite.com",
      utmCampaign: "Campanha B|112",
      utmMedium: "Conjunto B1|212",
      utmContent: "Criativo B1|312"
    });

    registerCheckoutIntent({
      sessionId: "sess-1",
      email: "lead-a@example.com",
      checkoutUrl: "https://pay.hotmart.com/ABC?src=sess-1"
    });

    registerCheckoutIntent({
      sessionId: "sess-2",
      email: "lead-b@example.com",
      checkoutUrl: "https://pay.hotmart.com/ABC?src=sess-2"
    });

    ingestSurvey({
      email: "lead-a@example.com",
      experience: "Já faz mais de 1 ano que trabalho como programador",
      languageSkill: "Sim, domino bem uma ou mais linguagens",
      englishLevel: "Avançado/Fluente - consigo trabalhar normalmente",
      hasInternationalInterview: "Sim, já fiz algumas vezes",
      internationalInterest:
        "Muito motivado(a) - é meu objetivo principal e estou disposto(a) a me preparar",
      salaryRange: "de R$ 6.000,00 até R$ 8.000,00 por mês (ou mais)",
      helpText: "Perfil internacional"
    });

    ingestSurvey({
      email: "lead-b@example.com",
      experience: "Nunca trabalhei",
      languageSkill: "Conheço o básico de alguma linguagem",
      englishLevel: "Básico - entendo mas tenho dificuldade para falar",
      hasInternationalInterview: "Não, é a primeira vez que penso nisso",
      internationalInterest:
        "Interessado(a) - vejo muito valor e quero me preparar melhor",
      salaryRange: "de R$ 2.000,00 até R$ 4.000,00 por mês",
      helpText: "Primeira oportunidade"
    });

    ingestHotmartPayload({
      event: "PURCHASE_COMPLETE",
      data: {
        buyer: {
          email: "lead-a@example.com",
          name: "Lead A"
        },
        tracking: {
          src: "sess-1"
        },
        purchase: {
          transaction: "HP-A",
          status: "COMPLETED",
          price: {
            value: 37,
            currency_value: "BRL"
          }
        }
      }
    });

    ingestHotmartPayload({
      event: "PURCHASE_COMPLETE",
      data: {
        buyer: {
          email: "lead-b@example.com",
          name: "Lead B"
        },
        tracking: {
          src: "sess-2"
        },
        purchase: {
          transaction: "HP-B",
          status: "COMPLETED",
          price: {
            value: 37,
            currency_value: "BRL"
          }
        }
      }
    });

    const all = getDashboard({});
    expect(all.totals.filteredLeads).toBe(2);
    expect(all.tree).toHaveLength(2);

    const filtered = getDashboard({
      englishLevel: "Avançado/Fluente - consigo trabalhar normalmente"
    });
    expect(filtered.totals.filteredLeads).toBe(1);
    expect(filtered.tree).toHaveLength(1);
    expect(filtered.tree[0].name).toContain("Campanha A");
    expect(filtered.tree[0].children[0].name).toContain("Conjunto A1");
    expect(filtered.tree[0].children[0].children[0].name).toContain("Criativo A1");

    const campaignFiltered = getDashboard({ campaignId: "111" });
    expect(campaignFiltered.totals.filteredLeads).toBe(1);
    expect(campaignFiltered.dimensions.selectedCampaignId).toBe("111");
  });
});
