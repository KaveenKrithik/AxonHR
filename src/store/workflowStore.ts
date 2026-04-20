import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "reactflow";
import type {
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  AnyNodeData,
} from "@/types";
import { defaultDataFor } from "@/types/defaults";
import { NODE_REGISTRY_BY_TYPE } from "@/types/nodeRegistry";

interface Snapshot {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowState {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  past: Snapshot[];
  future: Snapshot[];
  setName: (n: string) => void;
  setNodes: (updater: (n: WorkflowNode[]) => WorkflowNode[]) => void;
  setEdges: (updater: (e: WorkflowEdge[]) => WorkflowEdge[]) => void;
  applyNodeChanges: (changes: NodeChange[]) => void;
  applyEdgeChanges: (changes: EdgeChange[]) => void;
  addNode: (type: NodeType, position?: { x: number; y: number }) => string;
  updateNodeData: (id: string, data: Partial<AnyNodeData>) => void;
  patchNodeStatus: (id: string, status: AnyNodeData["status"]) => void;
  resetStatuses: () => void;
  deleteNode: (id: string) => void;
  connect: (c: Connection) => void;
  deleteEdge: (id: string) => void;
  undo: () => void;
  redo: () => void;
  loadWorkflow: (data: { nodes: WorkflowNode[]; edges: WorkflowEdge[]; name?: string }) => void;
  clearWorkflow: () => void;
}

const MAX_HISTORY = 50;

const snapshot = (s: WorkflowState): Snapshot => ({
  nodes: JSON.parse(JSON.stringify(s.nodes)),
  edges: JSON.parse(JSON.stringify(s.edges)),
});

const pushHistory = (s: WorkflowState) => {
  s.past.push(snapshot(s));
  if (s.past.length > MAX_HISTORY) s.past.shift();
  s.future = [];
};

export const useWorkflowStore = create<WorkflowState>()(
  immer((set, get) => ({
    name: "Untitled workflow",
    nodes: [],
    edges: [],
    past: [],
    future: [],
    setName: (n) =>
      set((s) => {
        s.name = n;
      }),
    setNodes: (updater) =>
      set((s) => {
        s.nodes = updater(s.nodes) as any;
      }),
    setEdges: (updater) =>
      set((s) => {
        s.edges = updater(s.edges) as any;
      }),
    applyNodeChanges: (changes) =>
      set((s) => {
        s.nodes = applyNodeChanges(changes, s.nodes) as any;
      }),
    applyEdgeChanges: (changes) =>
      set((s) => {
        s.edges = applyEdgeChanges(changes, s.edges) as any;
      }),
    addNode: (type, position) => {
      const id = nanoid(8);
      set((s) => {
        pushHistory(s);
        const lastNode = s.nodes[s.nodes.length - 1];
        const pos =
          position ??
          (lastNode
            ? { x: lastNode.position.x, y: lastNode.position.y + 240 }
            : { x: 280, y: 80 });
        const data = defaultDataFor(type);
        const node: WorkflowNode = {
          id,
          type,
          position: pos,
          data: { ...data, id },
        } as WorkflowNode;
        s.nodes.push(node);
        if (lastNode && !position) {
          s.edges.push({
            id: `e-${lastNode.id}-${id}`,
            source: lastNode.id,
            target: id,
            type: "custom",
          });
        }
      });
      return id;
    },
    updateNodeData: (id, data) =>
      set((s) => {
        pushHistory(s);
        const n = s.nodes.find((x) => x.id === id);
        if (n) Object.assign(n.data, data);
      }),
    patchNodeStatus: (id, status) =>
      set((s) => {
        const n = s.nodes.find((x) => x.id === id);
        if (n) (n.data as any).status = status;
      }),
    resetStatuses: () =>
      set((s) => {
        s.nodes.forEach((n) => ((n.data as any).status = "idle"));
      }),
    deleteNode: (id) =>
      set((s) => {
        pushHistory(s);
        s.nodes = s.nodes.filter((n) => n.id !== id);
        s.edges = s.edges.filter((e) => e.source !== id && e.target !== id);
      }),
    connect: (c) =>
      set((s) => {
        if (!c.source || !c.target) return;
        pushHistory(s);
        s.edges.push({
          id: `e-${c.source}-${c.target}-${nanoid(4)}`,
          source: c.source,
          target: c.target,
          sourceHandle: c.sourceHandle ?? undefined,
          targetHandle: c.targetHandle ?? undefined,
          type: "custom",
          label: c.sourceHandle === "yes" ? "Yes" : c.sourceHandle === "no" ? "No" : undefined,
        });
      }),
    deleteEdge: (id) =>
      set((s) => {
        pushHistory(s);
        s.edges = s.edges.filter((e) => e.id !== id);
      }),
    undo: () =>
      set((s) => {
        const prev = s.past.pop();
        if (!prev) return;
        s.future.push(snapshot(s));
        s.nodes = prev.nodes;
        s.edges = prev.edges;
      }),
    redo: () =>
      set((s) => {
        const next = s.future.pop();
        if (!next) return;
        s.past.push(snapshot(s));
        s.nodes = next.nodes;
        s.edges = next.edges;
      }),
    loadWorkflow: (data) =>
      set((s) => {
        pushHistory(s);
        s.nodes = data.nodes as any;
        s.edges = data.edges as any;
        if (data.name) s.name = data.name;
      }),
    clearWorkflow: () =>
      set((s) => {
        pushHistory(s);
        s.nodes = [];
        s.edges = [];
      }),
  }))
);

// Helper to read NODE_REGISTRY for any callers
export { NODE_REGISTRY_BY_TYPE };
