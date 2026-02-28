# Leadscore Dash (Local-First)

App CLI-first para:
- rastrear origem de lead por criativo/campanha (UTM + session_id);
- processar webhook da Hotmart;
- processar respostas da pesquisa da página de obrigado;
- calcular lead score e qualificação (`quente`, `morno`, `frio`);
- gerar relatório de receita por criativo;
- exibir dashboard com gráficos de pizza dinâmicos por respostas do formulário.

## Stack

- Node.js + TypeScript
- SQLite local (`node:sqlite`)
- CLI (`packages/cli`)
- Webhook server local (`packages/server`)

## Fluxo recomendado

1. Capturar UTMs na LP e gerar `session_id`.
2. Chamar:
   - `npm run cli -- track-click --landing-url "<url>" --query "<querystring-utm>"`
3. Montar link Hotmart com `src=session_id`:
   - `npm run cli -- build-checkout-url --base-url "<hotmart-url>" --session-id "<session_id>" --email "<email-opcional>"`
4. Receber compra:
   - `POST /webhook/hotmart` (ou `ingest-hotmart --file`)
5. Receber pesquisa:
   - `POST /survey` (ou `ingest-survey --file`)
6. Gerar analytics:
   - `npm run cli -- report`
7. Abrir dashboard:
   - `http://localhost:3333/dashboard`

## Comandos

```bash
npm install
npm run cli -- init
npm run frontend:zip:install
npm run frontend:zip:build
npm run serve:webhook
# abra http://localhost:3333/dashboard (frontend do ZIP)
```

### CLI

```bash
npm run cli -- track-click --landing-url "https://seusite.com" --query "utm_source=meta&utm_campaign=bootcamp&utm_content=criativo_17&creative_id=17"
npm run cli -- build-checkout-url --base-url "https://pay.hotmart.com/ABC123" --session-id "<id>" --email "lead@email.com"
npm run cli -- ingest-hotmart --file "./payload-hotmart.json"
npm run cli -- ingest-survey --file "./resposta-pesquisa.json"
npm run cli -- report
```

## Banco local

- arquivo padrão: `data/leadscore.db`
- pode customizar com:
  - `LEADSCORE_DB_PATH=./data/dev.db`

## Endpoints Web (produção)

- `POST /api/track-click`
  - registra clique da LP com `sessionId`, `landingUrl` e UTMs
- `POST /api/checkout-intent`
  - recebe `baseUrl` da Hotmart + `sessionId` (+ `email` opcional)
  - retorna URL de checkout pronta com `src=sessionId`

Exemplo rápido na LP:

```js
const sessionId = localStorage.getItem("lead_session_id") || crypto.randomUUID();
localStorage.setItem("lead_session_id", sessionId);

await fetch("/api/track-click", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId,
    landingUrl: window.location.href
  })
});

async function goToCheckout() {
  const resp = await fetch("/api/checkout-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      baseUrl: "https://pay.hotmart.com/SEU_CHECKOUT",
      email: document.querySelector("#email")?.value || null
    })
  });
  const data = await resp.json();
  window.location.href = data.checkoutUrl;
}
```
