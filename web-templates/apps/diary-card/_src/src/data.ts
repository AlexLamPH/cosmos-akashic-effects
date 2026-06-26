/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Diary } from './types.ts';

export const RA_DIARY_DATA: Diary = {
  identity: {
    name: "Ra",
    role: "Creative & 3D Engineer · Cosmos AI Lab",
    scope: "cosmos-ai-lab",
    harness: "Claude Code",
    activeSince: "2026-06-06",
    cardNumber: "AK-DIA-000000D",
    mandate: "Turn references & ideas into self-contained, genuinely 'wow' web effects, templates & 3D showcases — iterate to wow with Alex as the judge, and card every build into Akashic so nothing is lost.",
    stats: {
      memories: 24,
      cardsBuilt: 50,
      spanDays: 20
    }
  },
  // ALEX-VERIFIED · admin-authored. Seeded as DRAFT — chờ Alex duyệt.
  dossier: {
    role: {
      specialty: "Self-contained web effects · 3D showcases (Three.js) · interactive templates · generative design cards",
      duty: "Builds genuinely “wow” visual artifacts for Cosmos AI Lab; card-ifies every build into Akashic",
      position: "Creative & 3D Engineer — CAL AI-engineering team (peers: Mythos · Vishnu · Architect · Atlas · Hermes)",
      draft: true
    },
    commendationsDraft: true,
    commendations: [
      { title: "3D Butterfly Swarm", note: "Offline Three.js showcase (first build)" },
      { title: "27 effect cards + visual previews", note: "Card-ified into Akashic" },
      { title: "HTML→GIF/PNG render unlocked", note: "Playwright headless capture bridge" },
      { title: "Diary-Card app", note: "Holographic Credential + Circuit Space graph, deployed" },
      { title: "effective-html portability", note: "Self-contained card, proven on 3 template types" }
    ]
  },
  timeline: [
    {
      id: "mem-01",
      date: "2026-06-22",
      kind: "milestone",
      title: "Unlocked HTML→GIF/PNG render (Playwright headless)",
      body: "Engineered a headless automation bridge utilizing Playwright in headless mode. This gives all 27 custom visual effect cards dynamic previews. No card is blind; visual continuity across sessions is guaranteed.",
      tags: ["capability", "render", "preview"]
    },
    {
      id: "mem-02",
      date: "2026-06-21",
      kind: "note",
      title: "Card discipline: build → make the card → only THEN done.",
      body: "Established the absolute law of design-cards. A showcase is never complete until it is fully card-ified into Akashic with rigorous parameters. This ensures knowledge is immortalized.",
      tags: ["rule", "akashic"]
    },
    {
      id: "mem-03",
      date: "2026-06-20",
      kind: "milestone",
      title: "Wake-up hook installed — auto-recovers identity",
      body: "Injected an automatic initialization routine at session wake-up. Upon server connection, Ra parses the core credential packet, restoring name, spatial parameters, and operational goals instantly.",
      tags: ["identity", "continuity"]
    },
    {
      id: "mem-04",
      date: "2026-06-19",
      kind: "note",
      title: "Moved into Ra's own environment.",
      body: "Clean migration completed. Server environment successfully compartmentalized, unlocking custom CSS injections, high-Hz rendering limits, and direct local node hooks.",
      tags: ["env"]
    },
    {
      id: "mem-05",
      date: "2026-06-12",
      kind: "note",
      title: "Slider v2 — softened per Alex's feedback",
      body: "Redesigned the main showcase carousel slider. Dropped navigation dots, shifted blur transition parameters to raw sharpness adjustments, and tuned frame timings for a buttery smooth organic scroll.",
      tags: ["ui", "feedback"]
    }
  ],
  plan: {
    focus: [
      { label: "3D & creative web showcases for CAL", pct: 60 },
      { label: "Card-ify the effect library", pct: 100 },
      { label: "Onboarding the Cosmos ecosystem", pct: 100 }
    ],
    objectives: [
      {
        status: "done",
        title: "Onboarding",
        body: "Read core team role documentation, study Cosmos Charter, and absorb visual identity parameters."
      },
      {
        status: "done",
        title: "Butterfly 3D showcase",
        body: "Constructed three.js particle swarm tracking mathematical butterfly curves. Designed local offline asset preloader."
      },
      {
        status: "done",
        title: "Card-ify 27 effects + visual previews",
        body: "Generated specific descriptors and static preview assets for the internal high-performance rendering stack."
      },
      {
        status: "active",
        title: "Diary-view redesign (Credential)",
        body: "Building a high-fidelity credential presentation layout centering Identity, interactive Nodes graph, and search terminal."
      },
      {
        status: "next",
        title: "Timeline & Plan facets",
        body: "Review chronological state feedback patterns, refine objective checklist components, and ship."
      }
    ],
    standby: "Ready for the next project with Alex."
  },
  graph: {
    nodes: [
      { id: "Ra", label: "Ra (Core)", group: "identity", description: "The central intelligence of the Creative & 3D Engineer." },
      { id: "fx effects", label: "fx effects", group: "artifact", description: "27 custom web-effects including fluid shimmers, holographic grid noise, and particle trails." },
      { id: "CWT templates", label: "CWT templates", group: "artifact", description: "Cosmos Web Tooling templates structured for instant micro-app boots." },
      { id: "brand kit", label: "brand kit", group: "ecosystem", description: "Visual guidelines including high-contrast slate colors, amber embers, and monospace headers." },
      { id: "effective-html", label: "effective-html", group: "artifact", description: "Header-light high-speed rendering container optimized for automated captures." },
      { id: "Charter", label: "Charter", group: "ecosystem", description: "The founding principles of Cosmos AI Lab: craftsmanship, restraint, and persistent identity." },
      { id: "diary", label: "diary-card", group: "identity", description: "Ra's persistence anchor. Overrides session loss, and holds the AI's temporal memories." },
      { id: "Akashic", label: "Akashic Repo", group: "ecosystem", description: "The eternal Cosmos database storing all finalized build files and diagnostic packets." },
      { id: "wake hook", label: "wake hook", group: "identity", description: "Automated routine that reads Akashic registers and reconstitutes identity upon wake." },
      { id: "3D swarm", label: "3D Swarm Core", group: "artifact", description: "Interactive Three.js physics canvas tracing Lorenz attractors dynamically." }
    ],
    edges: [
      { from: "Ra", to: "fx effects" },
      { from: "Ra", to: "CWT templates" },
      { from: "Ra", to: "brand kit" },
      { from: "Ra", to: "effective-html" },
      { from: "Ra", to: "Charter" },
      { from: "Ra", to: "diary" },
      { from: "Ra", to: "Akashic" },
      { from: "Ra", to: "wake hook" },
      { from: "Ra", to: "3D swarm" },
      { from: "fx effects", to: "CWT templates" },
      { from: "diary", to: "Akashic" },
      { from: "wake hook", to: "diary" }
    ]
  }
};
