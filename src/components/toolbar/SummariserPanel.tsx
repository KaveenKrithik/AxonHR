import { Copy, X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import { summariseWorkflow } from "@/utils/workflowSummariser";
import { toast } from "sonner";

export function SummariserPanel() {
  const open = useUIStore((s) => s.isSummariserOpen);
  const close = useUIStore((s) => s.closeSummariser);
  const { name, nodes, edges } = useWorkflowStore();
  if (!open) return null;
  const text = summariseWorkflow(nodes, edges);
  const html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/_(.+?)_/g, "<em>$1</em>");
  return (
    <div className="absolute top-14 left-0 right-0 z-20 bg-card border-b border-border shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-3xl mx-auto p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{name}</h3>
            <div className="text-xs text-muted-foreground mt-0.5">{nodes.length} nodes · {edges.length} connections</div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => { navigator.clipboard.writeText(text.replace(/\*\*|_/g, "")); toast.success("Copied"); }} className="h-8 px-2 inline-flex items-center gap-1 text-xs rounded hover:bg-muted">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button onClick={close} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-sm leading-relaxed mt-3" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
