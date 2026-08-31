---
name: PRAUS Landing
description: Landing dark de skill-based matchmaking — brasa laranja rara sobre carvão, stencil e chanfros
colors:
  brasa: "#FF7A00"
  brasa-clara: "#FF9233"
  brasa-funda: "#C95A00"
  carvao: "#14110F"
  carvao-medio: "#1B1714"
  carvao-claro: "#221D19"
  linha-carvao: "#2A231E"
  fumaca: "#8A817A"
  marfim: "#F4EFEA"
  vitoria: "#B8E04A"
  derrota: "#E6322B"
  info: "#7CC9FF"
typography:
  display:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(48px, 9.4vw, 116px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(34px, 6vw, 66px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  numeric:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "40px"
    lineHeight: 0.9
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.18em"
spacing:
  gutter: "22px"
  section: "84px"
  section-desktop: "124px"
components:
  button-primary:
    backgroundColor: "{colors.brasa}"
    textColor: "#000000"
    padding: "16px 26px"
  button-primary-hover:
    backgroundColor: "{colors.brasa-clara}"
    textColor: "#000000"
  card:
    backgroundColor: "{colors.carvao-medio}"
    textColor: "{colors.marfim}"
---

# Design System: PRAUS Landing

## Overview

**Creative North Star: "A Arena de Brasa"**

Uma arena escura onde a brasa laranja é a única luz. O fundo é carvão quente
(nunca preto puro), a tipografia é stencil condensada em caixa alta, e o
laranja só acende onde há ação — o CTA, o kicker, a palavra-chave em itálico.
Competição séria: calor contido, sem espetáculo barato.

A densidade é editorial-esportiva: seções longas com respiro generoso
(84–124px), títulos enormes, e uma camada "de máquina" (mono tags, números
tabulares) que dá clima de placar e lobby de partida. Rejeições confirmadas:
nada de SaaS genérico de IA (Inter como fonte única, gradiente roxo-azul,
pilhas de cards arredondados) e nada de esports cyber-neon (RGB, glitch,
hexágonos, HUD futurista).

**Key Characteristics:**
- Carvão quente em camadas tonais; brasa laranja rara e intencional
- Stencil (Anton) gigante em caixa alta com itálico serifado como tempero
- Chanfros de 10px no lugar de border-radius — quina de hardware
- Flat por padrão; brilho de brasa exclusivo da ação primária
- Voz de placar: mono uppercase, números tabulares

## Colors

Carvões quentes em três camadas, marfim para texto, e uma brasa que aparece
pouco de propósito.

### Primary
- **Brasa** (#FF7A00): a cor da ação — CTA primário, kicker, seleção de
  texto, scrollbar, palavra em itálico. Nunca em texto longo.
- **Brasa Clara** (#FF9233): estado hover da ação primária.
- **Brasa Funda** (#C95A00): estado active/pressionado.

### Neutral
- **Carvão** (#14110F): fundo base da página.
- **Carvão Médio** (#1B1714): superfície de cards e seções alternadas.
- **Carvão Claro** (#221D19): terceira camada tonal (elementos elevados).
- **Linha de Carvão** (#2A231E): bordas e divisores.
- **Fumaça** (#8A817A): texto secundário e labels.
- **Marfim** (#F4EFEA): texto principal — branco quente, nunca #FFF puro.

### Tertiary (semânticos de placar)
- **Vitória** (#B8E04A): resultado positivo no ranking.
- **Derrota** (#E6322B): resultado negativo.
- **Info** (#7CC9FF): neutro informativo.

### Named Rules
**A Regra da Brasa.** O laranja ocupa no máximo ~10% de qualquer tela. A
raridade é o que faz a brasa queimar — se tudo acende, nada acende.

## Typography

**Display Font:** Anton (sans-serif)
**Body Font:** Manrope (sans-serif)
**Label/Mono Font:** JetBrains Mono
**Coadjuvantes:** Bebas Neue (números de placar), Newsreader itálico (tempero
editorial), Space Grotesk (valores monetários), Inter Tight (UI pequena de nav)

**Character:** Stencil de pôster esportivo sobre um corpo de leitura humanista
— o contraste entre o grito do título e a calma do parágrafo é a identidade.

### Hierarchy
- **Display** (400, clamp(48px, 9.4vw, 116px), lh 1.2): herói e CTA final;
  Anton caixa alta, tracking -0.01em.
- **Headline** (400, clamp(34px, 6vw, 66px), lh 1.2): título de seção, mesmo
  tratamento.
- **Numeric** (Bebas Neue, 40–64px, lh 0.9, tabular-nums): pontuações,
  steps, placares.
- **Body** (400, 16px, lh 1.6): Manrope; leads a 17px; máx ~58–64ch.
- **Label** (500, 11px, tracking 0.18em, UPPERCASE): mono tags, kickers e
  navegação de dados.

### Named Rules
**A Regra do Acento.** Display nunca desce de line-height 1.2 — no Anton, o
acento de "É" sobe 1.11em e colide com a linha de cima (bug corrigido em
2026-08-19; não reintroduzir).
**A Regra do Itálico.** `em` = Newsreader itálico laranja, minúsculo, só em
palavras-chave isoladas — nunca em frases inteiras.

## Layout

Container de 1180px (`--maxw`) com gutter de 22px; variante estreita de 760px
para leitura. Seções com padding-block de 84px (mobile) e 124px (≥768px),
alternando carvão e carvão médio como fundo. Herói em 100svh com vídeo de
fundo em crossfade e scrim de legibilidade — nunca fosco. Nav fixa de 64px
que ganha blur e fundo ao rolar.

## Elevation & Depth

Flat por doutrina. Profundidade vem de camadas tonais de carvão
(#14110F → #1B1714 → #221D19) e bordas (#2A231E) — nunca de sombra difusa.

### Shadow Vocabulary
- **Brilho de brasa** (`box-shadow: 0 0 28px rgba(255,122,0,.35)`): exclusivo
  do hover do CTA primário. É luz, não sombra.

### Named Rules
**A Regra Flat.** Superfícies em repouso não têm sombra. O único brilho da
página é a brasa do CTA em hover — aparece como resposta à intenção, nunca
como decoração.

## Shapes

Chanfro, não raio: cantos cortados a 10px (`--chamfer`) via `clip-path` em
botões e cards — quina de hardware, precisão de arena. `border-radius` não
existe no sistema. Bordas de 1px em Linha de Carvão delimitam superfícies.

## Components

### Buttons
- **Shape:** chanfro de 10px via clip-path (7px na variante `--sm`)
- **Primary:** fundo Brasa, texto #000, JetBrains Mono 14px 700 UPPERCASE
  tracking 0.08em, padding 16px 26px
- **Hover / Focus:** fundo Brasa Clara + brilho de brasa; active desce 1px e
  escurece para Brasa Funda
- **Small:** 12px, padding 11px 16px

### Cards / Containers
- **Corner Style:** chanfro 10px (clip-path)
- **Background:** Carvão Médio (Carvão puro dentro de seções alternadas)
- **Shadow Strategy:** nenhuma — ver Regra Flat
- **Border:** 1px Linha de Carvão
- **Internal Padding:** 20–24px

### Mono Tag / Kicker
- **Style:** JetBrains Mono 11px 500 UPPERCASE tracking 0.18em em Fumaça;
  kicker em Brasa com travessão de 22px antes do texto

### Navigation
- **Style:** fixa 64px, transparente no topo; ao rolar ganha rgba(20,17,15,.85)
  + blur 12px + borda inferior. Links Inter Tight 14px em Fumaça, hover Marfim.

### Wordmark (assinatura)
- Marca do cavalo + letreiro "PRAUS" em Anton, tracking 0.26em — derivados de
  `assets/brand/`, regenerados por script, nunca editados à mão.

## Do's and Don'ts

### Do:
- **Do** usar camadas de carvão para separar planos (#14110F → #1B1714 → #221D19).
- **Do** manter display em Anton caixa alta com line-height ≥ 1.2.
- **Do** reservar a Brasa para ação e ênfase (≤10% da tela).
- **Do** usar tabular-nums em qualquer número de placar ou dinheiro.

### Don't:
- **Don't** usar border-radius — a forma da casa é o chanfro.
- **Don't** usar sombra difusa em repouso; o único brilho é o hover do CTA.
- **Don't** usar preto (#000) ou branco (#FFF) puros em superfícies e texto.
- **Don't** parecer SaaS de IA (Inter como fonte única, gradiente roxo-azul,
  pilha de cards arredondados) nem cyber-neon gamer (RGB, glitch, hexágonos).
- **Don't** colocar texto longo em laranja ou em Anton.
