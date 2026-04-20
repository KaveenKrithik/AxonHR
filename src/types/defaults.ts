import type { AnyNodeData, NodeType } from "./index";

export function defaultDataFor(type: NodeType): AnyNodeData {
  switch (type) {
    case "start":
      return { type, label: "Start", title: "Workflow start", metadata: {} };
    case "end":
      return {
        type,
        label: "End",
        endMessage: "Workflow complete",
        showSummary: true,
      };
    case "task":
      return {
        type,
        label: "Task",
        title: "New task",
        priority: "Medium",
        customFields: {},
      };
    case "approval":
      return {
        type,
        label: "Approval",
        title: "Needs approval",
        notifyVia: ["email"],
        autoApproveThreshold: 0,
      };
    case "automation":
      return { type, label: "Automation", title: "Run automation", actionParams: {} };
    case "addEmployee":
      return {
        type,
        label: "Add Employee",
        employeeName: "",
        email: "",
        role: "",
      };
    case "processLeave":
      return {
        type,
        label: "Process Leave",
        leaveType: "Annual",
        daysRequested: 1,
        approverId: "",
      };
    case "verifyDocument":
      return {
        type,
        label: "Verify Document",
        documentType: "ID",
        verifiedBy: "",
      };
    case "humanApproval":
      return {
        type,
        label: "Human Approval",
        title: "Manager sign-off",
        approverName: "",
        approverEmail: "",
        notifyVia: ["email"],
      };
    case "notification":
      return {
        type,
        label: "Notification",
        title: "Send notification",
        channel: "email",
        recipients: [],
        message: "",
      };
  }
}
