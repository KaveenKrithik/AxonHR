import { useEffect } from "react";
import { Toolbar } from "@/components/toolbar/Toolbar";

import { NodeSidebar } from "@/components/sidebar/NodeSidebar";
import { SpotlightSearch } from "@/components/sidebar/SpotlightSearch";
import { TemplatesModal } from "@/components/sidebar/TemplatesModal";
import { WorkflowCanvas } from "@/components/canvas/WorkflowCanvas";
import { ConfigPanel } from "@/components/panels/ConfigPanel";
import { CredentialsPanel } from "@/components/panels/CredentialsPanel";
import { SandboxPanel } from "@/components/panels/SandboxPanel";
import { useUIStore } from "@/store/uiStore";
import { useWorkflowStore } from "@/store/workflowStore";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

const Index = () => {
  const ui = useUIStore();
  const { undo, redo, deleteNode } = useWorkflowStore();
  const selectedId = useUIStore((s) => s.selectedNodeId);

  useEffect(() => {
    document.title = "AxonHR — Visual workflow builder";
    const meta =
      document.querySelector('meta[name="description"]') ??
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute("content", "Build, validate and simulate HR workflows with a drag-and-drop visual editor.");
    if (!meta.parentElement) document.head.appendChild(meta);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField =
        ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.openSpotlight();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if ((e.key === "Backspace" || e.key === "Delete") && !inField && selectedId) {
        e.preventDefault();
        deleteNode(selectedId);
        ui.deselectNode();
      } else if (e.key === "Escape") {
        ui.deselectNode();
        ui.closeSpotlight();
        ui.closeSummariser();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ui, undo, redo, deleteNode, selectedId]);

  return (
    <div id="designer-root" className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <Toolbar />
      <div className="relative flex-1 flex min-h-0 bg-[#1e1e1e]">
        <div id="node-sidebar" className="opacity-0 w-0 md:opacity-100 md:w-auto transition-all">
          <NodeSidebar />
        </div>
        <main id="workflow-canvas" className="flex-1 relative min-w-0 bg-background rounded-tl-xl overflow-hidden mt-2 mx-2 mb-2 shadow-2xl text-foreground">
          <WorkflowCanvas />
          <SandboxPanel />
        </main>
        {selectedId && <ConfigPanel />}
      </div>
      <SpotlightSearch />
      <TemplatesModal />
      <CredentialsPanel />
      <OnboardingTour />
    </div>
  );
};

export default Index;
