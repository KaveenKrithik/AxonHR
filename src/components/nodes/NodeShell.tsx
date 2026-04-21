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

const NodeShellInner = ({ id, data, selected, subtitle, rightBadge, withYesNo }: Props) => {
  const reg = NODE_REGISTRY_BY_TYPE[data.type];
  const IconCmp = (Icons as any)[reg.icon] ?? Icons.Circle;
  const selectNode = useUIStore((s) => s.selectNode);
  const status = data.status ?? "idle";
  const invalid = data.isValid === false;

  // Modern Node Styling
  return (
    <div
      onClick={() => selectNode(id)}
      className={cn(
        "relative transition-all duration-300 flex flex-col w-[280px]",
        "bg-white/95 dark:bg-[#1a1c1e]/95 backdrop-blur-sm border-2 rounded-[20px]",
        "shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
        selected 
          ? "border-[#00D084] scale-[1.02] shadow-[0_0_20px_rgba(0,208,132,0.2)]" 
          : "border-gray-100 dark:border-white/5 hover:border-[#00D084]/50",
        invalid ? "border-red-500/50" : ""
      )}
    >
      {/* Header with Type Tag and Icon */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center h-8 w-8 rounded-xl text-white shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, hsl(var(--${reg.color})) 0%, hsl(var(--${reg.color}), 0.8) 100%)` 
            }}
          >
            <IconCmp className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {reg.label === 'Start' ? 'Trigger' : reg.label}
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {rightBadge && (
             <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
               {rightBadge}
             </span>
          )}
          {status !== "idle" && (
             <div className="flex items-center">
                {status === "running" && <Icons.Loader2 className="h-3 w-3 animate-spin text-green-400" />}
                {status === "passed" && <Icons.CheckCircle2 className="h-4 w-4 text-[#00D084]" />}
                {status === "failed" && <Icons.XCircle className="h-4 w-4 text-red-400" />}
                {status === "skipped" && <Icons.FastForward className="h-3.5 w-4 text-gray-400" />}
             </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 pb-5 pt-2">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {data.label}
        </div>
        {subtitle && (
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5 line-clamp-2">
            {subtitle}
          </div>
        )}
      </div>

      {/* Action Footer for Yes/No (Decision nodes) */}
      {withYesNo && (
        <div className="border-t border-gray-50 dark:border-white/5 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02] rounded-b-[20px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logic split</span>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            <div className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
          </div>
        </div>
      )}

      {/* Handles - Redesigned to be more integrated */}
      {data.type !== "start" && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="!bg-[#00D084] !border-4 !border-white dark:!border-[#1a1c1e] !w-3 !h-3 !-top-1.5 rounded-full transition-transform hover:scale-125" 
        />
      )}
      
      {!withYesNo && data.type !== "end" && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!bg-[#00D084] !border-4 !border-white dark:!border-[#1a1c1e] !w-4 !h-4 !-bottom-2 rounded-full transition-transform hover:scale-125 flex items-center justify-center" 
        >
          <div className="h-1 w-1 bg-white rounded-full" />
        </Handle>
      )}

      {withYesNo && (
        <>
          <Handle 
            id="yes" 
            type="source" 
            position={Position.Bottom} 
            className="!bg-green-500 !border-4 !border-white dark:!border-[#1a1c1e] !w-4 !h-4 !-bottom-2 -ml-12" 
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-green-600 dark:text-green-500 uppercase tracking-tighter">Yes</span>
          </Handle>
          <Handle 
            id="no" 
            type="source" 
            position={Position.Bottom} 
            className="!bg-red-400 !border-4 !border-white dark:!border-[#1a1c1e] !w-4 !h-4 !-bottom-2 ml-12" 
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-500 dark:text-red-400 uppercase tracking-tighter">No</span>
          </Handle>
        </>
      )}
    </div>
  );
};

export const NodeShell = memo(NodeShellInner);
