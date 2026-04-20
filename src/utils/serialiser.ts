import type { WorkflowEdge, WorkflowNode } from "@/types";

const VERSION = "1.0.0";

export function serializeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name = "Untitled workflow"
): string {
  return JSON.stringify(
    { version: VERSION, name, createdAt: new Date().toISOString(), nodes, edges },
    null,
    2
  );
}

export function deserializeWorkflow(json: string): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  name: string;
  version: string;
  createdAt: string;
} {
  const parsed = JSON.parse(json);
  return {
    nodes: parsed.nodes ?? [],
    edges: parsed.edges ?? [],
    name: parsed.name ?? "Imported workflow",
    version: parsed.version ?? "0",
    createdAt: parsed.createdAt ?? new Date().toISOString(),
  };
}

export function exportToFile(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name: string
): void {
  const blob = new Blob([serializeWorkflow(nodes, edges, name)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.toLowerCase().replace(/\s+/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<{
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  name: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = deserializeWorkflow(reader.result as string);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
