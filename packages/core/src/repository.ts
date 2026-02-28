import type { DatabaseSync } from "node:sqlite";
import { calculateLeadScore, getLeadQualification } from "./leadscore.js";
import type {
  AttributionReportRow,
  DashboardData,
  DashboardFilters,
  DashboardLeadRow,
  DimensionOption,
  CheckoutIntentInput,
  ClickSessionInput,
  SurveyInput,
  TreeNode
} from "./types.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function upsertClickSession(
  db: DatabaseSync,
  input: ClickSessionInput
): void {
  const parsedCampaign = parseMetaCompound(input.utmCampaign);
  const parsedAdset = parseMetaCompound(input.utmMedium);
  const parsedCreative = parseMetaCompound(input.utmContent);

  const stmt = db.prepare(`
    INSERT INTO click_sessions (
      session_id, landing_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      ad_id, adset_id, campaign_id, creative_id, campaign_name, adset_name, creative_name, xcod,
      fbclid, gclid, ttclid, created_at
    ) VALUES (
      @session_id, @landing_url, @utm_source, @utm_medium, @utm_campaign, @utm_content, @utm_term,
      @ad_id, @adset_id, @campaign_id, @creative_id, @campaign_name, @adset_name, @creative_name, @xcod,
      @fbclid, @gclid, @ttclid, @created_at
    )
    ON CONFLICT(session_id) DO UPDATE SET
      landing_url = excluded.landing_url,
      utm_source = excluded.utm_source,
      utm_medium = excluded.utm_medium,
      utm_campaign = excluded.utm_campaign,
      utm_content = excluded.utm_content,
      utm_term = excluded.utm_term,
      ad_id = excluded.ad_id,
      adset_id = excluded.adset_id,
      campaign_id = excluded.campaign_id,
      creative_id = excluded.creative_id,
      campaign_name = excluded.campaign_name,
      adset_name = excluded.adset_name,
      creative_name = excluded.creative_name,
      xcod = excluded.xcod,
      fbclid = excluded.fbclid,
      gclid = excluded.gclid,
      ttclid = excluded.ttclid
  `);

  stmt.run({
    session_id: input.sessionId,
    landing_url: input.landingUrl,
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
    utm_content: input.utmContent ?? null,
    utm_term: input.utmTerm ?? null,
    ad_id: input.adId ?? parsedCreative.id ?? null,
    adset_id: input.adsetId ?? parsedAdset.id ?? null,
    campaign_id: input.campaignId ?? parsedCampaign.id ?? null,
    creative_id: input.creativeId ?? parsedCreative.id ?? null,
    campaign_name: input.campaignName ?? parsedCampaign.name ?? null,
    adset_name: input.adsetName ?? parsedAdset.name ?? null,
    creative_name: input.creativeName ?? parsedCreative.name ?? null,
    xcod: input.xcod ?? null,
    fbclid: input.fbclid ?? null,
    gclid: input.gclid ?? null,
    ttclid: input.ttclid ?? null,
    created_at: input.createdAt ?? Date.now()
  });
}

export function addCheckoutIntent(
  db: DatabaseSync,
  input: CheckoutIntentInput
): void {
  const stmt = db.prepare(`
    INSERT INTO checkout_intents (session_id, email, checkout_url, created_at)
    VALUES (@session_id, @email, @checkout_url, @created_at)
  `);

  stmt.run({
    session_id: input.sessionId,
    email: input.email ? normalizeEmail(input.email) : null,
    checkout_url: input.checkoutUrl,
    created_at: input.createdAt ?? Date.now()
  });
}

export function addOrUpdateSurvey(db: DatabaseSync, input: SurveyInput): void {
  const score = calculateLeadScore({
    experience: input.experience,
    languageSkill: input.languageSkill,
    englishLevel: input.englishLevel,
    hasInternationalInterview: input.hasInternationalInterview,
    internationalInterest: input.internationalInterest,
    salaryRange: input.salaryRange
  });
  const qualification = getLeadQualification(score);

  const stmt = db.prepare(`
    INSERT INTO survey_responses (
      email, first_name, experience, language_skill, english_level, has_international_interview,
      international_interest, salary_range, help_text, test_email, form_id, form_name, raw_body_json,
      lead_score, lead_qualification, submitted_at
    ) VALUES (
      @email, @first_name, @experience, @language_skill, @english_level, @has_international_interview,
      @international_interest, @salary_range, @help_text, @test_email, @form_id, @form_name, @raw_body_json,
      @lead_score, @lead_qualification, @submitted_at
    )
    ON CONFLICT(email) DO UPDATE SET
      first_name = excluded.first_name,
      experience = excluded.experience,
      language_skill = excluded.language_skill,
      english_level = excluded.english_level,
      has_international_interview = excluded.has_international_interview,
      international_interest = excluded.international_interest,
      salary_range = excluded.salary_range,
      help_text = excluded.help_text,
      test_email = excluded.test_email,
      form_id = excluded.form_id,
      form_name = excluded.form_name,
      raw_body_json = excluded.raw_body_json,
      lead_score = excluded.lead_score,
      lead_qualification = excluded.lead_qualification,
      submitted_at = excluded.submitted_at
  `);

  stmt.run({
    email: normalizeEmail(input.email),
    first_name: input.firstName ?? null,
    experience: input.experience,
    language_skill: input.languageSkill,
    english_level: input.englishLevel,
    has_international_interview: input.hasInternationalInterview,
    international_interest: input.internationalInterest,
    salary_range: input.salaryRange,
    help_text: input.helpText,
    test_email: input.testEmail ?? null,
    form_id: input.formId ?? null,
    form_name: input.formName ?? null,
    raw_body_json: input.rawBodyJson ?? null,
    lead_score: score,
    lead_qualification: qualification,
    submitted_at: input.submittedAt ?? Date.now()
  });
}

export function addOrUpdatePurchase(
  db: DatabaseSync,
  payload: Record<string, unknown>
): void {
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const buyer = (data.buyer ?? {}) as Record<string, unknown>;
  const purchase = (data.purchase ?? {}) as Record<string, unknown>;
  const price = (purchase.price ?? {}) as Record<string, unknown>;
  const purchaseOrigin = (purchase.origin ?? {}) as Record<string, unknown>;
  const offerTracking = (purchase.tracking ?? {}) as Record<string, unknown>;
  const dataTracking = (data.tracking ?? {}) as Record<string, unknown>;

  const buyerEmail = String(buyer.email ?? "").trim().toLowerCase();
  if (!buyerEmail) {
    throw new Error("Payload Hotmart sem buyer.email");
  }

  const transactionId = String(purchase.transaction ?? "");
  if (!transactionId) {
    throw new Error("Payload Hotmart sem purchase.transaction");
  }

  const sourceSessionFromPayload =
    asOptionalString(offerTracking.src) ??
    asOptionalString(dataTracking.src) ??
    asOptionalString(data.src) ??
    asOptionalString((payload as Record<string, unknown>).src);
  const originSck =
    asOptionalString(purchaseOrigin.sck) ??
    asOptionalString(offerTracking.sck) ??
    asOptionalString(dataTracking.sck);
  const originXcod =
    asOptionalString(purchaseOrigin.xcod) ??
    asOptionalString(offerTracking.xcod) ??
    asOptionalString(dataTracking.xcod);
  const originAttribution = parseHotmartOriginAttribution(originSck ?? originXcod);

  let sourceSessionId = sourceSessionFromPayload;
  let attributionSource: "hotmart_origin" | "src" | "fallback_email" | "unknown" =
    "unknown";
  if (!sourceSessionId) {
    const fromCheckoutIntent = db
      .prepare(
        `
          SELECT session_id
          FROM checkout_intents
          WHERE email = ?
          ORDER BY created_at DESC
          LIMIT 1
        `
      )
      .get(buyerEmail) as { session_id?: string } | undefined;
    sourceSessionId = fromCheckoutIntent?.session_id ?? null;
    if (sourceSessionId) {
      attributionSource = "fallback_email";
    }
  }

  if (sourceSessionFromPayload) {
    attributionSource = "src";
  }

  // Fallback robusto: quando não há src/email para casar sessão, cria sessão sintética
  // com os metadados de origem vindos do webhook (sck/xcod), preservando atribuição.
  if (!sourceSessionId && originAttribution) {
    sourceSessionId = `hotmart-origin-${transactionId}`;
    attributionSource = "hotmart_origin";
  }

  if (sourceSessionId && originAttribution) {
    upsertClickSession(db, {
      sessionId: sourceSessionId,
      landingUrl: "https://hotmart/origin-webhook",
      utmSource: originAttribution.source,
      utmCampaign: toCompoundMeta(originAttribution.campaignName, originAttribution.campaignId),
      utmMedium: toCompoundMeta(originAttribution.adsetName, originAttribution.adsetId),
      utmContent: toCompoundMeta(originAttribution.creativeName, originAttribution.creativeId),
      utmTerm: originAttribution.placement,
      campaignId: originAttribution.campaignId,
      adsetId: originAttribution.adsetId,
      creativeId: originAttribution.creativeId,
      campaignName: originAttribution.campaignName,
      adsetName: originAttribution.adsetName,
      creativeName: originAttribution.creativeName,
      xcod: originXcod ?? originSck
    });
  }

  const stmt = db.prepare(`
    INSERT INTO hotmart_purchases (
      transaction_id, buyer_email, buyer_name, status, amount, currency, event,
      approved_at, source_session_id, attribution_source, created_at, payload_json
    ) VALUES (
      @transaction_id, @buyer_email, @buyer_name, @status, @amount, @currency, @event,
      @approved_at, @source_session_id, @attribution_source, @created_at, @payload_json
    )
    ON CONFLICT(transaction_id) DO UPDATE SET
      buyer_email = excluded.buyer_email,
      buyer_name = excluded.buyer_name,
      status = excluded.status,
      amount = excluded.amount,
      currency = excluded.currency,
      event = excluded.event,
      approved_at = excluded.approved_at,
      source_session_id = excluded.source_session_id,
      attribution_source = excluded.attribution_source,
      payload_json = excluded.payload_json
  `);

  stmt.run({
    transaction_id: transactionId,
    buyer_email: buyerEmail,
    buyer_name: asOptionalString(buyer.name),
    status: asOptionalString(purchase.status) ?? "UNKNOWN",
    amount: Number(price.value ?? 0),
    currency: asOptionalString(price.currency_value) ?? "BRL",
    event: asOptionalString(payload.event) ?? "UNKNOWN",
    approved_at: toOptionalNumber(purchase.approved_date),
    source_session_id: sourceSessionId,
    attribution_source: attributionSource,
    created_at: Date.now(),
    payload_json: JSON.stringify(payload)
  });

  // Modo webhook-only: mantém o vínculo email -> sessão diretamente pela compra,
  // para que o dashboard consiga relacionar survey_responses sem depender da LP.
  if (sourceSessionId) {
    addCheckoutIntent(db, {
      sessionId: sourceSessionId,
      email: buyerEmail,
      checkoutUrl: "https://hotmart/checkout-webhook",
      createdAt: Date.now()
    });
  }
}

export function listAttributionReport(db: DatabaseSync): AttributionReportRow[] {
  const rows = db
    .prepare(
      `
      SELECT
        COALESCE(cs.creative_id, cs.utm_content, 'desconhecido') AS creative_id,
        COUNT(DISTINCT cs.session_id) AS leads,
        COUNT(DISTINCT hp.transaction_id) AS purchases,
        COALESCE(SUM(hp.amount), 0) AS revenue,
        COALESCE(AVG(sr.lead_score), 0) AS avg_lead_score
      FROM click_sessions cs
      LEFT JOIN hotmart_purchases hp ON hp.source_session_id = cs.session_id
      LEFT JOIN survey_responses sr ON sr.email = hp.buyer_email
      GROUP BY COALESCE(cs.creative_id, cs.utm_content, 'desconhecido')
      ORDER BY revenue DESC
      `
    )
    .all() as Array<{
    creative_id: string;
    leads: number;
    purchases: number;
    revenue: number;
    avg_lead_score: number;
  }>;

  return rows.map((row) => ({
    creativeId: row.creative_id,
    leads: row.leads,
    purchases: row.purchases,
    revenue: Number(row.revenue.toFixed(2)),
    avgLeadScore: Number(row.avg_lead_score.toFixed(2))
  }));
}

export function getDashboardData(
  db: DatabaseSync,
  filters: DashboardFilters
): DashboardData {
  const normalizedFilters = normalizeDashboardFilters(filters);
  const rows = queryLeadRows(db, normalizedFilters);

  const questions: DashboardData["questions"] = [
    buildQuestion("experience", "Tempo de experiência", normalizedFilters.experience, rows),
    buildQuestion("languageSkill", "Domínio de linguagem", normalizedFilters.languageSkill, rows),
    buildQuestion("englishLevel", "Nível de inglês", normalizedFilters.englishLevel, rows),
    buildQuestion(
      "hasInternationalInterview",
      "Entrevista internacional",
      normalizedFilters.hasInternationalInterview,
      rows
    ),
    buildQuestion(
      "internationalInterest",
      "Interesse internacional",
      normalizedFilters.internationalInterest,
      rows
    ),
    buildQuestion("salaryRange", "Faixa salarial", normalizedFilters.salaryRange, rows)
  ];

  const leadScoreSum = rows.reduce((sum, row) => sum + row.leadScore, 0);
  const filteredLeads = rows.length;
  const respondedLeads = rows.filter((row) => row.hasSurvey === 1).length;
  const filteredLeadScoreAvg =
    filteredLeads === 0 ? 0 : Number((leadScoreSum / filteredLeads).toFixed(2));
  const paidCount = rows.filter(isPaidLead).length;
  const organicCount = filteredLeads - paidCount;
  const quentePQCount = rows.filter((row) => getCampaignHeat(row) === "PQ").length;
  const frioPFCount = rows.filter((row) => getCampaignHeat(row) === "PF").length;
  const otherHeatCount = filteredLeads - quentePQCount - frioPFCount;
  const hotCount = rows.filter((row) => getCampaignHeat(row) === "PQ").length;
  const coldCount = rows.filter((row) => getCampaignHeat(row) === "PF").length;
  const warmCount = filteredLeads - hotCount - coldCount;
  const campaignBuckets = buildDimensionOptions(rows, "campaignId", "campaignName");
  const topCampaign = campaignBuckets[0] ?? { name: "Sem dados", count: 0 };
  const paidRows = rows.filter(isPaidLead);
  const organicRows = rows.filter((row) => !isPaidLead(row));
  const paidHotCount = paidRows.filter((row) => getCampaignHeat(row) === "PQ").length;
  const organicHotCount = organicRows.filter((row) => getCampaignHeat(row) === "PQ").length;

  return {
    totals: {
      filteredLeads,
      respondedLeads,
      responseRate:
        filteredLeads === 0 ? 0 : Number((respondedLeads / filteredLeads).toFixed(4)),
      filteredLeadScoreAvg,
      filteredLeadScoreSum: Number(leadScoreSum.toFixed(2))
    },
    acquisition: {
      paid: {
        count: paidCount,
        proportion: filteredLeads === 0 ? 0 : Number((paidCount / filteredLeads).toFixed(4))
      },
      organic: {
        count: organicCount,
        proportion:
          filteredLeads === 0 ? 0 : Number((organicCount / filteredLeads).toFixed(4))
      }
    },
    campaignHeat: {
      quentePQ: {
        count: quentePQCount,
        proportion:
          filteredLeads === 0 ? 0 : Number((quentePQCount / filteredLeads).toFixed(4))
      },
      frioPF: {
        count: frioPFCount,
        proportion:
          filteredLeads === 0 ? 0 : Number((frioPFCount / filteredLeads).toFixed(4))
      },
      other: {
        count: otherHeatCount,
        proportion:
          filteredLeads === 0 ? 0 : Number((otherHeatCount / filteredLeads).toFixed(4))
      }
    },
    scoreBands: {
      hot: {
        count: hotCount,
        proportion: filteredLeads === 0 ? 0 : Number((hotCount / filteredLeads).toFixed(4))
      },
      warm: {
        count: warmCount,
        proportion: filteredLeads === 0 ? 0 : Number((warmCount / filteredLeads).toFixed(4))
      },
      cold: {
        count: coldCount,
        proportion: filteredLeads === 0 ? 0 : Number((coldCount / filteredLeads).toFixed(4))
      }
    },
    insights: {
      topCampaignName: topCampaign.name,
      topCampaignLeads: topCampaign.count,
      paidHotRate:
        paidRows.length === 0 ? 0 : Number((paidHotCount / paidRows.length).toFixed(4)),
      organicHotRate:
        organicRows.length === 0
          ? 0
          : Number((organicHotCount / organicRows.length).toFixed(4))
    },
    questions,
    dimensions: {
      campaigns: campaignBuckets,
      adsets: buildDimensionOptions(rows, "adsetId", "adsetName"),
      creatives: buildDimensionOptions(rows, "creativeId", "creativeName"),
      selectedCampaignId: normalizedFilters.campaignId ?? null,
      selectedAdsetId: normalizedFilters.adsetId ?? null,
      selectedCreativeId: normalizedFilters.creativeId ?? null
    },
    tree: buildTree(rows)
  };
}

export function getDashboardLeadRows(
  db: DatabaseSync,
  filters: DashboardFilters
): DashboardLeadRow[] {
  const normalizedFilters = normalizeDashboardFilters(filters);
  return queryLeadRows(db, normalizedFilters);
}

function asOptionalString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  return value.length > 0 ? value : null;
}

function toOptionalNumber(input: unknown): number | null {
  if (typeof input !== "number") return null;
  return Number.isFinite(input) ? input : null;
}

function parseMetaCompound(
  value: string | null | undefined
): { name: string | null; id: string | null } {
  if (!value) return { name: null, id: null };
  const [namePart, idPart] = value.split("|");
  const name = namePart?.trim() || null;
  const id = idPart?.trim() || null;
  return { name, id };
}

type HotmartOriginAttribution = {
  source: string | null;
  campaignName: string | null;
  campaignId: string | null;
  adsetName: string | null;
  adsetId: string | null;
  creativeName: string | null;
  creativeId: string | null;
  placement: string | null;
};

function parseHotmartOriginAttribution(
  input: string | null | undefined
): HotmartOriginAttribution | null {
  const raw = asOptionalString(input);
  if (!raw) return null;

  const token = "hQwK21wXxR";
  const firstToken = raw.indexOf(token);
  const sourcePrefix =
    firstToken > 0 ? asOptionalString(raw.slice(0, firstToken)) : null;

  const segments = raw
    .split(token)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  const metaSegments = segments.filter((part) => part.includes("|"));
  const campaign = parseMetaCompound(metaSegments[0] ?? null);
  const adset = parseMetaCompound(metaSegments[1] ?? null);
  const creative = parseMetaCompound(metaSegments[2] ?? null);
  const placement = asOptionalString(segments[3] ?? null);

  const hasAnyMeta =
    campaign.name ||
    campaign.id ||
    adset.name ||
    adset.id ||
    creative.name ||
    creative.id ||
    placement ||
    sourcePrefix;

  if (!hasAnyMeta) return null;

  return {
    source: sourcePrefix,
    campaignName: campaign.name,
    campaignId: campaign.id,
    adsetName: adset.name,
    adsetId: adset.id,
    creativeName: creative.name,
    creativeId: creative.id,
    placement
  };
}

function toCompoundMeta(name: string | null, id: string | null): string | null {
  if (name && id) return `${name}|${id}`;
  return name ?? id ?? null;
}

function normalizeDashboardFilters(filters: DashboardFilters): DashboardFilters {
  return {
    startDate: normalizeDateFilterValue(filters.startDate),
    endDate: normalizeDateFilterValue(filters.endDate),
    experience: normalizeFilterValue(filters.experience),
    languageSkill: normalizeFilterValue(filters.languageSkill),
    englishLevel: normalizeFilterValue(filters.englishLevel),
    hasInternationalInterview: normalizeFilterValue(filters.hasInternationalInterview),
    internationalInterest: normalizeFilterValue(filters.internationalInterest),
    salaryRange: normalizeFilterValue(filters.salaryRange),
    campaignId: normalizeFilterValue(filters.campaignId),
    adsetId: normalizeFilterValue(filters.adsetId),
    creativeId: normalizeFilterValue(filters.creativeId)
  };
}

function normalizeFilterValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeDateFilterValue(value: string | null | undefined): string | null {
  const normalized = normalizeFilterValue(value);
  if (!normalized) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

type LeadRow = DashboardLeadRow & { hasSurvey: number };

function queryLeadRows(db: DatabaseSync, filters: DashboardFilters): LeadRow[] {
  const whereClauses: string[] = [];
  const params: Record<string, string | number> = {};

  const startEpoch = filters.startDate ? toStartOfDayEpoch(filters.startDate) : null;
  const endEpoch = filters.endDate ? toExclusiveEndOfDayEpoch(filters.endDate) : null;
  if (startEpoch !== null) {
    whereClauses.push("le.eventTs >= @startEpoch");
    params.startEpoch = startEpoch;
  }
  if (endEpoch !== null) {
    whereClauses.push("le.eventTs < @endEpoch");
    params.endEpoch = endEpoch;
  }

  addFilter(whereClauses, params, "sr.experience", "experience", filters.experience);
  addFilter(
    whereClauses,
    params,
    "sr.language_skill",
    "languageSkill",
    filters.languageSkill
  );
  addFilter(whereClauses, params, "sr.english_level", "englishLevel", filters.englishLevel);
  addFilter(
    whereClauses,
    params,
    "sr.has_international_interview",
    "hasInternationalInterview",
    filters.hasInternationalInterview
  );
  addFilter(
    whereClauses,
    params,
    "sr.international_interest",
    "internationalInterest",
    filters.internationalInterest
  );
  addFilter(whereClauses, params, "sr.salary_range", "salaryRange", filters.salaryRange);
  addFilter(whereClauses, params, "cs.campaign_id", "campaignId", filters.campaignId);
  addFilter(whereClauses, params, "cs.adset_id", "adsetId", filters.adsetId);
  addFilter(whereClauses, params, "cs.creative_id", "creativeId", filters.creativeId);

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const query = `
    WITH lead_events AS (
      SELECT
        hp.buyer_email AS email,
        COALESCE(hp.approved_at, hp.created_at) AS eventTs,
        hp.source_session_id AS sourceSessionId,
        hp.attribution_source AS attributionSource
      FROM hotmart_purchases hp
    )

    SELECT
      le.email AS email,
      COALESCE(sr.first_name, 'Lead') AS firstName,
      CASE WHEN sr.email IS NULL THEN 0 ELSE 1 END AS hasSurvey,
      COALESCE(sr.experience, 'Sem pesquisa') AS experience,
      COALESCE(sr.language_skill, 'Sem pesquisa') AS languageSkill,
      COALESCE(sr.english_level, 'Sem pesquisa') AS englishLevel,
      COALESCE(sr.has_international_interview, 'Sem pesquisa') AS hasInternationalInterview,
      COALESCE(sr.international_interest, 'Sem pesquisa') AS internationalInterest,
      COALESCE(sr.salary_range, 'Sem pesquisa') AS salaryRange,
      COALESCE(sr.lead_score, 0) AS leadScore,
      COALESCE(cs.campaign_id, 'desconhecido') AS campaignId,
      COALESCE(cs.campaign_name, cs.utm_campaign, 'desconhecido') AS campaignName,
      COALESCE(cs.adset_id, 'desconhecido') AS adsetId,
      COALESCE(cs.adset_name, cs.utm_medium, 'desconhecido') AS adsetName,
      COALESCE(cs.creative_id, 'desconhecido') AS creativeId,
      COALESCE(cs.creative_name, cs.utm_content, 'desconhecido') AS creativeName,
      COALESCE(cs.utm_source, '') AS utmSource,
      COALESCE(cs.utm_medium, '') AS utmMedium,
      COALESCE(cs.utm_campaign, '') AS utmCampaign,
      COALESCE(cs.utm_content, '') AS utmContent,
      COALESCE(cs.xcod, '') AS xcod,
      COALESCE(le.attributionSource, 'unknown') AS attributionSource
    FROM lead_events le
    LEFT JOIN survey_responses sr ON sr.email = le.email
    LEFT JOIN checkout_intents ci ON ci.id = (
      SELECT ci2.id
      FROM checkout_intents ci2
      WHERE ci2.email = le.email
      ORDER BY ci2.created_at DESC
      LIMIT 1
    )
    LEFT JOIN click_sessions cs ON cs.session_id = COALESCE(le.sourceSessionId, ci.session_id)
    ${whereSql}
  `;

  return db.prepare(query).all(params) as unknown as LeadRow[];
}

function buildDimensionOptions(
  rows: LeadRow[],
  idKey: "campaignId" | "adsetId" | "creativeId",
  nameKey: "campaignName" | "adsetName" | "creativeName"
): DimensionOption[] {
  const map = new Map<string, DimensionOption>();
  for (const row of rows) {
    const id = row[idKey] || "desconhecido";
    const name = row[nameKey] || "desconhecido";
    const existing = map.get(id);
    if (existing) {
      existing.count += 1;
      continue;
    }
    map.set(id, { id, name, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

function addFilter(
  whereClauses: string[],
  params: Record<string, string | number>,
  sqlField: string,
  paramKey: string,
  value: string | null | undefined
): void {
  if (!value) return;
  whereClauses.push(`${sqlField} = @${paramKey}`);
  params[paramKey] = value;
}

function toStartOfDayEpoch(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00.000Z`);
}

function toExclusiveEndOfDayEpoch(isoDate: string): number {
  const start = toStartOfDayEpoch(isoDate);
  return start + 24 * 60 * 60 * 1000;
}

function buildQuestion(
  key:
    | "experience"
    | "languageSkill"
    | "englishLevel"
    | "hasInternationalInterview"
    | "internationalInterest"
    | "salaryRange",
  title: string,
  selected: string | null | undefined,
  rows: LeadRow[]
): DashboardData["questions"][number] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = String(row[key] ?? "Não informado");
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const total = rows.length;
  const slices = [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      proportion: total === 0 ? 0 : Number((count / total).toFixed(4))
    }))
    .sort((a, b) => b.count - a.count);

  return {
    key,
    title,
    selected: selected ?? null,
    slices
  };
}

function buildTree(rows: LeadRow[]): TreeNode[] {
  const campaigns = new Map<string, TreeNode>();

  for (const row of rows) {
    const campaignKey = row.campaignId;
    const adsetKey = `${row.campaignId}::${row.adsetId}`;
    const creativeKey = `${row.campaignId}::${row.adsetId}::${row.creativeId}`;

    const campaign = ensureNode(
      campaigns,
      campaignKey,
      row.campaignName,
      row.leadScore
    );

    const adsetMap = getChildrenMap(campaign);
    const adset = ensureNode(adsetMap, adsetKey, row.adsetName, row.leadScore);
    pushChild(campaign, adsetMap, adset);

    const creativeMap = getChildrenMap(adset);
    const creative = ensureNode(creativeMap, creativeKey, row.creativeName, row.leadScore);
    pushChild(adset, creativeMap, creative);
  }

  return [...campaigns.values()].map(normalizeNode).sort(sortByLeadScoreSum);
}

function ensureNode(
  map: Map<string, TreeNode>,
  id: string,
  name: string,
  leadScore: number
): TreeNode {
  const existing = map.get(id);
  if (existing) {
    existing.leadCount += 1;
    existing.leadScoreSum += leadScore;
    return existing;
  }

  const created: TreeNode = {
    id,
    name,
    leadCount: 1,
    leadScoreSum: leadScore,
    leadScoreAvg: leadScore,
    children: []
  };
  map.set(id, created);
  return created;
}

const nodeChildMaps = new WeakMap<TreeNode, Map<string, TreeNode>>();

function getChildrenMap(node: TreeNode): Map<string, TreeNode> {
  const existing = nodeChildMaps.get(node);
  if (existing) return existing;
  const created = new Map<string, TreeNode>();
  nodeChildMaps.set(node, created);
  return created;
}

function pushChild(
  parent: TreeNode,
  childMap: Map<string, TreeNode>,
  child: TreeNode
): void {
  if (!parent.children.includes(child)) {
    parent.children.push(child);
  }
  childMap.set(child.id, child);
}

function normalizeNode(node: TreeNode): TreeNode {
  const avg = node.leadCount === 0 ? 0 : node.leadScoreSum / node.leadCount;
  return {
    ...node,
    leadScoreSum: Number(node.leadScoreSum.toFixed(2)),
    leadScoreAvg: Number(avg.toFixed(2)),
    children: node.children.map(normalizeNode).sort(sortByLeadScoreSum)
  };
}

function sortByLeadScoreSum(a: TreeNode, b: TreeNode): number {
  return b.leadScoreSum - a.leadScoreSum;
}

function isPaidLead(row: LeadRow): boolean {
  // Regra de negócio: códigos/prefixos "org*" identificam origem orgânica.
  if (isOrganicByOriginCode(row)) return false;

  return Boolean(
    row.utmSource.trim() ||
      row.utmMedium.trim() ||
      row.utmCampaign.trim() ||
      row.utmContent.trim() ||
      row.xcod.trim()
  );
}

function isOrganicByOriginCode(row: LeadRow): boolean {
  const source = row.utmSource.trim().toLowerCase();
  const xcod = row.xcod.trim().toLowerCase();
  return source.startsWith("org") || xcod.startsWith("org");
}

function getCampaignHeat(row: LeadRow): "PQ" | "PF" | "OTHER" {
  const campaign = row.campaignName.trim().toUpperCase();
  if (campaign.startsWith("PQ")) return "PQ";
  if (campaign.startsWith("PF")) return "PF";
  return "OTHER";
}
