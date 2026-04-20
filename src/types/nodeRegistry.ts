import type { NodeType } from "./index";

export interface NodeRegistryEntry {
  type: NodeType;
  label: string;
  description: string;
  icon: string; // lucide icon name
  category: "Flow control" | "HR tasks" | "Integrations" | "Approvals";
  color: string; // tailwind/CSS color token name
}

export const NODE_REGISTRY: NodeRegistryEntry[] = [
  {
    type: "start",
    label: "Start",
    description: "Entry point. Defines the trigger and initial metadata.",
    icon: "Play",
    category: "Flow control",
    color: "node-start",
  },
  {
    type: "end",
    label: "End",
    description: "Terminates the workflow with an optional summary or webhook.",
    icon: "Flag",
    category: "Flow control",
    color: "node-end",
  },
  {
    type: "task",
    label: "Task",
    description: "A unit of work assigned to a person with a due date.",
    icon: "ClipboardList",
    category: "Flow control",
    color: "node-task",
  },
  {
    type: "addEmployee",
    label: "Add Employee",
    description: "Onboard a new hire into the company HRIS.",
    icon: "UserPlus",
    category: "HR tasks",
    color: "node-add-employee",
  },
  {
    type: "processLeave",
    label: "Process Leave",
    description: "Validate and route a leave request.",
    icon: "Calendar",
    category: "HR tasks",
    color: "node-leave",
  },
  {
    type: "verifyDocument",
    label: "Verify Document",
    description: "Check submitted documents (ID, contract, cert).",
    icon: "FileCheck",
    category: "HR tasks",
    color: "node-verify",
  },
  {
    type: "automation",
    label: "Automation",
    description: "Run a predefined action (Slack, email, Jira, HRIS).",
    icon: "Zap",
    category: "Integrations",
    color: "node-automation",
  },
  {
    type: "notification",
    label: "Notification",
    description: "Send a notification via Email, Slack, or both.",
    icon: "Bell",
    category: "Integrations",
    color: "node-notification",
  },
  {
    type: "approval",
    label: "Approval",
    description: "Conditional approval with auto-approve threshold.",
    icon: "CheckCircle2",
    category: "Approvals",
    color: "node-approval",
  },
  {
    type: "humanApproval",
    label: "Human Approval",
    description: "Request explicit sign-off from a named human approver.",
    icon: "Users",
    category: "Approvals",
    color: "node-human",
  },
];

export const NODE_REGISTRY_BY_TYPE: Record<NodeType, NodeRegistryEntry> =
  NODE_REGISTRY.reduce((acc, e) => {
    acc[e.type] = e;
    return acc;
  }, {} as Record<NodeType, NodeRegistryEntry>);

export const CATEGORIES: NodeRegistryEntry["category"][] = [
  "Flow control",
  "HR tasks",
  "Integrations",
  "Approvals",
];
