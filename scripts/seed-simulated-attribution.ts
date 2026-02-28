import crypto from "node:crypto";
import { createDb, initSchema } from "../packages/core/src/db.js";
import {
  registerCheckoutIntent,
  registerClickSession
} from "../packages/core/src/index.js";

type MediaPreset = {
  campaignName: string;
  campaignId: string;
  adsetName: string;
  adsetId: string;
  creativeName: string;
  creativeId: string;
};

const PQ_PRESETS: MediaPreset[] = [
  {
    campaignName: "PQ - Remarketing Checkout",
    campaignId: "9001",
    adsetName: "PQ - Engajados 30d",
    adsetId: "9101",
    creativeName: "PQ - Criativo VSL 01",
    creativeId: "9201"
  },
  {
    campaignName: "PQ - Lookalike Compradores",
    campaignId: "9002",
    adsetName: "PQ - LAL 1%",
    adsetId: "9102",
    creativeName: "PQ - Depoimento 02",
    creativeId: "9202"
  },
  {
    campaignName: "PQ - Objeções Finais",
    campaignId: "9003",
    adsetName: "PQ - Carrinho 7d",
    adsetId: "9103",
    creativeName: "PQ - Oferta Direta 03",
    creativeId: "9203"
  }
];

const PF_PRESETS: MediaPreset[] = [
  {
    campaignName: "PF - Interesses Programação",
    campaignId: "8001",
    adsetName: "PF - Frontend",
    adsetId: "8101",
    creativeName: "PF - Gancho Salário 01",
    creativeId: "8201"
  },
  {
    campaignName: "PF - Broad Brasil",
    campaignId: "8002",
    adsetName: "PF - Aberto 25-35",
    adsetId: "8102",
    creativeName: "PF - Dor de Carreira 02",
    creativeId: "8202"
  },
  {
    campaignName: "PF - Lookalike Leads",
    campaignId: "8003",
    adsetName: "PF - LAL Form",
    adsetId: "8103",
    creativeName: "PF - Prova Social 03",
    creativeId: "8203"
  }
];

function main(): void {
  const db = createDb();
  initSchema(db);

  const emails = db
    .prepare("SELECT email FROM survey_responses ORDER BY submitted_at ASC")
    .all() as Array<{ email: string }>;

  if (emails.length === 0) {
    console.log("Nenhum email em survey_responses para simular mídia.");
    db.close();
    return;
  }

  const now = Date.now();
  let paidCount = 0;
  let organicCount = 0;
  let pqCount = 0;
  let pfCount = 0;

  emails.forEach((entry, index) => {
    const email = entry.email.trim().toLowerCase();
    const sessionId = `sim-${hash(email).slice(0, 12)}`;

    // 15% orgânico, 35% PQ, 50% PF para visualizar bem as quebras.
    const bucket = index % 20;
    const isOrganic = bucket < 3;
    const isPQ = !isOrganic && bucket < 10;

    if (isOrganic) {
      registerClickSession({
        sessionId,
        landingUrl: "https://bootcamp.devnagringa.com/obrigado",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmContent: null,
        utmTerm: null,
        campaignName: "Orgânico",
        adsetName: "Orgânico",
        creativeName: "Orgânico",
        createdAt: now + index
      });
      organicCount += 1;
    } else {
      const preset = isPQ
        ? PQ_PRESETS[index % PQ_PRESETS.length]
        : PF_PRESETS[index % PF_PRESETS.length];

      registerClickSession({
        sessionId,
        landingUrl: "https://bootcamp.devnagringa.com",
        utmSource: "FB",
        utmMedium: `${preset.adsetName}|${preset.adsetId}`,
        utmCampaign: `${preset.campaignName}|${preset.campaignId}`,
        utmContent: `${preset.creativeName}|${preset.creativeId}`,
        utmTerm: "feed",
        campaignId: preset.campaignId,
        campaignName: preset.campaignName,
        adsetId: preset.adsetId,
        adsetName: preset.adsetName,
        creativeId: preset.creativeId,
        creativeName: preset.creativeName,
        xcod: `SIM${preset.campaignId}x${preset.adsetId}x${preset.creativeId}`,
        createdAt: now + index
      });

      paidCount += 1;
      if (isPQ) pqCount += 1;
      else pfCount += 1;
    }

    registerCheckoutIntent({
      sessionId,
      email,
      checkoutUrl: `https://pay.hotmart.com/BOOTCAMP?src=${sessionId}`,
      createdAt: now + index
    });
  });

  db.close();

  console.log(
    JSON.stringify(
      {
        totalEmails: emails.length,
        paidCount,
        organicCount,
        pqCount,
        pfCount
      },
      null,
      2
    )
  );
}

function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

main();
