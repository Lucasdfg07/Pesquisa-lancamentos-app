import type { SurveyInput } from "./types.js";

const FIELD_MAP = {
  firstName: "1. Qual é o seu primeiro nome?",
  email: "2. Deixe seu melhor e-mail",
  experience: "3. Há quanto tempo você trabalha como programador?",
  languageSkill: "4. Você já domina alguma linguagem de programação?",
  englishLevel: "5. Qual o seu Nível de Inglês?",
  hasInternationalInterview: "6. Você já fez alguma entrevista internacional?",
  internationalInterest:
    "7. Como você se sente em relação a trabalhar para empresas internacionais?",
  salaryRange: "8. Qual é a sua faixa salarial?",
  helpText: "9. Como eu posso te ajudar com o Bootcamp Dev na Gringa?",
  helpTextAlt: "Como eu posso te ajudar com o Bootcamp Dev na Gringa?",
  testEmail: "E-mail (teste)",
  formId: "form_id",
  formName: "form_name",
  sentDate: "Data Enviada"
} as const;

export function parseSurveyPayload(payload: Record<string, unknown>): SurveyInput {
  const source = extractSurveySource(payload);
  const firstName = readOptionalField(source, [FIELD_MAP.firstName], "firstName");
  const email = readField(source, [FIELD_MAP.email], "email");
  const experience = readField(source, [FIELD_MAP.experience], "experience");
  const languageSkill = readField(source, [FIELD_MAP.languageSkill], "languageSkill");
  const englishLevel = readField(source, [FIELD_MAP.englishLevel], "englishLevel");
  const hasInternationalInterview = readField(
    source,
    [FIELD_MAP.hasInternationalInterview],
    "hasInternationalInterview"
  );
  const internationalInterest = readField(
    source,
    [FIELD_MAP.internationalInterest],
    "internationalInterest"
  );
  const salaryRange = readField(source, [FIELD_MAP.salaryRange], "salaryRange");
  const helpText =
    readOptionalField(source, [FIELD_MAP.helpText, FIELD_MAP.helpTextAlt], "helpText") ??
    "Sem observações";
  const testEmail = readOptionalField(source, [FIELD_MAP.testEmail], "testEmail");
  const formId = readOptionalField(source, [FIELD_MAP.formId], "formId");
  const formName = readOptionalField(source, [FIELD_MAP.formName], "formName");
  const submittedAt = parseDate(source[FIELD_MAP.sentDate]);

  return {
    email,
    firstName,
    experience,
    languageSkill,
    englishLevel,
    hasInternationalInterview,
    internationalInterest,
    salaryRange,
    helpText,
    testEmail,
    formId,
    formName,
    rawBodyJson: stringifyJsonSafe(source),
    submittedAt
  };
}

function extractSurveySource(payload: Record<string, unknown>): Record<string, unknown> {
  const nestedBody = payload.body;
  if (nestedBody && typeof nestedBody === "object") {
    return nestedBody as Record<string, unknown>;
  }
  return payload;
}

function readField(
  payload: Record<string, unknown>,
  keys: string[],
  fallbackKey: string
): string {
  const value = readOptionalField(payload, keys, fallbackKey);
  if (value) return value;

  throw new Error(`Campo obrigatório ausente na pesquisa: ${keys[0]}`);
}

function readOptionalField(
  payload: Record<string, unknown>,
  keys: string[],
  fallbackKey: string
): string | null {
  for (const key of keys) {
    const primary = payload[key];
    if (typeof primary === "string" && primary.trim()) return primary.trim();

    const normalizedMatch = readByNormalizedKey(payload, key);
    if (normalizedMatch) return normalizedMatch;
  }

  const fallback = payload[fallbackKey];
  if (typeof fallback === "string" && fallback.trim()) return fallback.trim();

  return null;
}

function readByNormalizedKey(payload: Record<string, unknown>, key: string): string | null {
  const normalizedTarget = normalizeKey(key);
  for (const [candidateKey, candidateValue] of Object.entries(payload)) {
    if (normalizeKey(candidateKey) !== normalizedTarget) continue;
    if (typeof candidateValue === "string" && candidateValue.trim()) {
      return candidateValue.trim();
    }
  }
  return null;
}

function normalizeKey(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function stringifyJsonSafe(input: Record<string, unknown>): string | null {
  try {
    return JSON.stringify(input);
  } catch {
    return null;
  }
}

function parseDate(value: unknown): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}
