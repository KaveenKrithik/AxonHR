import { useEffect, useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import { NODE_REGISTRY } from "@/types/nodeRegistry";
import { getHRTemplates } from "@/api/client";
import { Search, Command, CornerDownLeft, ChevronRight, LayoutTemplate, PlusCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const PATTERNS = [
  { id: "tpl-onboarding", label: "Employee Onboarding", icon: "LayoutTemplate", description: "6-step new hire onboarding flow", kw: ["onboard", "hire", "new"] },
  { id: "tpl-leave", label: "Leave Approval", icon: "LayoutTemplate", description: "Standard leave processing with manager sign-off", kw: ["leave", "vacation"] },
  { id: "tpl-doc", label: "Document Verification", icon: "LayoutTemplate", description: "ID and contract verification workflow", kw: ["doc", "verify"] },
  { id: "tpl-off", label: "Offboarding Checklist", icon: "LayoutTemplate", description: "HR exit process and asset collection", kw: ["off", "exit"] },
];

import { parseTextToFlow } from "@/utils/textToFlow";

export function SpotlightSearch() {
  const open = useUIStore((s) => s.spotlightOpen);
  const close = useUIStore((s) => s.closeSpotlight);
  const addNode = useWorkflowStore((s) => s.addNode);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const [q, setQ] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setQ("");
      setSelectedIndex(0);
    }
  }, [open]);

  const lc = q.toLowerCase();
  
  const nodeMatches = useMemo(() => NODE_REGISTRY.filter(
    (n) => !q || n.label.toLowerCase().includes(lc) || n.description.toLowerCase().includes(lc)
  ), [lc, q]);

  const patternMatches = useMemo(() => PATTERNS.filter(
    (p) => !q || p.kw.some((k) => lc.includes(k)) || p.label.toLowerCase().includes(lc)
  ), [lc, q]);

  const allItems = useMemo(() => {
    const list = [
      ...nodeMatches.map(n => ({ ...n, itemType: 'node' as const })),
      ...patternMatches.map(p => ({ ...p, itemType: 'template' as const }))
    ];
    if (q.includes("->") || q.includes("→") || (q.length > 3 && !nodeMatches.length)) {
      list.push({
        id: "quick-build",
        label: "Quick Build: " + q,
        description: "Generate a multi-node workflow from this text using AI-style parsing.",
        icon: "Zap",
        itemType: "command" as any,
      } as any);
    }
    return list;
  }, [nodeMatches, patternMatches, q]);

  const selectedItem = allItems[selectedIndex];

  const handleAction = async (item: typeof allItems[0]) => {
    if (item.itemType === 'node') {
      addNode((item as any).type);
    } else if (item.itemType === 'template') {
      const tpls = await getHRTemplates();
      const map: Record<string, string> = {
        "tpl-onboarding": "onboarding",
        "tpl-leave": "leave",
        "tpl-doc": "docverify",
        "tpl-off": "offboarding",
      };
      const tpl = tpls.find((t) => t.id === map[item.id]);
      if (tpl) loadWorkflow({ nodes: tpl.nodes, edges: tpl.edges, name: tpl.name });
    } else if (item.id === 'quick-build') {
      const res = parseTextToFlow(q);
      if (res.nodes.length) loadWorkflow({ ...res, name: "AI Generated Flow" });
    }
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allItems.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
    }
    if (e.key === "Enter" && selectedItem) {
      handleAction(selectedItem);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#000000]/80 backdrop-blur-md flex items-start justify-center pt-[15vh] antialiased"
      onClick={close}
    >
      <div
        className="w-[750px] max-w-[95vw] bg-[#1c1c1c] border border-[#333333] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.currentTarget.focus()}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#333333]">
          <Search className="h-5 w-5 text-[#888888]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search nodes, templates, or commands..."
            className="flex-1 bg-transparent outline-none text-lg text-white placeholder:text-[#555555] font-light"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#2a2a2a] border border-[#3a3a3a] text-[10px] text-[#888888] font-medium uppercase tracking-wider">
            Esc
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 min-h-[440px] max-h-[440px]">
          {/* Results List */}
          <div className="flex-1 overflow-y-auto border-r border-[#262626] p-2 space-y-4 custom-scrollbar">
            {nodeMatches.length > 0 && (
              <section>
                <div className="px-3 py-2 text-[11px] font-medium text-[#555555] uppercase tracking-[0.1em]">Nodes</div>
                <div className="space-y-0.5 mt-1">
                  {nodeMatches.map((n, i) => {
                    const Icon = (Icons as any)[n.icon] ?? Icons.Circle;
                    const isSelected = selectedIndex === i;
                    return (
                      <button
                        key={n.type}
                        onMouseEnter={() => setSelectedIndex(i)}
                        onClick={() => handleAction({ ...n, itemType: 'node' })}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors group",
                          isSelected ? "bg-[#2d2d2d]" : "hover:bg-[#252525]"
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md border",
                          isSelected ? "bg-[#00D084] border-transparent text-black" : "bg-[#2a2a2a] border-[#3a3a3a] text-[#888888]"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm font-medium", isSelected ? "text-white" : "text-[#aaaaaa]")}>{n.label}</div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] text-[#00D084] font-medium opacity-80">
                            Add Node <CornerDownLeft className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {patternMatches.length > 0 && (
              <section>
                <div className="px-3 py-2 text-[11px] font-medium text-[#555555] uppercase tracking-[0.1em]">Templates</div>
                <div className="space-y-0.5 mt-1">
                  {patternMatches.map((p, i) => {
                    const idx = nodeMatches.length + i;
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={p.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleAction({ ...p, itemType: 'template' })}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isSelected ? "bg-[#2d2d2d]" : "hover:bg-[#252525]"
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md border",
                          isSelected ? "bg-[#00D084] border-transparent text-black" : "bg-[#2a2a2a] border-[#3a3a3a] text-[#888888]"
                        )}>
                          <LayoutTemplate className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-sm font-medium">
                          <div className={isSelected ? "text-white" : "text-[#aaaaaa]"}>{p.label}</div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] text-[#00D084] font-medium opacity-80">
                            Apply <CornerDownLeft className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {allItems.filter(item => item.itemType === 'command').length > 0 && (
              <section>
                <div className="px-3 py-2 text-[11px] font-medium text-[#555555] uppercase tracking-[0.1em]">Commands</div>
                <div className="space-y-0.5 mt-1">
                  {allItems.filter(item => item.itemType === 'command').map((item, i) => {
                    const idx = nodeMatches.length + patternMatches.length + i;
                    const isSelected = selectedIndex === idx;
                    const Icon = (Icons as any)[item.icon] ?? Zap;
                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleAction(item)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isSelected ? "bg-[#2d2d2d]" : "hover:bg-[#252525]"
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md border",
                          isSelected ? "bg-[#00D084] border-transparent text-black" : "bg-[#2a2a2a] border-[#3a3a3a] text-[#888888]"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-sm font-medium">
                          <div className={isSelected ? "text-white" : "text-[#aaaaaa]"}>{item.label}</div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] text-[#00D084] font-medium opacity-80">
                            Run <CornerDownLeft className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
            
            {allItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#444444] space-y-2 py-10">
                <Search className="h-10 w-10 opacity-20" />
                <p className="text-sm">No results for "{q}"</p>
              </div>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="w-[300px] bg-[#1a1a1a] p-6 flex flex-col items-center text-center">
            {selectedItem ? (
              <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] border border-[#333333] flex items-center justify-center mb-6 shadow-xl">
                  {selectedItem.itemType === 'node' ? (
                    <div className="p-3 rounded-xl text-black" style={{ backgroundColor: '#00D084' }}>
                       {(() => {
                         const Icon = (Icons as any)[(selectedItem as any).icon] ?? Icons.Circle;
                         return <Icon className="h-8 w-8" />;
                       })()}
                    </div>
                  ) : selectedItem.itemType === 'command' ? (
                    <div className="p-3 rounded-xl bg-[#00D084] text-black">
                      <Zap className="h-8 w-8" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#2a2a2a] text-[#00D084]">
                      <LayoutTemplate className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{selectedItem.label}</h3>
                <p className="text-sm text-[#888888] leading-relaxed mb-8">
                  {selectedItem.description}
                </p>
                
                <div className="w-full border-t border-[#2d2d2d] pt-6 space-y-4 text-left">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-[#555555]">Type</span>
                     <span className="bg-[#2a2a2a] px-2 py-0.5 rounded text-[#aaaaaa] capitalize">{selectedItem.itemType}</span>
                   </div>
                   {selectedItem.itemType === 'node' && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#555555]">Category</span>
                        <span className="text-[#aaaaaa]">{(selectedItem as any).category}</span>
                      </div>
                   )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#333333] space-y-4">
                <Command className="h-12 w-12 opacity-10" />
                <p className="text-xs uppercase tracking-widest font-semibold opacity-30">Select an item</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-10 border-t border-[#333333] bg-[#1a1a1a] flex items-center justify-between px-4">
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5 text-[10px] text-[#555555] font-medium">
               <span className="bg-[#2a2a2a] border border-[#3a3a3a] px-1 py-0.5 rounded text-[#888888]">↑↓</span>
               Navigate
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-[#555555] font-medium">
               <span className="bg-[#2a2a2a] border border-[#3a3a3a] px-1 py-0.5 rounded text-[#888888]">↵</span>
               Action
             </div>
          </div>
          <div className="flex items-center gap-2 text-[10pt] text-[#888888]">
            <span className="text-[10px] text-[#555555]">Actions</span>
            <div className="flex items-center gap-0.5 bg-[#2a2a2a] border border-[#3a3a3a] px-1.5 py-0.5 rounded">
              <Command className="h-2.5 w-2.5" />
              <span className="text-[10px] font-bold">K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
