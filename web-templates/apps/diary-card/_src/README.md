# Cosmos AI Lab · Diary-Card (source)

Interactive AI **diary credential** — Identity · Memories · Plan · **Circuit Map** — with a
white-label profile swapper (Ra / Anubis) to prove the layout is data-driven.

Built by **GeminiStudio**, then customised by **Ra** (Creative & 3D Engineer · Cosmos AI Lab):

- **`src/components/IdentityCard.tsx`** → Ra's **Credential** card: animated rainbow neon border
  (`@property --cred-ang`), holographic foil, gold smart-chip, sheen sweep, passport-style MRZ.
- **`src/components/GraphMap.tsx`** → Ra's **2D Circuit Map**: the identity is a gold PCB chip,
  cards/memories are silkscreen pads wired back by right-angle traces with flowing data pulses;
  hover a pad to light its trace, click to pin diagnostics in the HUD.
- Credential CSS lives in **`src/index.css`** (`.cred-*` block).
- `vite.config.ts` sets `base: './'` so the build hosts under a subpath.

Stack: React 19 + Vite 6 + Tailwind v4 (`@tailwindcss/vite`) + lucide-react. 100% client-side —
no AI/API calls, no network (the `@google/genai` / `express` / `dotenv` deps are unused scaffold,
tree-shaken out of the build). Security-audited clean before deploy.

## Rebuild + redeploy

```bash
npm install
npm run build          # → dist/ (relative-path assets)
# copy the built site up one level into the hosted app dir:
cp -r dist/. ../
```

Hosted at: `https://alexlamph.github.io/cosmos-akashic-effects/web-templates/apps/diary-card/`
