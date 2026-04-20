import type { WorkflowEdge, WorkflowNode } from "@/types";

export interface ValidationError {
  type: string;
  nodeId?: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

function hasCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adj = new Map<string, string[]>();
  edges.forEach((e) => adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]));
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  nodes.forEach((n) => color.set(n.id, WHITE));
  const dfs = (id: string): boolean => {
    color.set(id, GRAY);
    for (const t of adj.get(id) ?? []) {
      const c = color.get(t);
      if (c === GRAY) return true;
      if (c === WHITE && dfs(t)) return true;
    }
    color.set(id, BLACK);
    return false;
  };
  for (const n of nodes) {
    if (color.get(n.id) === WHITE && dfs(n.id)) return true;
  }
  return false;
}

function requiredMissing(node: WorkflowNode): string | null {
  const d: any = node.data;
  switch (node.type) {
    case "start":
      return d.title ? null : "Title is required";
    case "task":
      return d.title ? null : "Title is required";
    case "approval":
      return d.title && d.approverRole ? null : "Title and approver role required";
    case "automation":
      return d.actionId ? null : "Pick an automation action";
    case "addEmployee":
      return d.employeeName && d.email && d.role ? null : "Name, email and role required";
    case "processLeave":
      return d.daysRequested > 0 && d.approverId ? null : "Days and approver required";
    case "verifyDocument":
      return d.verifiedBy ? null : "Verifier is required";
    case "humanApproval":
      return d.approverName && d.approverEmail ? null : "Approver name and email required";
    case "notification":
      return d.recipients?.length && d.message ? null : "Recipients and message required";
    case "end":
      return d.endMessage ? null : "End message required";
  }
  return null;
}

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: ValidationError[] = [];
  if (nodes.length === 0) {
    return { isValid: false, errors: [{ type: "empty", message: "Workflow is empty", severity: "error" }] };
  }
  const starts = nodes.filter((n) => n.type === "start");
  const ends = nodes.filter((n) => n.type === "end");
  if (starts.length === 0)
    errors.push({ type: "no-start", message: "Add a Start node", severity: "error" });
  if (starts.length > 1)
    errors.push({ type: "multi-start", message: "Only one Start node allowed", severity: "error" });
  if (ends.length === 0)
    errors.push({ type: "no-end", message: "Add an End node", severity: "error" });
  if (ends.length > 1)
    errors.push({ type: "multi-end", message: "Only one End node allowed", severity: "error" });

  if (nodes.length > 1) {
    const connected = new Set<string>();
    edges.forEach((e) => {
      connected.add(e.source);
      connected.add(e.target);
    });
    nodes.forEach((n) => {
      if (!connected.has(n.id))
        errors.push({
          type: "orphan",
          nodeId: n.id,
          message: `Node "${(n.data as any).label}" is not connected`,
          severity: "error",
        });
    });
  }

  nodes.forEach((n) => {
    const miss = requiredMissing(n);
    if (miss) {
      errors.push({
        type: "missing-field",
        nodeId: n.id,
        message: `${(n.data as any).label}: ${miss}`,
        severity: "error",
      });
    }
  });

  if (hasCycle(nodes, edges)) {
    errors.push({ type: "cycle", message: "Workflow contains a cycle", severity: "error" });
  }

  nodes
    .filter((n) => n.type === "approval" || n.type === "humanApproval")
    .forEach((n) => {
      const out = edges.filter((e) => e.source === n.id);
      if (out.length < 2) {
        errors.push({
          type: "approval-branch",
          nodeId: n.id,
          message: `${(n.data as any).label}: missing yes/no branches`,
          severity: "warning",
        });
      }
    });

  if (nodes.length > 20) {
    errors.push({
      type: "complexity",
      message: "Workflow may be complex to maintain (>20 nodes)",
      severity: "warning",
    });
  }

  return {
    isValid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
  };
}
