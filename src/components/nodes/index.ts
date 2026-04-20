import {
  StartNode, EndNode, TaskNode, ApprovalNode, AutomationNode,
  HRAddEmployeeNode, HRLeaveNode, HRDocVerifyNode, HumanApprovalNode, NotificationNode,
  SlackNode, EmailNode,
} from "./NodeTypes";

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  task: TaskNode,
  approval: ApprovalNode,
  automation: AutomationNode,
  addEmployee: HRAddEmployeeNode,
  processLeave: HRLeaveNode,
  verifyDocument: HRDocVerifyNode,
  humanApproval: HumanApprovalNode,
  notification: NotificationNode,
  slack: SlackNode,
  email: EmailNode,
};
