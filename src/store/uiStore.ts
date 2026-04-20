import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface UIState {
  selectedNodeId: string | null;
  isSidebarOpen: boolean;
  sidebarWidth: number;
  isSandboxOpen: boolean;
  isCredentialsOpen: boolean;
  spotlightOpen: boolean;
  isSummariserOpen: boolean;
  isTemplatesOpen: boolean;
  cursorMode: "select" | "pan";
  selectNode: (id: string) => void;
  deselectNode: () => void;
  setCursorMode: (mode: "select" | "pan") => void;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  openSandbox: () => void;
  closeSandbox: () => void;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  openSummariser: () => void;
  closeSummariser: () => void;
  openCredentials: () => void;
  closeCredentials: () => void;
  openTemplates: () => void;
  closeTemplates: () => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    selectedNodeId: null,
    isSidebarOpen: true,
    sidebarWidth: 280,
    isSandboxOpen: false,
    isCredentialsOpen: false,
    spotlightOpen: false,
    isSummariserOpen: false,
    isTemplatesOpen: false,
    cursorMode: "select",
    selectNode: (id) => set((s) => { s.selectedNodeId = id; }),
    deselectNode: () => set((s) => { s.selectedNodeId = null; }),
    setCursorMode: (mode) => set((s) => { s.cursorMode = mode; }),
    toggleSidebar: () => set((s) => { s.isSidebarOpen = !s.isSidebarOpen; }),
    setSidebarWidth: (w) => set((s) => { s.sidebarWidth = Math.min(420, Math.max(200, w)); }),
    openSandbox: () => set((s) => { s.isSandboxOpen = true; }),
    closeSandbox: () => set((s) => { s.isSandboxOpen = false; }),
    openSpotlight: () => set((s) => { s.spotlightOpen = true; }),
    closeSpotlight: () => set((s) => { s.spotlightOpen = false; }),
    openSummariser: () => set((s) => { s.isSummariserOpen = true; }),
    closeSummariser: () => set((s) => { s.isSummariserOpen = false; }),
    openCredentials: () => set((s) => { s.isCredentialsOpen = true; }),
    closeCredentials: () => set((s) => { s.isCredentialsOpen = false; }),
    openTemplates: () => set((s) => { s.isTemplatesOpen = true; }),
    closeTemplates: () => set((s) => { s.isTemplatesOpen = false; }),
  }))
);
