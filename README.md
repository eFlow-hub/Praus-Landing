# PRAUS — Landing de captação de beta

Landing page de pré-launch da **PRAUS**, infraestrutura de *skill-based matchmaking* para o gaming brasileiro. O jogador escolhe o jogo, encontra rival do seu nível, disputa o pote e recebe no PIX — com árbitro ao vivo em cada partida.

Objetivo único da página: **entrada na waitlist do beta** (captura de e-mail).

## Stack

HTML, CSS e JavaScript puros (sem build, sem dependências). Fontes via Google Fonts; clipe de campeonato via embed do YouTube.

## Estrutura

```
PRAUS/
├── index.html        # estrutura e conteúdo
├── styles.css        # design system (cores, tipografia, layout, animações)
├── script.js         # waitlist, stepper "Como funciona", reveals no scroll
└── assets/
    ├── video/        # vídeos de fundo do herói
    └── games/        # capas dos jogos
```

## Seções

1. **Herói** — vídeo de fundo + headline + captura de e-mail
2. **Por que PRAUS** — bento com painel de partida ao vivo
3. **Como funciona** — stepper interativo com prévia das telas (lobby → partida → PIX)
4. **Jogos** — CS2 e Dota 2 ativos; Valorant e Fortnite em breve
5. **Lances** — clipe de campeonato de Valorant
6. **Segurança** — KYC, escrow, árbitro ao vivo, parceiros
7. **Dimensão** — números de mercado
8. **FAQ**
9. **CTA final** — `PRESS START. PLAY PRAUS.`

## Rodar localmente

Servidor estático simples:

```bash
python -m http.server 8080
# abrir http://localhost:8080
```

## Notas

- Identidade visual conforme o brand system v0.1 (dark, laranja-brasa, tipografia stencil).
- Wordmark é um placeholder textual em maiúsculas até o arquivo final.
- Documentos legais (Termos/Regras/Privacidade) são tratados como minuta em consolidação.
- A captura de e-mail é apenas client-side (localStorage) — ainda sem backend.
