import { createDb, initSchema } from "./db.js";
import {
  addCheckoutIntent,
  addOrUpdatePurchase,
  addOrUpdateSurvey,
  getDashboardData,
  getDashboardLeadRows,
  listAttributionReport,
  upsertClickSession
} from "./repository.js";
import { parseSurveyPayload } from "./survey-parser.js";
import type {
  DashboardFilters,
  CheckoutIntentInput,
  ClickSessionInput,
  SurveyInput
} from "./types.js";

export function initializeDatabase(): void {
  const db = createDb();
  initSchema(db);
  db.close();
}

export function registerClickSession(input: ClickSessionInput): void {
  const db = createDb();
  initSchema(db);
  upsertClickSession(db, input);
  db.close();
}

export function registerCheckoutIntent(input: CheckoutIntentInput): void {
  const db = createDb();
  initSchema(db);
  addCheckoutIntent(db, input);
  db.close();
}

export function ingestHotmartPayload(payload: Record<string, unknown>): void {
  const db = createDb();
  initSchema(db);
  addOrUpdatePurchase(db, payload);
  db.close();
}

export function ingestSurvey(data: SurveyInput | Record<string, unknown>): void {
  const db = createDb();
  initSchema(db);
  const normalized = isSurveyInput(data) ? data : parseSurveyPayload(data);
  addOrUpdateSurvey(db, normalized);
  db.close();
}

export function getAttributionReport() {
  const db = createDb();
  initSchema(db);
  const report = listAttributionReport(db);
  db.close();
  return report;
}

export function getDashboard(filters: DashboardFilters) {
  const db = createDb();
  initSchema(db);
  const dashboard = getDashboardData(db, filters);
  db.close();
  return dashboard;
}

export function getDashboardRows(filters: DashboardFilters) {
  const db = createDb();
  initSchema(db);
  const rows = getDashboardLeadRows(db, filters);
  db.close();
  return rows;
}

function isSurveyInput(data: unknown): data is SurveyInput {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.email === "string" &&
    typeof obj.experience === "string" &&
    typeof obj.languageSkill === "string" &&
    typeof obj.englishLevel === "string" &&
    typeof obj.hasInternationalInterview === "string" &&
    typeof obj.internationalInterest === "string" &&
    typeof obj.salaryRange === "string" &&
    typeof obj.helpText === "string"
  );
}
