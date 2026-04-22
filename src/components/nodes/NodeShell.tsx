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

  // Modern Node Styling Refinement
  return (
    <div
      onClick={() => selectNode(id)}
      className={cn(
        "relative transition-all duration-300 flex flex-col w-[300px] group",
        "bg-white/98 dark:bg-[#0f1113]/98 backdrop-blur-md border-2 rounded-[24px]",
        "shadow-[0_10px_40px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.1)]",
        selected 
          ? "border-[#00D084] scale-[1.02] shadow-[0_0_25px_rgba(0,208,132,0.15)] ring-1 ring-[#00D084]/20" 
          : "border-gray-100 dark:border-white/[0.03] hover:border-[#00D084]/40 hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)]",
        invalid ? "border-red-500/50" : ""
      )}
    >
      {/* Subtle Mesh Background for Texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rounded-[24px] overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mesh" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
      </div>

      {/* Header with Type Tag and Icon */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <div 
            className="flex items-center justify-center h-9 w-9 rounded-[14px] text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)] transition-transform group-hover:scale-110 duration-500"
            style={{ 
              background: `linear-gradient(135deg, hsl(var(--${reg.color})) 0%, hsl(var(--${reg.color}), 0.8) 100%)` 
            }}
          >
            <IconCmp className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500/70">
              {reg.label === 'Start' ? 'Trigger' : reg.category || 'Node'}
            </span>
            <span className="text-[11px] font-bold text-gray-900 dark:text-gray-200 opacity-90">
               {reg.label === 'Start' ? 'Workflow Inlet' : reg.label}
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2.5">
          {status !== "idle" && (
             <div className="flex items-center p-1.5 rounded-full bg-white dark:bg-white/[0.03] shadow-sm border border-gray-50 dark:border-white/[0.05]">
                {status === "running" && <Icons.Loader2 className="h-3 w-3 animate-spin text-[#00D084]" />}
                {status === "passed" && <Icons.CheckCircle2 className="h-4 w-4 text-[#00D084]" />}
                {status === "failed" && <Icons.XCircle className="h-4 w-4 text-red-500" />}
                {status === "skipped" && <Icons.FastForward className="h-3.5 w-4 text-gray-400" />}
             </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 pb-6 pt-1 relative z-10 flex-1">
        <div className="flex flex-col gap-2">
           <div className="text-[15px] font-bold text-gray-900 dark:text-white leading-snug tracking-tight">
             {data.label}
           </div>
           {subtitle && (
             <div className="flex items-start gap-2">
                <div className="w-1 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: `hsl(var(--${reg.color}))` }} />
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400/90 leading-relaxed line-clamp-2 italic">
                  {subtitle}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Metadata / Action Footer */}
      <div className="mt-auto px-6 py-4 flex items-center justify-between border-t border-gray-100/50 dark:border-white/[0.03] bg-gray-50/30 dark:bg-white/[0.01] rounded-b-[24px] relative z-10">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.05]">
              <Icons.Tag className="h-2.5 w-2.5 text-gray-400" />
              <span className="text-[9px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                {rightBadge || "Auto"}
              </span>
           </div>
           {withYesNo && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                <Icons.Split className="h-2.5 w-2.5 text-amber-500" />
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Logic</span>
              </div>
           )}
        </div>
        
        <div className="flex -space-x-1">
           <div className="h-5 w-5 rounded-full border-2 border-white dark:border-[#0f1113] bg-gray-200 dark:bg-gray-800" />
           <div className="h-5 w-5 rounded-full border-2 border-white dark:border-[#0f1113] bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-[8px] font-bold">+</span>
           </div>
        </div>
      </div>

      {/* Connection Handles */}
      {data.type !== "start" && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="!bg-[#00D084] !border-[6px] !border-white dark:!border-[#0f1113] !w-5 !h-5 !-top-2.5 rounded-full shadow-lg cursor-crosshair transition-transform hover:scale-125 z-50 flex items-center justify-center group/handle"
        >
           <div className="w-1 h-1 bg-white rounded-full opacity-0 group-hover/handle:opacity-100" />
        </Handle>
      )}
      
      {!withYesNo && data.type !== "end" && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!bg-[#00D084] !border-[6px] !border-white dark:!border-[#0f1113] !w-6 !h-6 !-bottom-3 rounded-full shadow-xl cursor-crosshair transition-all hover:scale-110 z-50 flex items-center justify-center group/handle overflow-hidden" 
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
          <Icons.Plus className="h-3 w-3 text-white relative z-10" strokeWidth={4} />
        </Handle>
      )}

      {withYesNo && (
        <>
          <Handle 
            id="yes" 
            type="source" 
            position={Position.Bottom} 
            className="!bg-[#00D084] !border-[6px] !border-white dark:!border-[#0f1113] !w-6 !h-6 !-bottom-3 -ml-16 shadow-xl cursor-crosshair transition-all hover:scale-110 z-50 flex items-center justify-center overflow-hidden" 
          >
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#00D084] dark:text-[#00D084] uppercase tracking-widest bg-white dark:bg-[#0f1113] px-1.5 rounded-md border border-[#00D084]/20 shadow-sm">Yes</span>
            <Icons.Check className="h-3 w-3 text-white" strokeWidth={4} />
          </Handle>
          <Handle 
            id="no" 
            type="source" 
            position={Position.Bottom} 
            className="!bg-red-500 !border-[6px] !border-white dark:!border-[#0f1113] !w-6 !h-6 !-bottom-3 ml-16 shadow-xl cursor-crosshair transition-all hover:scale-110 z-50 flex items-center justify-center overflow-hidden" 
          >
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-red-500 lowercase tracking-widest bg-white dark:bg-[#0f1113] px-1.5 rounded-md border border-red-500/20 shadow-sm">No</span>
            <Icons.X className="h-3 w-3 text-white" strokeWidth={4} />
          </Handle>
        </>
      )}
    </div>
  );
};


export const NodeShell = memo(NodeShellInner);
