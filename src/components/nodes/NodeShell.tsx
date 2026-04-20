import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_REGISTRY_BY_TYPE } from "@/types/nodeRegistry";
import type { AnyNodeData } from "@/types";
import { useUIStore } from "@/store/uiStore";

interface Props extends NodeProps<AnyNodeData> {
  shape?: "rect" | "pill" | "diamond";
  subtitle?: string;
  rightBadge?: string;
  withYesNo?: boolean;
}

const NodeShellInner = ({ id, data, selected, shape = "rect", subtitle, rightBadge, withYesNo }: Props) => {
  const reg = NODE_REGISTRY_BY_TYPE[data.type];
  const IconCmp = (Icons as any)[reg.icon] ?? Icons.Circle;
  const selectNode = useUIStore((s) => s.selectNode);
  const status = data.status ?? "idle";
  const invalid = data.isValid === false;

  return (
    <div
      onClick={() => selectNode(id)}
      className={cn(
        "relative group transition-all duration-200 flex",
        shape === "diamond" 
          ? "rounded-none rotate-45 w-[120px] h-[120px] items-center justify-center bg-[#e0f3f2] border-2 border-primary/20 shadow-lg p-0" 
          : "rounded-xl min-w-[260px] max-w-[300px] bg-card text-card-foreground border-2 shadow-md overflow-hidden",
        selected ? "border-primary ring-4 ring-primary/10" : "border-border hover:border-primary/40",
        invalid ? "border-destructive/50" : "",
        shape === "pill" && "rounded-full"
      )}
    >
      {/* Structural Accent Strip */}
      {shape !== "diamond" && (
        <div 
          className="w-1 shrink-0" 
          style={{ backgroundColor: `hsl(var(--${reg.color}))` }} 
        />
      )}

      <div className={cn("flex-1 flex flex-col", shape === "diamond" && "-rotate-45 items-center justify-center")}>
        {shape !== "diamond" && (
          <div className="px-4 pt-4 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="flex items-center justify-center p-1.5 rounded-lg text-white shadow-sm"
                style={{ backgroundColor: `hsl(var(--${reg.color}))` }}
              >
                <IconCmp className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {reg.label === 'Start' ? 'Trigger' : reg.label}
              </span>
            </div>
            {status !== "idle" && (
               <div className="flex items-center">
                  {status === "running" && <Icons.Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  {status === "passed" && <Icons.CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  {status === "failed" && <Icons.XCircle className="h-3.5 w-3.5 text-destructive" />}
                  {status === "skipped" && <Icons.FastForward className="h-3.5 w-3.5 text-muted-foreground" />}
               </div>
            )}
          </div>
        )}

        <div className={cn("p-4 flex-1 flex flex-col justify-center", shape === "diamond" && "text-center")}>
          <div className={cn("text-base font-bold leading-tight text-foreground truncate", shape === "diamond" && "text-lg")}>
            {shape === "diamond" ? "Decision" : data.label}
          </div>
          {subtitle && shape !== "diamond" && (
            <div className="text-[11px] font-medium text-muted-foreground leading-relaxed mt-1 line-clamp-2">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Handles */}
      {data.type !== "start" && (
        <Handle type="target" position={Position.Top} className="!bg-[#00D084] !border-none !w-2 !h-2 rounded-full cursor-pointer" />
      )}
      {data.type !== "end" && !withYesNo && (
        <Handle type="source" position={Position.Right} className="!bg-[#00D084] !border-none !w-2 !h-2 rounded-full cursor-pointer" />
      )}
      {withYesNo && (
        <>
          <Handle id="yes" type="source" position={Position.Top} className="!bg-[#00D084] !border-none !w-2 !h-2 cursor-pointer" style={{ right: "10%" }}>
            <span className="absolute left-3 -top-2 text-[9px] font-medium text-muted-foreground">Yes</span>
          </Handle>
          <Handle id="no" type="source" position={Position.Bottom} className="!bg-[#00D084] !border-none !w-2 !h-2 cursor-pointer" style={{ right: "10%" }}>
            <span className="absolute right-3 -top-2 text-[9px] font-medium text-muted-foreground">No</span>
          </Handle>
          <Handle type="source" position={Position.Right} className="!bg-[#00D084] !border-none !w-2 !h-2" />
        </>
      )}
    </div>
  );
};

export const NodeShell = memo(NodeShellInner);
