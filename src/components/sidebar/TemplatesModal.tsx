import { useEffect, useState } from "react";
import { Layout, X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import { getHRTemplates } from "@/api/client";
import { Button } from "@/components/ui/button";

export function TemplatesModal() {
  const open = useUIStore((s) => s.isTemplatesOpen);
  const close = useUIStore((s) => s.closeTemplates);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const existing = useWorkflowStore((s) => s.nodes.length);
  const [tpls, setTpls] = useState<any[]>([]);

  useEffect(() => {
    if (open) getHRTemplates().then(setTpls);
  }, [open]);

  if (!open) return null;

  const apply = (t: any) => {
    if (existing > 0 && !confirm("Replace current canvas?")) return;
    loadWorkflow({ nodes: t.nodes, edges: t.edges, name: t.name });
    close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center" onClick={close}>
      <div className="w-[640px] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold">HR Workflow templates</h2>
          <button onClick={close} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {tpls.map((t) => (
            <button
              key={t.id}
              onClick={() => apply(t)}
              className="text-left p-4 border border-border rounded-lg hover:border-brand hover:shadow-md transition group"
            >
              <Layout className="h-5 w-5 text-brand mb-2" />
              <div className="font-medium text-sm">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
              <div className="text-[10px] text-muted-foreground mt-2">
                {t.nodes.length} nodes · {t.edges.length} edges
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
