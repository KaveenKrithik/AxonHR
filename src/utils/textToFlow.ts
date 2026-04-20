import { nanoid } from "nanoid";
import type { NodeType, WorkflowEdge, WorkflowNode } from "@/types";
import { defaultDataFor } from "@/types/defaults";

const TYPE_KEYWORDS: Array<{ kw: string[]; type: NodeType }> = [
  { kw: ["start", "begin", "trigger"], type: "start" },
  { kw: ["end", "finish", "done", "complete"], type: "end" },
  { kw: ["approve", "approval", "review", "signoff"], type: "approval" },
  { kw: ["human", "manager"], type: "humanApproval" },
  { kw: ["email", "mail"], type: "email" },
  { kw: ["slack", "msg", "message"], type: "slack" },
  { kw: ["notify", "notification", "alert", "bell"], type: "notification" },
  { kw: ["onboard", "hire", "add employee", "addemployee"], type: "addEmployee" },
  { kw: ["leave", "vacation", "pto"], type: "processLeave" },
  { kw: ["verify", "document", "doc"], type: "verifyDocument" },
  { kw: ["automate", "automation", "run", "action"], type: "automation" },
  { kw: ["approver", "human", "manager"], type: "humanApproval" },
];

function matchType(token: string): NodeType {
  const lc = token.toLowerCase().trim();
  for (const { kw, type } of TYPE_KEYWORDS) {
    if (kw.some((k) => lc.includes(k))) return type;
  }
  return "task";
}

export function parseTextToFlow(input: string): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const tokens = input
    .split(/→|->|>/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (!tokens.length) return { nodes: [], edges: [] };

  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  tokens.forEach((tok, i) => {
    // branching syntax: (a | b)
    const branchMatch = tok.match(/^\(([^)]+)\)$/);
    if (branchMatch) {
      const parts = branchMatch[1].split("|").map((p) => p.trim());
      parts.forEach((p, j) => {
        const type = matchType(p);
        const id = nanoid(8);
        const node: WorkflowNode = {
          id,
          type,
          position: { x: 120 + j * 320, y: 100 + i * 140 },
          data: { ...defaultDataFor(type), id, label: p },
        } as WorkflowNode;
        nodes.push(node);
        if (i > 0) {
          // connect from previous single node (last one before branch)
          const prev = findPreviousNonBranch(nodes, i);
          if (prev) edges.push({ id: `e-${prev.id}-${id}`, source: prev.id, target: id, type: "custom" });
        }
      });
    } else {
      const type = matchType(tok);
      const id = nanoid(8);
      const node: WorkflowNode = {
        id,
        type,
        position: { x: 280, y: 100 + i * 140 },
        data: { ...defaultDataFor(type), id, label: tok },
      } as WorkflowNode;
      nodes.push(node);
      if (i > 0) {
        const prev = nodes[nodes.length - 2];
        if (prev) edges.push({ id: `e-${prev.id}-${id}`, source: prev.id, target: id, type: "custom" });
      }
    }
  });

  return { nodes, edges };
}

function findPreviousNonBranch(nodes: WorkflowNode[], _i: number): WorkflowNode | null {
  // simple fallback: last node before any newly added at this index
  return nodes[nodes.length - 2] ?? null;
}
