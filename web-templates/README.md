# Cosmos Web Templates 🌐

A library of **modern, white-label website UI shells** for Cosmos AI Lab partners to browse and pick.
Each template is the **"vỏ"** (layout · UI/UX · structure with placeholder content) — the **"ruột"**
(real content) is built later, only for the template a partner chooses to develop.

## Convention (mirrors the effect library)

```
cosmos-web-templates/
├── templates/
│   └── <slug>/
│       ├── index.html   # one self-contained page, zero dependencies, runs offline
│       └── meta.json    # title, industry, style, tags, palette, sections, summaries
└── README.md
```

- **Self-contained**: inline CSS + JS, no external scripts/fonts → portable, offline, Vishnu-clean.
- **White-label**: rebrand by editing the `:root` design tokens (brand color, accents, name).
- **Responsive + accessible**: mobile-first, focus states, `prefers-reduced-motion`, AA contrast.
- **1 template = 1 Akashic card** (type `effect`, tagged `web-template`) with a preview.

## Priority industries (Alex, 2026-06-20)

1. **Game / Toys** — a CAL customer is actively asking. *(flagship: `game-playforge`)*
2. **Tech** — AI startup / AI app.
3. **Finance** — brand intro · trading / portfolio management.

## Tiers

- **Flagship** — bespoke "wow" art direction (sets the bar). Ra direct, or via ClaudeDesign/GeminiStudio with Ra's prompts.
- **Batch** — solid structural shells produced in volume from the shared design-system kit.

*Maintained by Ra · Cosmos AI Lab.*
