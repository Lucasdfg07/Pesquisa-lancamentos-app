# Story 1.1: Pipeline Local de Leadscore e Atribuição Hotmart

**Epic:** MVP de Atribuição e Qualificação de Leads  
**Story ID:** 1.1  
**Sprint:** 1  
**Priority:** 🔴 Critical  
**Points:** 8  
**Effort:** 8-12 horas  
**Status:** ✅ Done  
**Type:** 💻 Feature

---

## 🔀 Cross-Story Decisions

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| CLI First, local-first | Constitution + AGENTS | Implementação sem dependência de cloud |

---

## 📋 User Story

**Como** responsável pelo lançamento,  
**Quero** atribuir cada compra e resposta de pesquisa ao criativo/campanha de origem,  
**Para** entender quais anúncios trazem leads mais qualificados e com maior receita.

---

## 🎯 Objective

Implementar um app local com SQLite para rastrear sessões de clique, registrar tentativas de checkout, processar webhook da Hotmart e respostas da pesquisa, calcular lead score e gerar relatório de atribuição por criativo.

---

## ✅ Tasks

### Phase 1: Base do projeto (2h)

- [x] **1.1** Criar estrutura AIOS esperada (`bin/`, `packages/`, `tests/`, `docs/stories/`)
- [x] **1.2** Configurar scripts (`lint`, `typecheck`, `test`, CLI e webhook server)

### Phase 2: Domínio e persistência local (3h)

- [x] **2.1** Implementar schema SQLite local
- [x] **2.2** Implementar ingestão de click session, checkout intent e compra Hotmart
- [x] **2.3** Implementar ingestão de pesquisa e cálculo de lead score

### Phase 3: Interfaces CLI/HTTP e relatório (3h)

- [x] **3.1** Expor comandos de CLI para operação ponta a ponta
- [x] **3.2** Expor servidor local para webhook da Hotmart e endpoint da pesquisa
- [x] **3.3** Expor relatório de atribuição por criativo

### Phase 4: Qualidade e documentação (2h)

- [x] **4.1** Criar testes de integração básicos do fluxo principal
- [x] **4.2** Executar quality gates (`lint`, `typecheck`, `test`)
- [x] **4.3** Atualizar status, checklist final e file list

### Phase 5: Dashboard interativo (4h)

- [x] **5.1** Expor endpoint de dados com filtros dinâmicos por respostas da pesquisa
- [x] **5.2** Implementar dashboard com gráficos de pizza clicáveis por pergunta
- [x] **5.3** Implementar árvore visual campanha → conjunto → criativo com total de leadscore

---

## 🎯 Acceptance Criteria

```gherkin
GIVEN um clique com UTM e creative_id registrado
WHEN uma compra da Hotmart é recebida para o mesmo lead
THEN o sistema atribui a compra ao session_id/creative correspondente
AND persiste os dados em banco local SQLite

GIVEN uma resposta da pesquisa de obrigado
WHEN o sistema processa essa resposta
THEN calcula lead score e qualificação
AND permite relatório de score médio e receita por criativo
```

---

## 📋 Definition of Done

- [x] Fluxo completo funciona via CLI
- [x] Webhook server local funcional
- [x] Banco SQLite local persistindo dados
- [x] Relatório de atribuição retornando dados esperados
- [x] Dashboard com filtros cruzados por clique em fatias
- [x] Árvore visual com agregação de leadscore por campanha, conjunto e criativo
- [x] `npm run lint` sem erros
- [x] `npm run typecheck` sem erros
- [x] `npm test` sem falhas
- [x] File List atualizada

---

## 🧑‍💻 Dev Agent Record

### Execution Log

| Timestamp | Phase | Action | Result |
|-----------|-------|--------|--------|
| 2026-02-28 | 1-3 | Implementação inicial do MVP local-first | ✅ |
| 2026-02-28 | 4 | Execução dos quality gates e validação final | ✅ |
| 2026-02-28 | 5 | Dashboard interativo com filtros dinâmicos e árvore de leads | ✅ |

### Implementation Notes

- Banco local em `data/leadscore.db` com tabelas de click, checkout, compras e survey.
- Atribuição por prioridade: `src` no payload; fallback por email via `checkout_intents`.
- Leadscore calculado a partir das respostas chave da pesquisa.
- Quality gates executados: `lint`, `typecheck`, `test`.
- Dashboard com 6 gráficos de pizza (perguntas fechadas) e filtros cruzados por clique.
- Árvore de leads filtrados com score total/médio por campanha, conjunto e criativo.
- Filtros por campanha, conjunto e criativo no topo com seleção dinâmica.
- Persistência de filtros na URL para compartilhamento de visão.
- Exportação CSV do recorte filtrado via endpoint dedicado.

### Issues Encountered

- N/A.

---

## 📜 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-28 | 1.0.0 | Story criada e implementação MVP iniciada | @dev |
| 2026-02-28 | 1.1.0 | MVP concluído com testes e quality gates | @dev |
| 2026-02-28 | 1.2.0 | Dashboard interativo adicionado com filtros dinâmicos | @dev |
| 2026-02-28 | 1.3.0 | Filtros dimensionais, CSV e URL state no dashboard | @dev |

---

## File List

- `package.json`
- `tsconfig.json`
- `README.md`
- `package-lock.json`
- `bin/leadscore.ts`
- `packages/core/src/types.ts`
- `packages/core/src/db.ts`
- `packages/core/src/leadscore.ts`
- `packages/core/src/repository.ts`
- `packages/core/src/survey-parser.ts`
- `packages/core/src/index.ts`
- `packages/cli/src/index.ts`
- `packages/server/src/index.ts`
- `packages/server/src/dashboard.html`
- `tests/flow.test.ts`
- `vitest.config.ts`
- `docs/stories/story-1.1-leadscore-hotmart-local.md`
