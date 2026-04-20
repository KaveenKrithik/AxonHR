import { useRef } from "react";
import { Play, Download, Upload, Layout, Undo2, Redo2, FileText, KeyRound, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/workflowStore";
import { useUIStore } from "@/store/uiStore";
import { exportToFile, importFromFile } from "@/utils/serialiser";
import { toast } from "sonner";

export function Toolbar() {
  const { name, setName, nodes, edges, undo, redo, loadWorkflow, clearWorkflow } = useWorkflowStore();
  const ui = useUIStore();
  const fileInput = useRef<HTMLInputElement>(null);

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = await importFromFile(f);
      loadWorkflow(data);
      toast.success(`Imported ${data.name}`);
    } catch {
      toast.error("Invalid workflow file");
    }
    e.target.value = "";
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the entire canvas? This cannot be undone easily.")) {
      clearWorkflow();
    }
  };

  return (
    <header className="h-14 bg-[#1e1e1e] text-white flex items-center px-4 gap-3 shrink-0 z-30 border-b border-[#2d2d2d]">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 overflow-hidden p-0.5">
          <img src="/logo.png" alt="AxonHR Logo" className="w-full h-full object-contain mix-blend-screen scale-125" />
        </div>
        <span className="font-bold tracking-tighter text-base italic uppercase">
          Axon<span className="text-[#00D084] not-italic">HR</span>
        </span>
      </div>
      <div className="flex-1 flex justify-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent text-sm text-center font-medium outline-none border-b border-transparent hover:border-white/20 focus:border-[#00D084] px-2 py-1 max-w-xs transition-colors"
        />
      </div>
      <div id="toolbar-actions" className="flex items-center gap-1 shrink-0">
        <IconBtn title="Undo (⌘Z)" onClick={undo}><Undo2 className="h-4 w-4" /></IconBtn>
        <IconBtn title="Redo (⌘⇧Z)" onClick={redo}><Redo2 className="h-4 w-4" /></IconBtn>
        <span className="w-px h-6 bg-border mx-1" />
        <Button id="credentials-btn" variant="ghost" size="sm" className="h-8" onClick={ui.openCredentials}>
          <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Credentials
        </Button>
        <Button id="templates-btn" variant="ghost" size="sm" className="h-8" onClick={ui.openTemplates}>
          <Layout className="h-3.5 w-3.5 mr-1.5" /> Templates
        </Button>
        <input ref={fileInput} type="file" accept="application/json" hidden onChange={onImport} />
        <Button variant="ghost" size="sm" className="h-8 hover:bg-white/10" onClick={() => fileInput.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Import
        </Button>
        <Button variant="ghost" size="sm" className="h-8 hover:bg-white/10" onClick={() => exportToFile(nodes, edges, name)}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export
        </Button>
        <div className="w-px h-6 bg-[#2d2d2d] mx-1" />
        <Button variant="ghost" size="sm" className="h-8 hover:bg-red-500/20 text-red-400" onClick={handleClear}>
          Clear Canvas
        </Button>
        <Button id="run-workflow" size="sm" className="h-8 bg-[#00D084] hover:bg-[#00B070] text-black font-bold ml-2" onClick={ui.openSandbox}>
          <Play className="h-3.5 w-3.5 mr-1.5 fill-black" /> Run
        </Button>
      </div>
    </header>
  );
}

function IconBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-white/10 transition-colors">
      {children}
    </button>
  );
}
