import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "reactflow";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

const CustomEdgeInner = ({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  markerEnd, label, data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12,
  });
  const deleteEdge = useWorkflowStore((s) => s.deleteEdge);
  const animated = (data as any)?.animated;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: "hsl(var(--muted-foreground))",
          strokeWidth: 1.6,
          strokeDasharray: animated ? "6 6" : undefined,
          animation: animated ? "dash 1s linear infinite" : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute pointer-events-auto group"
        >
          {label && (
            <span className="bg-background border border-border text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              {label}
            </span>
          )}
          <button
            onClick={() => deleteEdge(id)}
            className="ml-1 opacity-0 group-hover:opacity-100 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
            title="Delete connection"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export const CustomEdge = memo(CustomEdgeInner);
export const edgeTypes = { custom: CustomEdge };
