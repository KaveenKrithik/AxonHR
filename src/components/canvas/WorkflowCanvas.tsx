import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap, ReactFlowProvider, Panel,
  useReactFlow, type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowStore } from "@/store/workflowStore";
import { useUIStore } from "@/store/uiStore";
import { nodeTypes } from "@/components/nodes";
import { edgeTypes } from "./CustomEdge";
import { validateWorkflow } from "@/utils/graphValidator";
import type { NodeType } from "@/types";
import { NODE_REGISTRY } from "@/types/nodeRegistry";
import { Sparkles, MousePointerClick, FileText, Cloud, Copy } from "lucide-react";
import * as Icons from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { summariseWorkflow } from "@/utils/workflowSummariser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function CanvasInner() {
  const wrapper = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);

  const prevNodesLength = useRef(nodes.length);
  useEffect(() => {
    if (Math.abs(nodes.length - prevNodesLength.current) > 2 && rfInstance.current) {
      setTimeout(() => rfInstance.current?.fitView({ padding: 0.15, duration: 600 }), 100);
    }
    prevNodesLength.current = nodes.length;
  }, [nodes.length]);
  const onNodesChange = useWorkflowStore((s) => s.applyNodeChanges);
  const onEdgesChange = useWorkflowStore((s) => s.applyEdgeChanges);
  const connect = useWorkflowStore((s) => s.connect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const undo = useWorkflowStore((s) => s.undo);
  const selectNode = useUIStore((s) => s.selectNode);
  const deselectNode = useUIStore((s) => s.deselectNode);
  const openTemplates = useUIStore((s) => s.openTemplates);
  const redo = useWorkflowStore((s) => s.redo);

  const openSpotlight = useUIStore((s) => s.openSpotlight);
  const cursorMode = useUIStore((s) => s.cursorMode);
  const setCursorMode = useUIStore((s) => s.setCursorMode);

  // Recompute validation status whenever graph changes
  useEffect(() => {
    const r = validateWorkflow(nodes, edges);
    const errsByNode = new Map<string, string>();
    r.errors.forEach((e) => {
      if (e.nodeId && e.severity === "error") errsByNode.set(e.nodeId, e.message);
    });
    setNodes((ns) =>
      ns.map((n) => {
        const err = errsByNode.get(n.id);
        const isValid = !err;
        if ((n.data as any).isValid === isValid && (n.data as any).validationError === err) return n;
        return { ...n, data: { ...n.data, isValid, validationError: err } };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length, JSON.stringify(nodes.map((n) => n.data))]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type || !wrapper.current) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      // Offset to center the node
      const centeredPosition = {
        x: position.x - 120,
        y: position.y - 40
      };
      addNode(type, centeredPosition);
    },
    [screenToFlowPosition, addNode]
  );

  const animatedEdges = useMemo(
    () => edges.map((e) => ({ ...e, type: "custom" as const, data: { ...(e.data ?? {}) } })),
    [edges]
  );

  const isEmpty = nodes.length === 0;

  const [isHovering, setIsHovering] = useState(false);

  // Global Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key === "k") {
        e.preventDefault();
        openSpotlight();
      }
      if (isCmd && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (isCmd && e.key === "y") {
        e.preventDefault();
        redo();
      }
      if (!isCmd) {
        if (e.key === "s") setCursorMode("select");
        if (e.key === "p") setCursorMode("pan");
        if (e.key === "Escape") deselectNode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSpotlight, undo, redo, setCursorMode, deselectNode]);

  return (
    <div 
      ref={wrapper} 
      className="relative h-full w-full bg-canvas"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ReactFlow
        nodes={nodes}
        edges={animatedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={connect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(i) => (rfInstance.current = i)}
        onNodeClick={(_, n) => selectNode(n.id)}
        onPaneClick={deselectNode}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        panOnDrag={cursorMode === "pan"}
        selectionMode={cursorMode === "select" ? 1 : 0} // 1 is 'all'
        defaultEdgeOptions={{ type: "custom" }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background variant={BackgroundVariant.Lines} gap={24} size={1} color="#e5e7eb" />
        <Controls className="!bg-card !border !border-border !rounded-lg !shadow-md" />
        <MiniMap
          pannable
          zoomable
          className="!bg-card !border !border-border !rounded-lg"
          nodeColor={(n) => {
            const reg = NODE_REGISTRY.find((r) => r.type === (n.type as NodeType));
            return reg ? `hsl(var(--${reg.color}))` : "hsl(var(--muted))";
          }}
        />
        <Panel position="bottom-center" className="mb-6 z-50">
          <div className="flex bg-card shadow-lg border border-border rounded-xl px-4 py-2.5 gap-6 items-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Cursor</span>
              <div className="flex items-center gap-0.5">
                <button 
                  className={cn("p-1.5 rounded transition-colors", cursorMode === "select" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground")}
                  onClick={() => setCursorMode("select")}
                  title="Selection tool"
                >
                  <MousePointerClick className="h-4 w-4" />
                </button>
                <button 
                  className={cn("p-1.5 rounded transition-colors", cursorMode === "pan" ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground")}
                  onClick={() => setCursorMode("pan")}
                  title="Hand tool (Pan)"
                >
                  <Icons.Hand className="h-4 w-4" />
                </button>
                <button className="p-1.5 hover:bg-muted rounded text-muted-foreground" onClick={undo} title="Undo last action">
                  <Icons.Undo2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Nodes</span>
              <div className="flex items-center gap-1.5">
                {NODE_REGISTRY.slice(0, 6).map(n => {
                  const Icon = (Icons as any)[n.icon] || Icons.Circle;
                  return (
                    <div 
                      key={n.type} draggable 
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/reactflow", n.type);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => addNode(n.type)}
                      className="h-8 w-8 bg-background rounded-md flex items-center justify-center border shadow-sm hover:shadow-md hover:bg-muted active:scale-95 cursor-grab transition-all"
                      title={`Add ${n.label}`}
                      style={{ color: `hsl(var(--${n.color}))` }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Panel>
        <Panel position="top-right" className={cn("mt-4 mr-4 z-50 transition-all duration-300 flex flex-col items-end gap-4", isHovering ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none")}>
          <Popover>
            <PopoverTrigger asChild>
              <button id="summary-cloud" className="h-10 px-4 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg flex items-center gap-2 border-2 border-white/10 transition-all hover:scale-105 active:scale-95 group pointer-events-auto">
                <Cloud className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Summary</span>
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-96 p-4 max-h-[80vh] overflow-y-auto shadow-2xl mt-2 z-50 pointer-events-auto" style={{ zIndex: 9999 }}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Cloud className="h-5 w-5 text-brand" /> Summary</h3>
                <button onClick={() => { navigator.clipboard.writeText(summariseWorkflow(nodes, edges).replace(/\*\*|_/g, "")); toast.success("Copied"); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div 
                className="text-sm prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: summariseWorkflow(nodes, edges).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/_(.+?)_/g, "<em>$1</em>") 
                }} 
              />
            </PopoverContent>
          </Popover>

          <div className="flex flex-col gap-1.5 scale-90 origin-top-right opacity-60 hover:opacity-100 transition-opacity pointer-events-auto bg-card/40 backdrop-blur-[2px] p-2 rounded-lg border border-border/20">
             <Shortcut hint="⌘K" label="Spotlight" />
             <Shortcut hint="⌘Z" label="Undo" />
             <Shortcut hint="⌘Y" label="Redo" />
             <Shortcut hint="S" label="Select Mode" />
             <Shortcut hint="P" label="Pan Mode" />
             <Shortcut hint="Esc" label="Deselect" />
             <Shortcut hint="Del" label="Delete Node" />
          </div>
        </Panel>
      </ReactFlow>
      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto text-center max-w-md p-8 border-2 border-dashed border-border rounded-2xl bg-card/50 backdrop-blur-sm">
            <Sparkles className="h-10 w-10 mx-auto text-brand mb-3" />
            <h2 className="text-lg font-semibold">Your canvas is empty</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drop nodes from the sidebar, type a flow, or pick a template.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                id="spotlight-hint"
                onClick={openSpotlight}
                className="inline-flex items-center gap-1 bg-muted hover:bg-muted/70 px-3 py-1.5 rounded-full pointer-events-auto"
              >
                <MousePointerClick className="h-3 w-3" /> ⌘K Spotlight
              </button>
              <span className="inline-flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
                <FileText className="h-3 w-3" /> Quick build →
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Shortcut({ hint, label }: { hint: string; label: string }) {
  return (
    <div className="flex items-center justify-end gap-2 text-[10px] font-medium">
      <span className="text-muted-foreground uppercase tracking-tight">{label}</span>
      <kbd className="bg-card border border-border px-1.5 py-0.5 rounded shadow-sm text-foreground min-w-[24px] text-center">{hint}</kbd>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
