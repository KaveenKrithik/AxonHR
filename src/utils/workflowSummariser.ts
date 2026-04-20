import type { WorkflowEdge, WorkflowNode } from "@/types";

function topo(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const inDeg = new Map<string, number>();
  nodes.forEach((n) => inDeg.set(n.id, 0));
  edges.forEach((e) => inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1));
  const adj = new Map<string, string[]>();
  edges.forEach((e) =>
    adj.set(e.source, [...(adj.get(e.source) ?? []), e.target])
  );
  const q: string[] = [];
  inDeg.forEach((v, k) => v === 0 && q.push(k));
  const out: string[] = [];
  while (q.length) {
    const id = q.shift()!;
    out.push(id);
    (adj.get(id) ?? []).forEach((t) => {
      inDeg.set(t, (inDeg.get(t) ?? 1) - 1);
      if (inDeg.get(t) === 0) q.push(t);
    });
  }
  const map = new Map(nodes.map((n) => [n.id, n]));
  return out.map((id) => map.get(id)!).filter(Boolean);
}

export function summariseWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string {
  if (nodes.length < 2) return "This workflow has no steps yet.";
  const ordered = topo(nodes, edges);
  const parts: string[] = [];
  ordered.forEach((n, i) => {
    const d: any = n.data;
    const label = d.label ?? n.type;
    if (n.type === "start") {
      parts.push(`When **${d.title ?? label}** triggers`);
    } else if (n.type === "task") {
      parts.push(`${i === 0 ? "" : "then "}assign the task **${d.title ?? label}**${d.assignee ? ` to ${d.assignee}` : ""}`);
    } else if (n.type === "approval") {
      parts.push(`request approval from the **${d.approverRole ?? "approver"}**${d.autoApproveThreshold > 0 ? ` (auto-approve >${d.autoApproveThreshold})` : ""}`);
    } else if (n.type === "humanApproval") {
      parts.push(`get sign-off from **${d.approverName || "a human approver"}**`);
    } else if (n.type === "automation") {
      parts.push(`run the **${d.actionId ?? "automation"}** action`);
    } else if (n.type === "addEmployee") {
      parts.push(`add **${d.employeeName || "the employee"}** to the HRIS`);
    } else if (n.type === "processLeave") {
      parts.push(`process a **${d.leaveType}** leave request of ${d.daysRequested} day(s)`);
    } else if (n.type === "verifyDocument") {
      parts.push(`verify the **${d.documentType}** document`);
    } else if (n.type === "notification") {
      parts.push(`send a **${d.channel}** notification${d.recipients?.length ? ` to ${d.recipients.length} recipient(s)` : ""}`);
    } else if (n.type === "end") {
      parts.push(`finally end with: _${d.endMessage}_`);
    }
  });
  return parts.join(". ") + ".";
}
