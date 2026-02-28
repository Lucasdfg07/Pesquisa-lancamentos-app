export function calculateLeadScore(input: {
  experience: string;
  languageSkill: string;
  englishLevel: string;
  hasInternationalInterview: string;
  internationalInterest: string;
  salaryRange: string;
}): number {
  let score = 0;

  // Modelo calibrado para total 100 pontos:
  // Experiência(25) + Motivação(20) + Entrevista(20) + Inglês(18) + Linguagem(10) + Salário(7)
  score += mapExperience(input.experience); // 0..25
  score += mapInternationalInterest(input.internationalInterest); // 0..20
  score += mapInterview(input.hasInternationalInterview); // 0..20
  score += mapEnglishLevel(input.englishLevel); // 0..18
  score += mapLanguageSkill(input.languageSkill); // 0..10
  score += mapSalary(input.salaryRange); // 0..7

  return Math.max(0, Math.min(100, score));
}

export function getLeadQualification(score: number): "quente" | "morno" | "frio" {
  if (score >= 80) return "quente";
  if (score >= 40) return "morno";
  return "frio";
}

function mapExperience(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized.includes("mais de 1 ano")) return 25;
  if (normalized.includes("trabalho há 1 ano") || normalized === "trabalho há 1 ano")
    return 22;
  if (normalized.includes("6 meses")) return 14;
  if (normalized.includes("estágio")) return 10;
  if (normalized.includes("nunca")) return 0;
  return 8;
}

function mapLanguageSkill(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized.includes("domino bem")) return 10;
  if (normalized.includes("ainda estou aprendendo")) return 7;
  if (normalized.includes("conheço o básico")) return 4;
  if (normalized.includes("começando")) return 2;
  if (normalized.includes("nunca programei")) return 0;
  return 3;
}

function mapEnglishLevel(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized.includes("avançado") || normalized.includes("fluente")) return 18;
  if (normalized.includes("intermediário")) return 12;
  if (normalized.includes("básico")) return 7;
  if (normalized.includes("iniciante")) return 0;
  if (normalized.includes("não falo inglês")) return 0;
  return 6;
}

function mapInterview(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized.includes("regularmente")) return 20;
  if (normalized.includes("algumas vezes")) return 16;
  if (normalized.includes("só uma vez")) return 13;
  if (normalized.includes("sempre tive vontade")) return 8;
  if (normalized.includes("primeira vez")) return 0;
  return 6;
}

function mapInternationalInterest(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized.includes("muito motivado")) return 20;
  if (normalized.includes("interessado")) return 15;
  if (normalized.includes("curioso")) return 8;
  if (normalized.includes("não tenho interesse")) return 0;
  return 7;
}

function mapSalary(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized.includes("abaixo")) return 1;
  if (normalized.includes("6.000") || normalized.includes("ou mais")) return 7;
  if (normalized.includes("4.000")) return 5;
  if (normalized.includes("2.000")) return 3;
  return 2;
}
