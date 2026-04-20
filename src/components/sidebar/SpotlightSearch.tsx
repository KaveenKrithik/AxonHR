import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import { NODE_REGISTRY } from "@/types/nodeRegistry";
import { getHRTemplates } from "@/api/client";
import { Search, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseTextToFlow } from "@/utils/textToFlow";

const PATTERNS = [
  { id: "tpl-onboarding", label: "Employee Onboarding template", kw: ["onboard", "hire", "new"] },
  { id: "tpl-leave", label: "Leave Approval template", kw: ["leave", "vacation"] },
  { id: "tpl-doc", label: "Document Verification template", kw: ["doc", "verify"] },
  { id: "tpl-off", label: "Offboarding Checklist template", kw: ["off", "exit"] },
];

export function SpotlightSearch() {
  const open = useUIStore((s) => s.spotlightOpen);
  const close = useUIStore((s) => s.closeSpotlight);
  const addNode = useWorkflowStore((s) => s.addNode);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const [q, setQ] = useState("");
  const [quickText, setQuickText] = useState("");

  const handleQuickBuild = () => {
    const { nodes, edges } = parseTextToFlow(quickText);
    if (nodes.length) {
      loadWorkflow({ nodes, edges, name: "Quick build" });
      setQuickText("");
      close();
    }
  };

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  if (!open) return null;

  const lc = q.toLowerCase();
  const nodeMatches = NODE_REGISTRY.filter(
    (n) =>
      !q ||
      n.label.toLowerCase().includes(lc) ||
      n.description.toLowerCase().includes(lc)
  ).slice(0, 6);
  const patternMatches = PATTERNS.filter(
    (p) => !q || p.kw.some((k) => lc.includes(k)) || p.label.toLowerCase().includes(lc)
  ).slice(0, 4);

  const pickTemplate = async (id: string) => {
    const tpls = await getHRTemplates();
    const map: Record<string, string> = {
      "tpl-onboarding": "onboarding",
      "tpl-leave": "leave",
      "tpl-doc": "docverify",
      "tpl-off": "offboarding",
    };
    const tpl = tpls.find((t) => t.id === map[id]);
    if (tpl) loadWorkflow({ nodes: tpl.nodes, edges: tpl.edges, name: tpl.name });
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-start justify-center pt-32"
      onClick={close}
    >
      <div
        className="w-[560px] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && close()}
            placeholder="Search nodes or templates…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
            <Wand2 className="h-4 w-4" /> Quick Build
          </div>
          <Textarea
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder="start → task → approval → end"
            className="mb-2 text-sm max-h-32"
          />
          <Button onClick={handleQuickBuild} className="w-full">
            Build Workflow
          </Button>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {nodeMatches.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1">Nodes</div>
              {nodeMatches.map((n) => {
                const Icon = (Icons as any)[n.icon] ?? Icons.Circle;
                return (
                  <button
                    key={n.type}
                    onClick={() => {
                      addNode(n.type);
                      close();
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-muted text-left"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded text-white" style={{ backgroundColor: `hsl(var(--${n.color}))` }}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{n.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {patternMatches.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1">Templates</div>
              {patternMatches.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickTemplate(p.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-muted text-left"
                >
                  <Icons.Layout className="h-4 w-4 text-brand" />
                  <span className="text-sm">{p.label}</span>
                </button>
              ))}
            </div>
          )}
          {nodeMatches.length === 0 && patternMatches.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">No matches</div>
          )}
        </div>
      </div>
    </div>
  );
}
