import { useEffect, useState } from "react";
import { Play, X, AlertTriangle, CheckCircle2, Copy, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import { Button } from "@/components/ui/button";
import { validateWorkflow } from "@/utils/graphValidator";
import { postSimulate } from "@/api/client";
import type { SimStep } from "@/types";
import { toast } from "sonner";

export function SandboxPanel() {
  const open = useUIStore((s) => s.isSandboxOpen);
  const close = useUIStore((s) => s.closeSandbox);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const patchStatus = useWorkflowStore((s) => s.patchNodeStatus);
  const reset = useWorkflowStore((s) => s.resetStatuses);
  const selectNode = useUIStore((s) => s.selectNode);

  const [steps, setSteps] = useState<SimStep[]>([]);
  const [running, setRunning] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const v = validateWorkflow(nodes, edges);
    setErrors(v.errors.filter((e) => e.severity === "error").map((e) => e.message));
  }, [open, nodes, edges]);

  if (!open) return null;

  const validation = validateWorkflow(nodes, edges);
  const errCount = validation.errors.filter((e) => e.severity === "error").length;
  const warnCount = validation.errors.filter((e) => e.severity === "warning").length;

  const run = async () => {
    setRunning(true);
    setSteps([]);
    setDone(false);
    reset();
    const result = await postSimulate({ nodes, edges });
    if (result.status === "error") {
      setErrors(result.validationErrors ?? []);
      setRunning(false);
      return;
    }
    for (const step of result.steps) {
      patchStatus(step.nodeId, "running");
      setSteps((p) => [...p, { ...step, status: "running" }]);
      await new Promise((r) => setTimeout(r, 600));
      patchStatus(step.nodeId, step.status === "skipped" ? "skipped" : step.status);
      setSteps((p) => p.map((s) => (s.nodeId === step.nodeId ? step : s)));
    }
    setRunning(false);
    setDone(true);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[400px] z-30 bg-card border-t border-border shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-semibold">Sandbox</h3>
          {errCount === 0 ? (
            <span className="text-xs inline-flex items-center gap-1 text-node-start">
              <CheckCircle2 className="h-3 w-3" /> Ready to run
            </span>
          ) : (
            <span className="text-xs inline-flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" /> {errCount} error{errCount > 1 ? "s" : ""}
              {warnCount > 0 ? `, ${warnCount} warning${warnCount > 1 ? "s" : ""}` : ""}
            </span>
          )}
        </div>
        <button onClick={close} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-[260px_1fr] flex-1 min-h-0">
        <div className="border-r border-border p-3 overflow-y-auto space-y-2">
          <Button size="sm" className="w-full h-8" disabled={errCount > 0 || running} onClick={run}>
            <Play className="h-3.5 w-3.5 mr-1.5" /> {running ? "Running…" : "Run simulation"}
          </Button>
          {running && <div className="h-1 bg-muted rounded overflow-hidden"><div className="h-full bg-brand animate-pulse" /></div>}
          <div className="text-xs font-semibold text-muted-foreground mt-3">Validation</div>
          {validation.errors.length === 0 && <div className="text-xs text-muted-foreground">No issues</div>}
          {validation.errors.map((e, i) => (
            <button
              key={i}
              onClick={() => e.nodeId && selectNode(e.nodeId)}
              className={`block w-full text-left text-xs p-2 rounded ${e.severity === "error" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}
            >
              {e.message}
            </button>
          ))}
        </div>
        <div className="p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Execution log</span>
            <div className="flex gap-1">
              <button
                onClick={() => { navigator.clipboard.writeText(JSON.stringify(steps, null, 2)); toast.success("Log copied"); }}
                className="text-xs h-6 px-2 inline-flex items-center gap-1 rounded hover:bg-muted"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
              <button
                onClick={() => { setSteps([]); setDone(false); reset(); }}
                className="text-xs h-6 px-2 inline-flex items-center gap-1 rounded hover:bg-muted"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
          {steps.length === 0 && <div className="text-xs text-muted-foreground">Run the workflow to see execution steps.</div>}
          <ol className="space-y-1.5">
            {steps.map((s, i) => {
              const color =
                s.status === "running" ? "bg-node-task animate-pulse" :
                s.status === "passed" ? "bg-node-start" :
                s.status === "failed" ? "bg-destructive" :
                "bg-muted-foreground";
              return (
                <li key={i} className="flex items-center gap-2 text-xs p-2 border border-border rounded">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="font-medium flex-1">{s.nodeLabel}</span>
                  <span className="text-muted-foreground">{s.message}</span>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]">{s.duration}ms</span>
                </li>
              );
            })}
          </ol>
          {done && <div className="text-xs text-node-start mt-3 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Workflow complete</div>}
          {errors.length > 0 && !running && (
            <div className="mt-3 border border-destructive/40 bg-destructive/10 rounded p-2 text-xs space-y-1">
              <div className="font-semibold text-destructive">Cannot run:</div>
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
