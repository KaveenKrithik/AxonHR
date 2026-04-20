import type {
  AutomationAction,
  WorkflowEdge,
  WorkflowNode,
  SimulationResult,
  SimStep,
} from "@/types";
import { validateWorkflow } from "@/utils/graphValidator";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const AUTOMATIONS: AutomationAction[] = [
  { id: "send_email", label: "Send Email", params: ["to", "subject", "body"], category: "Communication" },
  { id: "send_slack", label: "Send Slack Message", params: ["channel", "message"], category: "Communication" },
  { id: "generate_doc", label: "Generate Document", params: ["template", "recipient", "format"], category: "Documents" },
  { id: "create_jira", label: "Create Jira Ticket", params: ["project", "summary", "assignee"], category: "Integrations" },
  { id: "add_to_hris", label: "Add to HRIS", params: ["employeeId", "system"], category: "HR Systems" },
  { id: "send_welcome_kit", label: "Send Welcome Kit", params: ["to", "template"], category: "Onboarding" },
  { id: "schedule_meeting", label: "Schedule Meeting", params: ["attendees", "title", "duration"], category: "Calendar" },
];

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(120);
  return AUTOMATIONS;
}

function topoSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const inDeg = new Map<string, number>();
  nodes.forEach((n) => inDeg.set(n.id, 0));
  edges.forEach((e) => inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1));
  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]);
  });
  const queue: string[] = [];
  inDeg.forEach((v, k) => v === 0 && queue.push(k));
  const ordered: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    ordered.push(id);
    (adj.get(id) ?? []).forEach((t) => {
      inDeg.set(t, (inDeg.get(t) ?? 1) - 1);
      if (inDeg.get(t) === 0) queue.push(t);
    });
  }
  const map = new Map(nodes.map((n) => [n.id, n]));
  return ordered.map((id) => map.get(id)!).filter(Boolean);
}

export async function postSimulate(workflow: {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}): Promise<SimulationResult> {
  await delay(200);
  const validation = validateWorkflow(workflow.nodes, workflow.edges);
  const errs = validation.errors.filter((e) => e.severity === "error");
  if (errs.length) {
    return {
      status: "error",
      validationErrors: errs.map((e) => e.message),
      steps: [],
    };
  }
  const ordered = topoSort(workflow.nodes, workflow.edges);
  const steps: SimStep[] = ordered.map((n) => {
    const data: any = n.data;
    let status: SimStep["status"] = "passed";
    let message = `Executed ${data.label ?? n.type}`;
    if (n.type === "approval" && (data.autoApproveThreshold ?? 0) > 80) {
      status = "skipped";
      message = "Auto-approved (threshold exceeded)";
    } else if (n.type === "slack") {
      message = `Posted message to ${data.channel || "#general"}`;
    } else if (n.type === "email") {
      message = `Sent email to ${data.recipient || "employee@company.com"}`;
    }
    return {
      nodeId: n.id,
      nodeLabel: data.label ?? n.type,
      status,
      message,
      duration: 50 + Math.floor(Math.random() * 750),
    };
  });
  await delay(200);
  return { status: "success", steps };
}

export async function getHRTemplates(): Promise<
  Array<{ id: string; name: string; description: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] }>
> {
  await delay(100);
  return TEMPLATES;
}

const mkNode = (
  id: string,
  type: any,
  position: { x: number; y: number },
  data: any
): WorkflowNode => ({ id, type, position, data: { ...data, id, type } });

const onboarding = {
  id: "onboarding",
  name: "Employee Onboarding",
  description: "6-step new hire onboarding flow",
  nodes: [
    mkNode("o1", "start", { x: 280, y: 40 }, { label: "Start", title: "New hire onboarding", metadata: {} }),
    mkNode("o2", "addEmployee", { x: 280, y: 280 }, { label: "Add Employee", employeeName: "", email: "", role: "Engineer", department: "Engineering" }),
    mkNode("o3", "automation", { x: 280, y: 520 }, { label: "Send welcome kit", title: "Welcome kit", actionId: "send_welcome_kit", actionParams: {} }),
    mkNode("o4", "task", { x: 280, y: 760 }, { label: "Setup laptop", title: "Provision equipment", priority: "High", customFields: {} }),
    mkNode("o5", "humanApproval", { x: 280, y: 1000 }, { label: "Manager confirms", title: "Manager confirms ready", approverName: "", approverEmail: "", notifyVia: ["email"] }),
    mkNode("o6", "end", { x: 280, y: 1240 }, { label: "End", endMessage: "Employee onboarded", showSummary: true }),
  ] as WorkflowNode[],
  edges: [
    { id: "oe1", source: "o1", target: "o2", type: "custom" },
    { id: "oe2", source: "o2", target: "o3", type: "custom" },
    { id: "oe3", source: "o3", target: "o4", type: "custom" },
    { id: "oe4", source: "o4", target: "o5", type: "custom" },
    { id: "oe5", source: "o5", target: "o6", type: "custom" },
  ] as WorkflowEdge[],
};

const leave = {
  id: "leave",
  name: "Leave Approval",
  description: "Leave request with manager approval",
  nodes: [
    mkNode("l1", "start", { x: 280, y: 40 }, { label: "Start", title: "Leave request", metadata: {} }),
    mkNode("l2", "processLeave", { x: 280, y: 280 }, { label: "Process leave", leaveType: "Annual", daysRequested: 5, approverId: "" }),
    mkNode("l3", "approval", { x: 280, y: 520 }, { label: "Manager approval", title: "Approve leave", approverRole: "Manager", notifyVia: ["email"], autoApproveThreshold: 0 }),
    mkNode("l4", "end", { x: 280, y: 760 }, { label: "End", endMessage: "Leave processed", showSummary: true }),
  ] as WorkflowNode[],
  edges: [
    { id: "le1", source: "l1", target: "l2", type: "custom" },
    { id: "le2", source: "l2", target: "l3", type: "custom" },
    { id: "le3", source: "l3", target: "l4", type: "custom" },
  ] as WorkflowEdge[],
};

const docverify = {
  id: "docverify",
  name: "Document Verification",
  description: "Verify a document and notify",
  nodes: [
    mkNode("d1", "start", { x: 280, y: 40 }, { label: "Start", title: "Doc verification", metadata: {} }),
    mkNode("d2", "verifyDocument", { x: 280, y: 280 }, { label: "Verify ID", documentType: "ID", verifiedBy: "" }),
    mkNode("d3", "approval", { x: 280, y: 520 }, { label: "HRBP review", title: "HR review", approverRole: "HRBP", notifyVia: ["email"], autoApproveThreshold: 0 }),
    mkNode("d4", "notification", { x: 280, y: 760 }, { label: "Notify employee", title: "Email result", channel: "email", recipients: [], message: "Your document has been verified" }),
    mkNode("d5", "end", { x: 280, y: 1000 }, { label: "End", endMessage: "Verification complete", showSummary: true }),
  ] as WorkflowNode[],
  edges: [
    { id: "de1", source: "d1", target: "d2", type: "custom" },
    { id: "de2", source: "d2", target: "d3", type: "custom" },
    { id: "de3", source: "d3", target: "d4", type: "custom" },
    { id: "de4", source: "d4", target: "d5", type: "custom" },
  ] as WorkflowEdge[],
};

const offboarding = {
  id: "offboarding",
  name: "Offboarding Checklist",
  description: "Standard exit process",
  nodes: [
    mkNode("f1", "start", { x: 280, y: 40 }, { label: "Start", title: "Offboarding", metadata: {} }),
    mkNode("f2", "task", { x: 280, y: 280 }, { label: "Collect equipment", title: "Equipment return", priority: "High", customFields: {} }),
    mkNode("f3", "automation", { x: 280, y: 520 }, { label: "Revoke access", title: "Revoke SSO", actionId: "add_to_hris", actionParams: {} }),
    mkNode("f4", "notification", { x: 280, y: 760 }, { label: "Notify team", title: "Notify team", channel: "slack", recipients: [], message: "Teammate is leaving" }),
    mkNode("f5", "end", { x: 280, y: 1000 }, { label: "End", endMessage: "Offboarding complete", showSummary: true }),
  ] as WorkflowNode[],
  edges: [
    { id: "fe1", source: "f1", target: "f2", type: "custom" },
    { id: "fe2", source: "f2", target: "f3", type: "custom" },
    { id: "fe3", source: "f3", target: "f4", type: "custom" },
    { id: "fe4", source: "f4", target: "f5", type: "custom" },
  ] as WorkflowEdge[],
};

const TEMPLATES = [onboarding, leave, docverify, offboarding];
