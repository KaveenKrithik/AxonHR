import { memo } from "react";
import type { NodeProps } from "reactflow";
import { NodeShell } from "./NodeShell";
import type {
  StartNodeData, EndNodeData, TaskNodeData, ApprovalNodeData, AutomationNodeData,
  HRAddEmployeeNodeData, HRLeaveNodeData, HRDocVerifyNodeData, HumanApprovalNodeData,
  NotificationNodeData, SlackNodeData, EmailNodeData,
} from "@/types";

export const StartNode = memo((p: NodeProps<StartNodeData>) => (
  <NodeShell {...p} subtitle={p.data.title} />
));
export const EndNode = memo((p: NodeProps<EndNodeData>) => (
  <NodeShell {...p} subtitle={p.data.endMessage} />
));
export const TaskNode = memo((p: NodeProps<TaskNodeData>) => (
  <NodeShell {...p} subtitle={p.data.title} rightBadge={p.data.priority} />
));
export const ApprovalNode = memo((p: NodeProps<ApprovalNodeData>) => (
  <NodeShell {...p} subtitle={p.data.approverRole ?? "no approver"} withYesNo />
));
export const AutomationNode = memo((p: NodeProps<AutomationNodeData>) => (
  <NodeShell {...p} subtitle={p.data.actionId ?? "no action"} />
));
export const HRAddEmployeeNode = memo((p: NodeProps<HRAddEmployeeNodeData>) => (
  <NodeShell {...p} subtitle={p.data.employeeName || "new hire"} rightBadge={p.data.department} />
));
export const HRLeaveNode = memo((p: NodeProps<HRLeaveNodeData>) => (
  <NodeShell {...p} subtitle={`${p.data.daysRequested}d ${p.data.leaveType}`} />
));
export const HRDocVerifyNode = memo((p: NodeProps<HRDocVerifyNodeData>) => (
  <NodeShell {...p} subtitle={p.data.documentType} />
));
export const HumanApprovalNode = memo((p: NodeProps<HumanApprovalNodeData>) => (
  <NodeShell
    {...p}
    subtitle={p.data.approverName || "no approver"}
    rightBadge={`via ${p.data.notifyVia.join("+")}`}
    withYesNo
  />
));
export const NotificationNode = memo((p: NodeProps<NotificationNodeData>) => (
  <NodeShell {...p} subtitle={`${p.data.channel} • ${p.data.recipients.length} recipient(s)`} />
));
export const SlackNode = memo((p: NodeProps<SlackNodeData>) => (
  <NodeShell {...p} subtitle={p.data.channel || "#general"} />
));
export const EmailNode = memo((p: NodeProps<EmailNodeData>) => (
  <NodeShell {...p} subtitle={p.data.recipient || "new email"} />
));
