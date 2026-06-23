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
  timeline: TimelineEntry[];
  plan: Plan;
  graph: DiaryGraph;
}
