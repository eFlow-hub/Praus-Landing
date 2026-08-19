# PRAUS Landing

Landing de captação de beta da PRAUS (skill-based matchmaking para gaming BR).
Objetivo único da página: entrada na waitlist (captura de e-mail).

## Diretrizes de comportamento

1. **Pense antes de codar** — declare suposições explicitamente. Se houver mais
   de uma interpretação razoável, apresente as opções em vez de escolher calado.
   Se algo estiver genuinamente incerto, pare e pergunte.
2. **Simplicidade primeiro** — o mínimo de código que resolve. Sem feature
   especulativa, sem abstração para código de uso único, sem configurabilidade
   não pedida. O front é vanilla **de propósito** — nunca proponha framework,
   bundler ou build step.
3. **Mudanças cirúrgicas** — toque só no que o pedido exige. Siga o estilo
   existente. Não refatore nem "melhore" código vizinho fora do escopo.
4. **Execução orientada a objetivo** — transforme tarefas em metas verificáveis
   (ex.: "corrigir o bug" vira "reproduzir → corrigir → verificar rodando").
   Em trabalho multi-etapa, apresente um plano curto com verificação por passo.
5. **Delegação consciente de custo** — a sessão principal implementa tarefas
   simples diretamente. Delegue a subagente APENAS quando: (a) a investigação
   geraria muito ruído no contexto principal, (b) há paralelismo genuíno sem
   arquivos em comum, ou (c) a tarefa exige checklist especialista (ex.:
   revisão de segurança). Subagente custa 3–10x mais tokens — use com critério.

## Nível de modelo por tarefa

- **Haiku** — busca/grep, edição mecânica 100% especificada, tarefas triviais.
- **Sonnet** — padrão para implementação, debug e revisão comuns.
- **Opus/topo** — só decisão de arquitetura genuinamente difícil, nunca volume.

Ao despachar subagente, declare o modelo explicitamente — nunca herde por acidente.

## Stack

- **Front:** HTML + CSS + JS puros, sem build. Google Fonts; clipe via embed YouTube.
- **Back:** Node ≥20 / Express 5 em `server/`, PostgreSQL (pg), Resend p/ notificação.
- **Deploy:** nginx (ou Caddy) serve estáticos e faz proxy de `/api`; Docker disponível.
- **Tooling:** `tools/gerar-marca.py` (Python) regera `assets/brand/` do logo mestre.

## Comandos canônicos

Sempre use exatamente estes — não invente variações. Todos rodam em `server/`:

- **Install:** `npm install`
- **Migrate:** `npm run migrate`
- **API (dev):** `npm run dev` (porta 4100)
- **Site (dev):** `npm run dev:site` (porta 8080, com proxy de /api)
- **Export waitlist:** `npm run export`
- **Lint / Typecheck / Test:** não configurados ainda — não assuma que existem.

## Regras de negócio invioláveis

- **Gravar antes de notificar:** o cadastro entra no Postgres ANTES do e-mail
  via Resend. Se o Resend cair, o lead fica com `notified_at NULL` — nunca se perde.
- **Limite de vagas com lock:** a inserção roda em transação com
  `pg_advisory_xact_lock` para garantir o teto exato (`WAITLIST_LIMIT`).
  Nunca separar contagem e inserção em statements soltos — abre corrida.
- **Duplicata é sucesso:** e-mail repetido devolve `200 {duplicate:true}` sem
  erro — para o visitante, reenviar deve parecer sucesso.
- **Ranking é ilustrativo** até o beta ter partidas validadas — manter o rótulo.

## Convenções

- Textos, comentários e mensagens de commit em **PT-BR**.
- Branch de trabalho: `homologacao`; `main` é produção. Commits pequenos, um assunto por commit.
- Identidade visual segue o brand system v0.1 (dark, laranja-brasa, tipografia
  stencil). Assets de `assets/brand/` são derivados — regerar via script, não editar à mão.
- Documentos legais (Termos/Regras/Privacidade) são minuta — sinalizar, não "finalizar".

## Memória do projeto

@.claude/memory/MEMORY.md

Antes de salvar memória nova, aplique o teste literal: *"uma sessão futura
ficaria surpresa e grata de saber disso antes de começar?"* Não salve nada
derivável do código/git, prazos, nem receitas de debug pontuais. Formato e
política de crescimento: ver cabeçalho do próprio `MEMORY.md`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
