import type { Node, Edge } from "reactflow";

export type NodeType =
  | "start"
  | "task"
  | "approval"
  | "automation"
  | "addEmployee"
  | "processLeave"
  | "verifyDocument"
  | "humanApproval"
  | "notification"
  | "slack"
  | "email"
  | "end";

export type NodeRunStatus = "idle" | "running" | "passed" | "failed" | "skipped";

export interface BaseNodeData {
  id?: string;
  type: NodeType;
  label: string;
  isValid?: boolean;
  validationError?: string;
  status?: NodeRunStatus;
}

export interface StartNodeData extends BaseNodeData {
  type: "start";
  title: string;
  description?: string;
  metadata: Record<string, string>;
}

export interface TaskNodeData extends BaseNodeData {
  type: "task";
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  customFields: Record<string, string>;
}

export interface ApprovalNodeData extends BaseNodeData {
  type: "approval";
  title: string;
  approverRole?: "Manager" | "HRBP" | "Director" | "CEO";
  approverEmail?: string;
  autoApproveThreshold?: number;
  notifyVia: ("email" | "slack")[];
  escalateDays?: number;
}

export interface AutomationNodeData extends BaseNodeData {
  type: "automation";
  title: string;
  actionId?: string;
  actionParams: Record<string, string>;
  credentialId?: string;
  retryOnFail?: boolean;
  maxRetries?: number;
}

export interface HRAddEmployeeNodeData extends BaseNodeData {
  type: "addEmployee";
  employeeName: string;
  email: string;
  department?:
    | "Engineering"
    | "HR"
    | "Finance"
    | "Sales"
    | "Marketing"
    | "Legal"
    | "Operations";
  role: string;
  startDate?: string;
  manager?: string;
  onboardingTemplate?: string;
}

export interface HRLeaveNodeData extends BaseNodeData {
  type: "processLeave";
  leaveType: "Annual" | "Sick" | "Maternity" | "Paternity" | "Unpaid" | "Emergency";
  daysRequested: number;
  reason?: string;
  requiresDocument?: boolean;
  approverId: string;
}

export interface HRDocVerifyNodeData extends BaseNodeData {
  type: "verifyDocument";
  documentType: "ID" | "Contract" | "Certificate" | "Policy" | "Other";
  verifiedBy: string;
  expiryDate?: string;
  notifyOnPass?: string;
  notifyOnFail?: string;
  autoReject?: boolean;
}

export interface HumanApprovalNodeData extends BaseNodeData {
  type: "humanApproval";
  title: string;
  approverName: string;
  approverEmail: string;
  notifyVia: ("email" | "slack")[];
  slackUserId?: string;
  dueDate?: string;
  reminderHours?: number;
  message?: string;
}

export interface NotificationNodeData extends BaseNodeData {
  type: "notification";
  title: string;
  channel: "email" | "slack" | "both";
  recipients: string[];
  subject?: string;
  message: string;
  credentialId?: string;
  sendAt?: "Immediately" | "On workday start" | "On workday end" | "Custom";
  customTime?: string;
}

export interface SlackNodeData extends BaseNodeData {
  type: "slack";
  title: string;
  channel: string;
  message: string;
  credentialId?: string;
}

export interface EmailNodeData extends BaseNodeData {
  type: "email";
  title: string;
  recipient: string;
  subject: string;
  message: string;
  credentialId?: string;
}

export interface EndNodeData extends BaseNodeData {
  type: "end";
  endMessage: string;
  showSummary: boolean;
  triggerWebhook?: boolean;
  webhookUrl?: string;
}

export type AnyNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomationNodeData
  | HRAddEmployeeNodeData
  | HRLeaveNodeData
  | HRDocVerifyNodeData
  | HumanApprovalNodeData
  | NotificationNodeData
  | SlackNodeData
  | EmailNodeData
  | EndNodeData;

export type WorkflowNode = Node<AnyNodeData> & { type: NodeType };
export type WorkflowEdge = Edge & { label?: string };

export interface Credential {
  id: string;
  name: string;
  type: "slack" | "smtp" | "webhook";
  config: Record<string, string>;
}

export interface SimStep {
  nodeId: string;
  nodeLabel: string;
  status: "running" | "passed" | "failed" | "skipped";
  message: string;
  duration: number;
}

export interface SimulationResult {
  status: "success" | "error";
  steps: SimStep[];
  validationErrors?: string[];
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
  category: string;
}
