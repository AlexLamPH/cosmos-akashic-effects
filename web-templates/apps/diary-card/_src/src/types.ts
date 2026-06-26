/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Stats {
  memories: number;
  cardsBuilt: number;
  spanDays: number;
}

export interface Identity {
  name: string;
  role: string;
  scope: string;
  harness: string;
  activeSince: string;
  cardNumber: string;
  mandate: string;
  stats: Stats;
}

/* ---- Identity Dossier: ROLE + COMMENDATIONS ----
   ALEX-VERIFIED · admin-authored — the AI never self-authors these.
   Only Alex sets them (by instructing the AI, or editing the card directly). */
export interface RoleProfile {
  specialty: string;   // Chuyên môn
  duty: string;        // Vai trò
  position: string;    // Vị trí
  draft?: boolean;     // true → "draft · chờ Alex duyệt"
}

export interface Commendation {
  title: string;
  note: string;        // 1-line description
  date?: string;       // optional mono date
}

export interface Dossier {
  role: RoleProfile;
  commendations: Commendation[];
  commendationsDraft?: boolean; // marks the whole list as draft pending Alex
}

export type MemoryKind = 'note' | 'milestone';

export interface TimelineEntry {
  id: string;
  date: string;
  kind: MemoryKind;
  title: string;
  body: string;
  tags: string[];
}

export interface FocusArea {
  label: string;
  pct: number;
}

export interface Objective {
  status: 'done' | 'active' | 'next';
  title: string;
  body: string;
}

export interface Plan {
  focus: FocusArea[];
  objectives: Objective[];
  standby: string;
}

export interface GraphNode {
  id: string;
  label: string;
  group: 'identity' | 'memory' | 'artifact' | 'ecosystem';
  description?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DiaryGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Diary {
  identity: Identity;
  dossier: Dossier;
  timeline: TimelineEntry[];
  plan: Plan;
  graph: DiaryGraph;
}
