import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import {
  getDashboard,
  getDashboardRows,
  getAttributionReport,
  ingestHotmartPayload,
  ingestSurvey,
  initializeDatabase,
  registerCheckoutIntent,
  registerClickSession
} from "../../core/src/index.js";
import type { DashboardFilters } from "../../core/src/types.js";

const port = Number(process.env.PORT ?? "3333");
const zipFrontendDistPath = path.resolve(
  process.cwd(),
  "tmp_ref",
  "lovable",
  "dist"
);
const dashboardConfigDbPath = path.resolve(process.cwd(), "data", "dashboard-config.db");
const authCookieName = "leadscore_auth";
const authSessionTtlSeconds = 60 * 60 * 24;
const allowedEmail = "contato@operacaocodigodeouro.com.br";
const allowedPassword = "Capivar@12334";
const authSessions = new Map<string, { email: string; expiresAt: number }>();

initializeDatabase();

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? "/", `http://localhost:${port}`);

    if (
      req.method === "GET" &&
      (requestUrl.pathname === "/" ||
        requestUrl.pathname === "/dashboard" ||
        requestUrl.pathname.startsWith("/assets/") ||
        requestUrl.pathname.endsWith(".js") ||
        requestUrl.pathname.endsWith(".css") ||
        requestUrl.pathname.endsWith(".svg") ||
        requestUrl.pathname.endsWith(".png") ||
        requestUrl.pathname.endsWith(".jpg"))
    ) {
      const served = serveZipFrontendAsset(requestUrl.pathname, res);
      if (served) return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/dashboard-classic") {
      respondHtml(
        res,
        200,
        "<h1>Dashboard clássico foi substituído pelo front do ZIP.</h1><p>Acesse <a href='/dashboard'>/dashboard</a>.</p>"
      );
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/auth/session") {
      const session = getValidSession(req);
      if (!session) {
        respondJson(res, 200, { authenticated: false });
        return;
      }
      respondJson(res, 200, { authenticated: true, email: session.email });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/auth/login") {
      const payload = await parseRequestBody(req);
      const email = asOptionalString(payload.email)?.toLowerCase();
      const password = asOptionalString(payload.password);
      if (email !== allowedEmail || password !== allowedPassword) {
        respondJson(res, 401, { error: "credenciais_invalidas" });
        return;
      }

      const token = crypto.randomUUID();
      const expiresAt = Date.now() + authSessionTtlSeconds * 1000;
      authSessions.set(token, { email, expiresAt });
      res.setHeader(
        "Set-Cookie",
        `${authCookieName}=${token}; HttpOnly; Path=/; Max-Age=${authSessionTtlSeconds}; SameSite=Lax`
      );
      respondJson(res, 200, { ok: true, email });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/auth/logout") {
      const token = parseCookies(req.headers.cookie)[authCookieName];
      if (token) authSessions.delete(token);
      res.setHeader(
        "Set-Cookie",
        `${authCookieName}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
      );
      respondJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/dashboard") {
      if (!requireAuth(req, res)) return;
      const filters: DashboardFilters = {
        startDate: requestUrl.searchParams.get("startDate"),
        endDate: requestUrl.searchParams.get("endDate"),
        experience: requestUrl.searchParams.get("experience"),
        languageSkill: requestUrl.searchParams.get("languageSkill"),
        englishLevel: requestUrl.searchParams.get("englishLevel"),
        hasInternationalInterview:
          requestUrl.searchParams.get("hasInternationalInterview"),
        internationalInterest: requestUrl.searchParams.get("internationalInterest"),
        salaryRange: requestUrl.searchParams.get("salaryRange"),
        campaignId: requestUrl.searchParams.get("campaignId"),
        adsetId: requestUrl.searchParams.get("adsetId"),
        creativeId: requestUrl.searchParams.get("creativeId")
      };
      respondJson(res, 200, getDashboard(filters));
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/dashboard/config") {
      if (!requireAuth(req, res)) return;
      respondJson(res, 200, { config: readDashboardConfig() });
      return;
    }

    if (
      (req.method === "POST" || req.method === "PUT") &&
      requestUrl.pathname === "/api/dashboard/config"
    ) {
      if (!requireAuth(req, res)) return;
      const payload = await parseRequestBody(req);
      const config = parseDashboardConfigPayload(payload);
      writeDashboardConfig(config);
      respondJson(res, 200, { ok: true, config });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/track-click") {
      const payload = await parseRequestBody(req);
      const click = parseTrackClickPayload(payload);
      registerClickSession(click);
      respondJson(res, 200, { ok: true, sessionId: click.sessionId });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/checkout-intent") {
      const payload = await parseRequestBody(req);
      const intent = parseCheckoutIntentPayload(payload);
      const checkoutUrl = buildCheckoutUrl(intent.baseUrl, intent.sessionId, intent.email);
      registerCheckoutIntent({
        sessionId: intent.sessionId,
        email: intent.email,
        checkoutUrl
      });
      respondJson(res, 200, { ok: true, checkoutUrl, sessionId: intent.sessionId });
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/dashboard.csv") {
      if (!requireAuth(req, res)) return;
      const filters: DashboardFilters = {
        startDate: requestUrl.searchParams.get("startDate"),
        endDate: requestUrl.searchParams.get("endDate"),
        experience: requestUrl.searchParams.get("experience"),
        languageSkill: requestUrl.searchParams.get("languageSkill"),
        englishLevel: requestUrl.searchParams.get("englishLevel"),
        hasInternationalInterview:
          requestUrl.searchParams.get("hasInternationalInterview"),
        internationalInterest: requestUrl.searchParams.get("internationalInterest"),
        salaryRange: requestUrl.searchParams.get("salaryRange"),
        campaignId: requestUrl.searchParams.get("campaignId"),
        adsetId: requestUrl.searchParams.get("adsetId"),
        creativeId: requestUrl.searchParams.get("creativeId")
      };
      const rows = getDashboardRows(filters);
      const csv = toCsv(rows);
      respondCsv(res, 200, csv, "dashboard-filtrado.csv");
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/dashboard/rows") {
      if (!requireAuth(req, res)) return;
      const filters: DashboardFilters = {
        startDate: requestUrl.searchParams.get("startDate"),
        endDate: requestUrl.searchParams.get("endDate"),
        experience: requestUrl.searchParams.get("experience"),
        languageSkill: requestUrl.searchParams.get("languageSkill"),
        englishLevel: requestUrl.searchParams.get("englishLevel"),
        hasInternationalInterview:
          requestUrl.searchParams.get("hasInternationalInterview"),
        internationalInterest: requestUrl.searchParams.get("internationalInterest"),
        salaryRange: requestUrl.searchParams.get("salaryRange"),
        campaignId: requestUrl.searchParams.get("campaignId"),
        adsetId: requestUrl.searchParams.get("adsetId"),
        creativeId: requestUrl.searchParams.get("creativeId")
      };
      respondJson(res, 200, { rows: getDashboardRows(filters) });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/webhook/hotmart") {
      const payload = await parseRequestBody(req);
      ingestHotmartPayload(payload);
      respondJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/survey") {
      const payload = await parseRequestBody(req);
      ingestSurvey(payload);
      respondJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/webhook/formulario-obrigado") {
      const payload = await parseRequestBody(req);
      ingestSurvey(payload);
      respondJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/report") {
      if (!requireAuth(req, res)) return;
      respondJson(res, 200, getAttributionReport());
      return;
    }

    respondJson(res, 404, { error: "not_found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro_interno";
    respondJson(res, 500, { error: message });
  }
});

server.listen(port, () => {
  console.log(`Webhook server local ouvindo em http://localhost:${port}`);
});

async function parseRequestBody(
  req: http.IncomingMessage
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const content = Buffer.concat(chunks).toString("utf8");
  if (!content) return {};

  const contentType = String(req.headers["content-type"] ?? "").toLowerCase();
  if (contentType.includes("application/json")) {
    return JSON.parse(content) as Record<string, unknown>;
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(content).entries());
  }

  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return Object.fromEntries(new URLSearchParams(content).entries());
  }
}

function respondJson(
  res: http.ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function respondHtml(
  res: http.ServerResponse,
  statusCode: number,
  payload: string
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(payload);
}

function serveZipFrontendAsset(
  requestPath: string,
  res: http.ServerResponse
): boolean {
  if (!fs.existsSync(zipFrontendDistPath)) {
    respondHtml(
      res,
      503,
      "Frontend do ZIP ainda não buildado. Rode: npm run frontend:zip:install && npm run frontend:zip:build"
    );
    return true;
  }

  const normalizedPath =
    requestPath === "/" || requestPath === "/dashboard"
      ? "/index.html"
      : requestPath.replace("/dashboard", "") || "/index.html";

  const filePath = path.normalize(path.join(zipFrontendDistPath, normalizedPath));
  if (!filePath.startsWith(path.normalize(zipFrontendDistPath))) {
    respondJson(res, 400, { error: "invalid_path" });
    return true;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const fallback = path.join(zipFrontendDistPath, "index.html");
    if (!fs.existsSync(fallback)) {
      respondJson(res, 404, { error: "frontend_not_found" });
      return true;
    }
    respondFile(res, fallback);
    return true;
  }

  respondFile(res, filePath);
  return true;
}

function respondFile(res: http.ServerResponse, filePath: string): void {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
  };
  res.statusCode = 200;
  res.setHeader("Content-Type", mimeTypes[extension] ?? "application/octet-stream");
  res.end(fs.readFileSync(filePath));
}

function respondCsv(
  res: http.ServerResponse,
  statusCode: number,
  payload: string,
  fileName: string
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.end(payload);
}

function toCsv<T extends object>(rows: T[]): string {
  if (rows.length === 0) {
    return "sem_dados\n";
  }
  const headers = Object.keys(rows[0]) as Array<keyof T>;
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((header) =>
      escapeCsv(String((row[header] as unknown) ?? ""))
    );
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

type DashboardConfig = {
  startDate: string;
  endDate: string;
  leadGoal: number;
};

type TrackClickPayload = {
  sessionId: string;
  landingUrl: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  adId: string | null;
  adsetId: string | null;
  campaignId: string | null;
  creativeId: string | null;
  xcod: string | null;
  fbclid: string | null;
  gclid: string | null;
  ttclid: string | null;
};

type CheckoutIntentPayload = {
  baseUrl: string;
  sessionId: string;
  email: string | null;
};

function readDashboardConfig(): DashboardConfig | null {
  if (!fs.existsSync(dashboardConfigDbPath)) return null;

  const db = new DatabaseSync(dashboardConfigDbPath);
  ensureDashboardConfigSchema(db);
  const row = db
    .prepare(
      "SELECT start_date as startDate, end_date as endDate, lead_goal as leadGoal FROM dashboard_config WHERE id = 1"
    )
    .get() as DashboardConfig | undefined;
  db.close();
  return row ?? null;
}

function writeDashboardConfig(config: DashboardConfig): void {
  const parentDir = path.dirname(dashboardConfigDbPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  for (const suffix of ["", "-wal", "-shm"]) {
    const candidate = `${dashboardConfigDbPath}${suffix}`;
    if (fs.existsSync(candidate)) {
      fs.rmSync(candidate, { force: true });
    }
  }

  const db = new DatabaseSync(dashboardConfigDbPath);
  ensureDashboardConfigSchema(db);
  db.prepare(
    "INSERT INTO dashboard_config (id, start_date, end_date, lead_goal, updated_at) VALUES (1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET start_date = excluded.start_date, end_date = excluded.end_date, lead_goal = excluded.lead_goal, updated_at = excluded.updated_at"
  ).run(config.startDate, config.endDate, config.leadGoal, Date.now());
  db.close();
}

function ensureDashboardConfigSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      lead_goal INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

function parseDashboardConfigPayload(payload: Record<string, unknown>): DashboardConfig {
  const startDate = String(payload.startDate ?? "");
  const endDate = String(payload.endDate ?? "");
  const leadGoal = Number(payload.leadGoal);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("startDate_invalida");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error("endDate_invalida");
  }
  if (Number.isNaN(leadGoal) || leadGoal < 0) {
    throw new Error("leadGoal_invalida");
  }

  const normalizedLeadGoal = Math.floor(leadGoal);
  if (startDate <= endDate) {
    return { startDate, endDate, leadGoal: normalizedLeadGoal };
  }
  return { startDate: endDate, endDate: startDate, leadGoal: normalizedLeadGoal };
}

function parseTrackClickPayload(payload: Record<string, unknown>): TrackClickPayload {
  const sessionId = asOptionalString(payload.sessionId) ?? asOptionalString(payload.session_id) ?? crypto.randomUUID();
  const landingUrl = asOptionalString(payload.landingUrl) ?? asOptionalString(payload.landing_url);
  if (!landingUrl) {
    throw new Error("landingUrl_obrigatoria");
  }

  const query = new URL(landingUrl, "http://localhost").searchParams;

  return {
    sessionId,
    landingUrl,
    utmSource: readTrackingValue(payload, query, "utmSource", "utm_source"),
    utmMedium: readTrackingValue(payload, query, "utmMedium", "utm_medium"),
    utmCampaign: readTrackingValue(payload, query, "utmCampaign", "utm_campaign"),
    utmContent: readTrackingValue(payload, query, "utmContent", "utm_content"),
    utmTerm: readTrackingValue(payload, query, "utmTerm", "utm_term"),
    adId: readTrackingValue(payload, query, "adId", "ad_id"),
    adsetId: readTrackingValue(payload, query, "adsetId", "adset_id"),
    campaignId: readTrackingValue(payload, query, "campaignId", "campaign_id"),
    creativeId: readTrackingValue(payload, query, "creativeId", "creative_id"),
    xcod: readTrackingValue(payload, query, "xcod", "xcod"),
    fbclid: readTrackingValue(payload, query, "fbclid", "fbclid"),
    gclid: readTrackingValue(payload, query, "gclid", "gclid"),
    ttclid: readTrackingValue(payload, query, "ttclid", "ttclid")
  };
}

function parseCheckoutIntentPayload(payload: Record<string, unknown>): CheckoutIntentPayload {
  const baseUrl = asOptionalString(payload.baseUrl) ?? asOptionalString(payload.base_url);
  if (!baseUrl) {
    throw new Error("baseUrl_obrigatoria");
  }
  const sessionId = asOptionalString(payload.sessionId) ?? asOptionalString(payload.session_id);
  if (!sessionId) {
    throw new Error("sessionId_obrigatoria");
  }

  return {
    baseUrl,
    sessionId,
    email: asOptionalString(payload.email)
  };
}

function readTrackingValue(
  payload: Record<string, unknown>,
  query: URLSearchParams,
  camelKey: string,
  snakeKey: string
): string | null {
  return asOptionalString(payload[camelKey]) ?? asOptionalString(payload[snakeKey]) ?? asOptionalString(query.get(snakeKey));
}

function buildCheckoutUrl(baseUrl: string, sessionId: string, email: string | null): string {
  const url = new URL(baseUrl);
  url.searchParams.set("src", sessionId);
  if (email) {
    url.searchParams.set("email", email);
  }
  return url.toString();
}

function asOptionalString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  return value.length > 0 ? value : null;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join("="));
  }
  return cookies;
}

function getValidSession(
  req: http.IncomingMessage
): { email: string; expiresAt: number } | null {
  const token = parseCookies(req.headers.cookie)[authCookieName];
  if (!token) return null;
  const session = authSessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    authSessions.delete(token);
    return null;
  }
  return session;
}

function requireAuth(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  const session = getValidSession(req);
  if (session) return true;
  respondJson(res, 401, { error: "unauthorized" });
  return false;
}
