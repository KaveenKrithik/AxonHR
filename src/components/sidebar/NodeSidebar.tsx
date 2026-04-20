import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Wand2, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, NODE_REGISTRY } from "@/types/nodeRegistry";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import { parseTextToFlow } from "@/utils/textToFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function NodeSidebar() {
  const isOpen = useUIStore((s) => s.isSidebarOpen);
  const width = useUIStore((s) => s.sidebarWidth);
  const setWidth = useUIStore((s) => s.setSidebarWidth);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const openTemplates = useUIStore((s) => s.openTemplates);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!(window as any).__resizingSidebar) return;
      setWidth(e.clientX);
    };
    const onUp = () => ((window as any).__resizingSidebar = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [setWidth]);

  if (!isOpen) {
    return (
      <button
        onClick={toggle}
        className="absolute z-20 top-20 left-2 h-9 w-9 inline-flex items-center justify-center rounded-md bg-card border border-border shadow hover:bg-muted"
        title="Show sidebar"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );
  }

  const filtered = NODE_REGISTRY.filter((n) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      n.label.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q)
    );
  });



  return (
    <TooltipProvider delayDuration={300}>
      <aside
        style={{ width }}
        className="relative h-full bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col shrink-0 text-slate-200"
      >
        <div className="p-4 border-b border-[#2d2d2d]">
          <h2 className="text-xl font-bold text-white mb-1">Building Blocks</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">Drag and drop actions or templates onto your canvas to build a workflow.</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps..."
              className="pl-8 h-9 text-sm bg-black/20 border-transparent text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#FF4F00]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {CATEGORIES.map((cat) => {
            const items = filtered.filter((n) => n.category === cat);
            if (!items.length) return null;
            const isCollapsed = collapsed[cat];
            return (
              <div key={cat} className="space-y-2">
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
                  className="w-full flex items-center gap-2 group"
                >
                  <ChevronDown className={cn("h-3.5 w-3.5 text-slate-500 transition-transform", isCollapsed && "-rotate-90")} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">{cat}</span>
                  <div className="flex-1 h-px bg-[#2d2d2d] ml-2"></div>
                </button>
                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-2 pl-2">
                    {items.map((n) => {
                      const Icon = (Icons as any)[n.icon] ?? Icons.Circle;
                      return (
                        <div
                          key={n.type}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("application/reactflow", n.type);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          className="group flex flex-col gap-1.5 p-3 rounded-xl bg-black/20 hover:bg-[#FF4F00]/10 border border-transparent hover:border-[#FF4F00]/30 cursor-grab active:cursor-grabbing transition-all"
                        >
                          <div className="flex items-center gap-2">
                             <span
                               className="flex h-6 w-6 items-center justify-center rounded-md text-white shrink-0 shadow-sm"
                               style={{ backgroundColor: n.type === 'start' || n.type === 'automation' ? '#FF4F00' : '#475569' }}
                             >
                               <Icon className="h-3.5 w-3.5" />
                             </span>
                             <div className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors">{n.label}</div>
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug">{n.description}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#2d2d2d]">
          <Button onClick={openTemplates} className="w-full h-10 bg-[#FF4F00] hover:bg-[#E54700] text-white font-bold border-0 transition-colors shadow-lg shadow-[#FF4F00]/20 rounded-xl">
            <Layout className="h-4 w-4 mr-2" /> Load HR Template
          </Button>
        </div>

        <div
          ref={dragRef}
          onMouseDown={() => ((window as any).__resizingSidebar = true)}
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-brand/40"
        />
      </aside>
    </TooltipProvider>
  );
}
