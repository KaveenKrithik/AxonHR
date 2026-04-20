import { useEffect, useRef } from "react";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import * as Icons from "lucide-react";
import { NODE_REGISTRY_BY_TYPE } from "@/types/nodeRegistry";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, X, Plus, Trash2 } from "lucide-react";
import { useEffect as useEffect2, useState } from "react";
import { getAutomations } from "@/api/client";
import type { AutomationAction } from "@/types";
import { useCredentialsStore } from "@/store/credentialsStore";

function KVEditor({
  value, onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const entries = Object.entries(value);
  return (
    <div className="space-y-1.5">
      {entries.map(([k, v], i) => (
        <div key={i} className="flex gap-1.5">
          <Input
            value={k}
            placeholder="key"
            onChange={(e) => {
              const next: Record<string, string> = {};
              entries.forEach(([kk, vv], idx) => (next[idx === i ? e.target.value : kk] = vv));
              onChange(next);
            }}
            className="h-7 text-xs"
          />
          <Input
            value={v}
            placeholder="value"
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
            className="h-7 text-xs"
          />
          <button
            onClick={() => {
              const next = { ...value };
              delete next[k];
              onChange(next);
            }}
            className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={() => onChange({ ...value, "": "" })}
      >
        <Plus className="h-3 w-3 mr-1" /> Add field
      </Button>
    </div>
  );
}

function TagInput({
  value, onChange, placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-muted text-xs rounded-full px-2 py-0.5">
            {v}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            e.preventDefault();
            onChange([...value, text.trim()]);
            setText("");
          }
        }}
        placeholder={placeholder ?? "Type and press Enter"}
        className="h-7 text-xs"
      />
    </div>
  );
}

export function ConfigPanel() {
  const selectedId = useUIStore((s) => s.selectedNodeId);
  const deselect = useUIStore((s) => s.deselectNode);
  const node = useWorkflowStore((s) =>
    s.nodes.find((n) => n.id === selectedId)
  );
  const update = useWorkflowStore((s) => s.updateNodeData);
  const del = useWorkflowStore((s) => s.deleteNode);
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const credentials = useCredentialsStore((s) => s.credentials);

  useEffect(() => {
    if (node?.type === "automation") getAutomations().then(setActions);
  }, [node?.type]);

  if (!node) return null;
  const reg = NODE_REGISTRY_BY_TYPE[node.type];
  const Icon = (Icons as any)[reg.icon] ?? Icons.Circle;
  const data: any = node.data;
  const isValid = data.isValid !== false;

  const set = (patch: Record<string, any>) => update(node.id, patch);

  return (
    <aside className="h-full w-[340px] shrink-0 border-l border-[#333333] bg-[#1a1a1a] flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-[#333333]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 items-center justify-center rounded text-black shrink-0" style={{ backgroundColor: '#00D084' }}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 text-white">
            <div className="text-sm font-semibold truncate">{reg.label}</div>
            <div className="text-[10px] text-[#888888]">Node configuration</div>
          </div>
        </div>
        <button onClick={deselect} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-[#2a2a2a] text-[#888888]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={`px-3 py-2 text-[11px] font-medium flex items-center gap-1.5 border-b border-[#333333] ${isValid ? "text-[#00D084] bg-[#00D084]/5" : "text-amber-500 bg-amber-500/5"}`}>
        {isValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {isValid ? "All requirements met" : data.validationError ?? "Missing required fields"}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        <div>
          <Label className="text-[11px] text-[#555555] uppercase tracking-wider mb-1.5 block">Label</Label>
          <Input value={data.label ?? ""} onChange={(e) => set({ label: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white focus:ring-[#00D084]" />
        </div>

        {/* START */}
        {node.type === "start" && (
          <>
            <Field label="Start title*"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Metadata"><KVEditor value={data.metadata ?? {}} onChange={(v) => set({ metadata: v })} /></Field>
          </>
        )}

        {/* TASK */}
        {node.type === "task" && (
          <>
            <Field label="Title*"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Description"><Textarea value={data.description ?? ""} onChange={(e) => set({ description: e.target.value })} rows={2} className="bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Assignee*"><Input value={data.assignee ?? ""} onChange={(e) => set({ assignee: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Due date*"><Input type="date" value={data.dueDate ?? ""} onChange={(e) => set({ dueDate: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Custom fields"><KVEditor value={data.customFields ?? {}} onChange={(v) => set({ customFields: v })} /></Field>
          </>
        )}

        {/* APPROVAL */}
        {node.type === "approval" && (
          <>
            <Field label="Title*"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Approver role*">
              <Select value={data.approverRole ?? ""} options={["", "Manager", "HRBP", "Director", "CEO"]} onChange={(v) => set({ approverRole: v || undefined })} />
            </Field>
            <Field label={`Auto-approve threshold: ${data.autoApproveThreshold ?? 0}%`}>
              <Slider value={[data.autoApproveThreshold ?? 0]} max={100} step={1} onValueChange={([v]) => set({ autoApproveThreshold: v })} />
            </Field>
          </>
        )}

        {/* AUTOMATION */}
        {node.type === "automation" && (
          <>
            <Field label="Title*"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Action*">
              <Select value={data.actionId ?? ""} options={["", ...actions.map((a) => a.id)]} labels={["—", ...actions.map((a) => `${a.category}: ${a.label}`)]} onChange={(v) => set({ actionId: v || undefined, actionParams: {} })} />
            </Field>
            {data.actionId && actions.find((a) => a.id === data.actionId)?.params.map((p) => (
              <Field key={p} label={p}>
                <Input value={data.actionParams?.[p] ?? ""} onChange={(e) => set({ actionParams: { ...(data.actionParams ?? {}), [p]: e.target.value } })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" />
              </Field>
            ))}
          </>
        )}

        {/* ADD EMPLOYEE */}
        {node.type === "addEmployee" && (
          <>
            <Field label="Employee name*"><Input value={data.employeeName ?? ""} onChange={(e) => set({ employeeName: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Email*"><Input type="email" value={data.email ?? ""} onChange={(e) => set({ email: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Department">
              <Select value={data.department ?? ""} options={["", "Engineering", "HR", "Finance", "Sales", "Marketing", "Legal", "Operations"]} onChange={(v) => set({ department: v || undefined })} />
            </Field>
            <Field label="Role*"><Input value={data.role ?? ""} onChange={(e) => set({ role: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Start date"><Input type="date" value={data.startDate ?? ""} onChange={(e) => set({ startDate: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Manager"><Input value={data.manager ?? ""} onChange={(e) => set({ manager: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
          </>
        )}

        {/* PROCESS LEAVE */}
        {node.type === "processLeave" && (
          <>
            <Field label="Leave type">
              <Select value={data.leaveType} options={["Annual", "Sick", "Maternity", "Paternity", "Unpaid", "Emergency"]} onChange={(v) => set({ leaveType: v })} />
            </Field>
            <Field label="Days requested*"><Input type="number" value={data.daysRequested ?? 1} onChange={(e) => set({ daysRequested: Number(e.target.value) })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Reason"><Textarea value={data.reason ?? ""} onChange={(e) => set({ reason: e.target.value })} rows={2} className="bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Requires document"><Switch checked={!!data.requiresDocument} onCheckedChange={(v) => set({ requiresDocument: v })} /></Field>
            <Field label="Approver*"><Input value={data.approverId ?? ""} onChange={(e) => set({ approverId: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
          </>
        )}

        {/* VERIFY DOCUMENT */}
        {node.type === "verifyDocument" && (
          <>
            <Field label="Document type">
              <Select value={data.documentType} options={["ID", "Contract", "Certificate", "Policy", "Other"]} onChange={(v) => set({ documentType: v })} />
            </Field>
            <Field label="Verified by*"><Input value={data.verifiedBy ?? ""} onChange={(e) => set({ verifiedBy: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Expiry date"><Input type="date" value={data.expiryDate ?? ""} onChange={(e) => set({ expiryDate: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Notify on pass"><Input value={data.notifyOnPass ?? ""} onChange={(e) => set({ notifyOnPass: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Notify on fail"><Input value={data.notifyOnFail ?? ""} onChange={(e) => set({ notifyOnFail: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Auto reject"><Switch checked={!!data.autoReject} onCheckedChange={(v) => set({ autoReject: v })} /></Field>
          </>
        )}

        {/* SLACK INTEGRATION */}
        {node.type === "slack" && (
          <>
            <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Slack Channel*"><Input value={data.channel ?? ""} placeholder="#general, @user, or ID" onChange={(e) => set({ channel: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Message*"><Textarea value={data.message ?? ""} onChange={(e) => set({ message: e.target.value })} rows={3} className="bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Credential">
              <Select value={data.credentialId ?? ""} options={["", ...credentials.filter(c => c.type === 'slack').map((c) => c.id)]} labels={["—", ...credentials.filter(c => c.type === 'slack').map((c) => c.name)]} onChange={(v) => set({ credentialId: v || undefined })} />
            </Field>
          </>
        )}

        {/* EMAIL INTEGRATION */}
        {node.type === "email" && (
          <>
            <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Recipient*"><Input value={data.recipient ?? ""} placeholder="employee@company.com" onChange={(e) => set({ recipient: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Subject*"><Input value={data.subject ?? ""} onChange={(e) => set({ subject: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Message*"><Textarea value={data.message ?? ""} onChange={(e) => set({ message: e.target.value })} rows={3} className="bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Credential">
              <Select value={data.credentialId ?? ""} options={["", ...credentials.filter(c => c.type === 'smtp').map((c) => c.id)]} labels={["—", ...credentials.filter(c => c.type === 'smtp').map((c) => c.name)]} onChange={(v) => set({ credentialId: v || undefined })} />
            </Field>
          </>
        )}

        {/* HUMAN APPROVAL */}
        {node.type === "humanApproval" && (
          <>
            <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Approver name*"><Input value={data.approverName ?? ""} onChange={(e) => set({ approverName: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Approver email*"><Input type="email" value={data.approverEmail ?? ""} onChange={(e) => set({ approverEmail: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Notify via"><CheckboxGroup options={["email", "slack"]} value={data.notifyVia ?? []} onChange={(v) => set({ notifyVia: v })} /></Field>
            {data.notifyVia?.includes("slack") && (
              <Field label="Slack user ID"><Input value={data.slackUserId ?? ""} onChange={(e) => set({ slackUserId: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            )}
            <Field label="Due date"><Input type="date" value={data.dueDate ?? ""} onChange={(e) => set({ dueDate: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Reminder after (hours)"><Input type="number" value={data.reminderHours ?? ""} onChange={(e) => set({ reminderHours: Number(e.target.value) })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Message"><Textarea value={data.message ?? ""} onChange={(e) => set({ message: e.target.value })} rows={2} className="bg-black/20 border-[#333333] text-white" /></Field>
          </>
        )}

        {/* NOTIFICATION */}
        {node.type === "notification" && (
          <>
            <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set({ title: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Channel">
              <Select value={data.channel} options={["email", "slack", "both"]} onChange={(v) => set({ channel: v })} />
            </Field>
            <Field label="Recipients*"><TagInput value={data.recipients ?? []} onChange={(v) => set({ recipients: v })} placeholder="email@co.com, then Enter" /></Field>
            {(data.channel === "email" || data.channel === "both") && (
              <Field label="Subject"><Input value={data.subject ?? ""} onChange={(e) => set({ subject: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            )}
            <Field label="Message*"><Textarea value={data.message ?? ""} onChange={(e) => set({ message: e.target.value })} rows={3} className="bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Credential">
              <Select value={data.credentialId ?? ""} options={["", ...credentials.map((c) => c.id)]} labels={["—", ...credentials.map((c) => `${c.name} (${c.type})`)]} onChange={(v) => set({ credentialId: v || undefined })} />
            </Field>
            <Field label="Send at">
              <Select value={data.sendAt ?? "Immediately"} options={["Immediately", "On workday start", "On workday end", "Custom"]} onChange={(v) => set({ sendAt: v })} />
            </Field>
            {data.sendAt === "Custom" && (
              <Field label="Custom time"><Input type="datetime-local" value={data.customTime ?? ""} onChange={(e) => set({ customTime: e.target.value })} className="h-8 text-sm bg-black/20 border-[#333333] text-white" /></Field>
            )}
          </>
        )}

        {/* END */}
        {node.type === "end" && (
          <>
            <Field label="End message*"><Textarea value={data.endMessage ?? ""} onChange={(e) => set({ endMessage: e.target.value })} rows={2} className="bg-black/20 border-[#333333] text-white" /></Field>
            <Field label="Tredence Analytics Summary"><Switch checked={!!data.showSummary} onCheckedChange={(v) => set({ showSummary: v })} /></Field>
          </>
        )}
      </div>

      <div className="border-t border-[#333333] p-4">
        <Button variant="destructive" size="sm" className="w-full h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20" onClick={() => { del(node.id); deselect(); }}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete node
        </Button>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-[#555555] uppercase tracking-wider block">{label}</Label>
      {children}
    </div>
  );
}

function Select({ value, options, labels, onChange }: { value: string; options: string[]; labels?: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-md border border-[#333333] bg-black/20 px-2 text-sm text-white focus:ring-[#00D084]"
    >
      {options.map((o, i) => (
        <option key={o + i} value={o} className="bg-[#1a1a1a]">{labels ? labels[i] : (o || "—")}</option>
      ))}
    </select>
  );
}

function CheckboxGroup({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => {
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  };
  return (
    <div className="flex gap-4">
      {options.map((o) => (
        <label key={o} className="text-xs inline-flex items-center gap-2 capitalize text-[#aaaaaa] cursor-pointer hover:text-white transition-colors">
          <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} className="rounded border-[#333333] bg-black/20 text-[#00D084] focus:ring-[#00D084]" />
          {o}
        </label>
      ))}
    </div>
  );
}
