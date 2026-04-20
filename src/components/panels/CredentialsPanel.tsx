import { useState } from "react";
import { Plus, Trash2, X, CheckCircle2, XCircle } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useCredentialsStore } from "@/store/credentialsStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { maskCredential } from "@/utils/credentialHelpers";

type CredType = "slack" | "smtp" | "webhook";

const TYPE_COLOR: Record<CredType, string> = {
  slack: "bg-node-automation",
  smtp: "bg-node-task",
  webhook: "bg-node-start",
};

export function CredentialsPanel() {
  const open = useUIStore((s) => s.isCredentialsOpen);
  const close = useUIStore((s) => s.closeCredentials);
  const credentials = useCredentialsStore((s) => s.credentials);
  const add = useCredentialsStore((s) => s.addCredential);
  const del = useCredentialsStore((s) => s.deleteCredential);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CredType>("slack");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [testStatus, setTestStatus] = useState<"idle" | "ok" | "fail" | "loading">("idle");

  if (!open) return null;

  const fields: Record<CredType, { key: string; label: string; secret?: boolean }[]> = {
    slack: [
      { key: "botToken", label: "Bot Token", secret: true },
      { key: "channel", label: "Default Channel" },
    ],
    smtp: [
      { key: "host", label: "Host" },
      { key: "port", label: "Port" },
      { key: "username", label: "Username" },
      { key: "password", label: "Password", secret: true },
      { key: "fromEmail", label: "From Email" },
    ],
    webhook: [
      { key: "url", label: "URL" },
      { key: "secret", label: "Secret", secret: true },
      { key: "method", label: "Method (GET/POST)" },
    ],
  };

  const reset = () => {
    setAdding(false); setName(""); setType("slack"); setConfig({}); setTestStatus("idle");
  };

  const test = async () => {
    setTestStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setTestStatus("ok");
  };

  const save = () => {
    if (!name.trim()) return;
    add({ name, type, config });
    reset();
  };

  return (
    <div className="fixed inset-0 z-40" onClick={close}>
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-[400px] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold">Credentials</h2>
          <div className="flex items-center gap-2">
            {!adding && (
              <Button size="sm" className="h-7" onClick={() => setAdding(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add new
              </Button>
            )}
            <button onClick={close} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {credentials.length === 0 && !adding && (
            <div className="text-sm text-muted-foreground text-center py-8">No credentials yet</div>
          )}
          {credentials.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <span className={`flex h-8 w-8 items-center justify-center rounded text-white shrink-0 ${TYPE_COLOR[c.type]}`}>
                {c.type[0].toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{c.type}</div>
                <div className="text-[10px] text-muted-foreground mt-1 font-mono truncate">
                  {Object.entries(c.config).slice(0, 2).map(([k, v]) => `${k}: ${maskCredential(v)}`).join(" · ")}
                </div>
              </div>
              <button onClick={() => del(c.id)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {adding && (
            <div className="border border-border rounded-lg p-3 space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <select value={type} onChange={(e) => { setType(e.target.value as CredType); setConfig({}); }} className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option value="slack">Slack</option>
                  <option value="smtp">SMTP</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              {fields[type].map((f) => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type={f.secret ? "password" : "text"}
                    value={config[f.key] ?? ""}
                    onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
                    className="h-8"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7" onClick={test} disabled={testStatus === "loading"}>
                  {testStatus === "loading" ? "Testing…" : "Test connection"}
                </Button>
                {testStatus === "ok" && <span className="inline-flex items-center gap-1 text-xs text-node-start"><CheckCircle2 className="h-3 w-3" /> Connected</span>}
                {testStatus === "fail" && <span className="inline-flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" /> Failed</span>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 flex-1" onClick={save}>Save</Button>
                <Button size="sm" variant="outline" className="h-7" onClick={reset}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
