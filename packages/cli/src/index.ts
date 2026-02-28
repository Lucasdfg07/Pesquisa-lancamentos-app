import fs from "node:fs";
import crypto from "node:crypto";
import {
  getAttributionReport,
  ingestHotmartPayload,
  ingestSurvey,
  initializeDatabase,
  registerCheckoutIntent,
  registerClickSession
} from "../../core/src/index.js";

function main(): void {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  switch (command) {
    case "init":
      initializeDatabase();
      console.log("Banco local inicializado com sucesso.");
      return;
    case "track-click":
      handleTrackClick(args);
      return;
    case "build-checkout-url":
      handleBuildCheckoutUrl(args);
      return;
    case "ingest-hotmart":
      handleIngestHotmart(args);
      return;
    case "ingest-survey":
      handleIngestSurvey(args);
      return;
    case "report":
      handleReport();
      return;
    default:
      throw new Error(`Comando inválido: ${command}`);
  }
}

function handleTrackClick(args: string[]): void {
  const landingUrl = getArg(args, "--landing-url");
  const query = getArg(args, "--query");
  const sessionId = getArg(args, "--session-id", crypto.randomUUID());
  const params = new URLSearchParams(query);

  registerClickSession({
    sessionId,
    landingUrl,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content"),
    utmTerm: params.get("utm_term"),
    adId: params.get("ad_id"),
    adsetId: params.get("adset_id"),
    campaignId: params.get("campaign_id"),
    creativeId: params.get("creative_id"),
    xcod: params.get("xcod"),
    fbclid: params.get("fbclid"),
    gclid: params.get("gclid"),
    ttclid: params.get("ttclid")
  });

  console.log(`Click registrado. session_id=${sessionId}`);
}

function handleBuildCheckoutUrl(args: string[]): void {
  const baseUrl = getArg(args, "--base-url");
  const sessionId = getArg(args, "--session-id");
  const email = getArg(args, "--email", "");
  const url = new URL(baseUrl);

  url.searchParams.set("src", sessionId);
  if (email) {
    url.searchParams.set("email", email);
  }

  registerCheckoutIntent({
    sessionId,
    email: email || null,
    checkoutUrl: url.toString()
  });

  console.log(url.toString());
}

function handleIngestHotmart(args: string[]): void {
  const filePath = getArg(args, "--file");
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;
  ingestHotmartPayload(payload);
  console.log("Payload da Hotmart processado.");
}

function handleIngestSurvey(args: string[]): void {
  const filePath = getArg(args, "--file");
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;
  ingestSurvey(payload);
  console.log("Resposta da pesquisa processada.");
}

function handleReport(): void {
  const report = getAttributionReport();
  if (report.length === 0) {
    console.log("Sem dados para relatório.");
    return;
  }

  console.table(report);
}

function getArg(args: string[], key: string, fallback?: string): string {
  const index = args.indexOf(key);
  if (index === -1) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Parâmetro obrigatório ausente: ${key}`);
  }
  const value = args[index + 1];
  if (!value) {
    throw new Error(`Valor ausente para parâmetro: ${key}`);
  }
  return value;
}

function printHelp(): void {
  console.log(`
Leadscore CLI (local-first)

Comandos:
  init
  track-click --landing-url <url> --query "<utm...>" [--session-id <id>]
  build-checkout-url --base-url <hotmart_url> --session-id <id> [--email <email>]
  ingest-hotmart --file <payload.json>
  ingest-survey --file <resposta.json>
  report
`);
}

main();
