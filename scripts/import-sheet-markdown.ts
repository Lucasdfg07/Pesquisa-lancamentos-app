import fs from "node:fs";
import path from "node:path";
import { ingestSurvey, initializeDatabase } from "../packages/core/src/index.js";

type RawRow = {
  submittedAt: string;
  email: string;
  experience: string;
  languageSkill: string;
  englishLevel: string;
  hasInternationalInterview: string;
  internationalInterest: string;
  salaryRange: string;
  helpText: string;
};

function main(): void {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Uso: npx tsx scripts/import-sheet-markdown.ts <arquivo.txt>");
  }

  const absolutePath = path.resolve(inputPath);
  const content = fs.readFileSync(absolutePath, "utf8");

  const rows = parseRows(content);
  initializeDatabase();

  let imported = 0;
  for (const row of rows) {
    if (!row.email) continue;
    ingestSurvey({
      email: row.email,
      experience: row.experience || "Não informado",
      languageSkill: row.languageSkill || "Não informado",
      englishLevel: row.englishLevel || "Não informado",
      hasInternationalInterview: row.hasInternationalInterview || "Não informado",
      internationalInterest: row.internationalInterest || "Não informado",
      salaryRange: row.salaryRange || "Não informado",
      helpText: row.helpText || "Sem resposta",
      submittedAt: Date.parse(row.submittedAt) || Date.now()
    });
    imported += 1;
  }

  console.log(`Importação concluída. Registros processados: ${rows.length}. Importados: ${imported}.`);
}

function parseRows(content: string): RawRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("| ") && !line.startsWith("| ---"));

  const dataLines = lines.filter((line) => !line.includes("Data Enviada"));
  const rows: RawRow[] = [];

  for (const line of dataLines) {
    const columns = line
      .split("|")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (columns.length < 9) continue;

    rows.push({
      submittedAt: columns[0] ?? "",
      email: columns[2] ?? "",
      experience: columns[3] ?? "",
      languageSkill: columns[4] ?? "",
      englishLevel: columns[5] ?? "",
      hasInternationalInterview: columns[6] ?? "",
      internationalInterest: columns[7] ?? "",
      salaryRange: columns[8] ?? "",
      helpText: columns[9] ?? "Sem resposta"
    });
  }

  return rows;
}

main();
