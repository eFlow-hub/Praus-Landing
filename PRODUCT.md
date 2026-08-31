# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primário (confirmado): o **amador competitivo brasileiro, 18+** — joga
ranqueada de CS2 ou Dota 2 a sério, quer provar o próprio nível e transformar
skill em dinheiro real. Situação: pré-launch; o trabalho dele nesta landing é
decidir entrar na waitlist do beta deixando o e-mail.

## Product Purpose

A PRAUS é a infraestrutura de skill-based matchmaking do gaming brasileiro:
o jogador escolhe o jogo, encontra rival do seu nível, disputa o pote e
recebe via PIX. Esta landing existe para um único objetivo — **entrada na
waitlist do beta (captura de e-mail)**. Sucesso = fila cheia (teto de 1200
vagas) com leads reais.

## Positioning

O diferencial confirmado é **o pacote completo** — nenhuma peça sozinha:
matchmaking por nível de skill + **árbitro humano ao vivo em cada partida** +
prize pool no **PIX** na hora. A combinação é o que um concorrente não copia
de verdade.

## Operating Context

- Jogos ativos no beta: CS2 e Dota 2 (5v5). Valorant e Fortnite anunciados
  como "em breve".
- Fluxo do produto (mostrado no stepper da landing): escolher jogo e entry
  fee → partida com árbitro ao vivo → prize pool no PIX.
- Entry fees exibidos: R$ 25 / R$ 50 / R$ 100.

## Capabilities and Constraints

- Waitlist: grava no Postgres ANTES de notificar (lead nunca se perde);
  duplicata responde sucesso; teto de vagas com lock transacional
  (`WAITLIST_LIMIT`, padrão 1200); ao esgotar, CTAs viram "Acessos Esgotados".
- Front da landing é HTML/CSS/JS puro **por decisão** — sem framework, sem
  build (ver memória do projeto).
- **Decisão em aberto (não inventar):** enquadramento jurídico/etário
  (skill-gaming vs aposta, 18+) ainda em consolidação — os documentos legais
  (Termos/Regras/Privacidade) são minuta. Trabalho futuro não deve afirmar
  compromissos legais como fechados.

## Brand Commitments

- Nome: **PRAUS**. Wordmark = marca do cavalo + letreiro em Anton
  (`assets/brand/`, derivados do mestre `assets/games/logoPraus.png` via
  `tools/gerar-marca.py` — nunca editar derivados à mão).
- Brand system v0.1: dark, laranja-brasa com parcimônia, tipografia stencil
  (registrado em DESIGN.md).
- Voz: PT-BR direta, imperativa, vocabulário gamer sem tradução (entry fee,
  prize pool, clutch); assinatura "PRESS START. PLAY PRAUS.".

## Evidence on Hand

- Clipe real de campeonato de Valorant (embed do YouTube na seção Lances).
- Selos citados na seção Segurança: KYC, escrow, árbitro ao vivo, parceiros.
- **A tabela de ranking usa dados ilustrativos** rotulados como prévia — não
  existem partidas validadas ainda; nunca apresentar como dado real.
- Não existem depoimentos, métricas de uso ou cases — não fabricar.

## Product Principles

1. **A skill é o herói** — dinheiro é consequência de jogar melhor, nunca
   sorte; a narrativa é mérito, não aposta.
2. **Confiança visível** — árbitro humano, KYC e PIX aparecem como provas
   concretas, não promessas vagas.
3. **Um objetivo por página** — tudo converge para o e-mail na waitlist;
   nada compete com o CTA.
4. **Não prometer o que o beta não tem** — ranking é prévia, jogos "em
   breve" são "em breve", juridíco é minuta.
