import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  content: string;
  targetId: string;
}

const STEPS: Step[] = [
  {
    title: "Welcome to AxonHR",
    content: "Experience the next generation of HR automation. This designer allows you to build, simulate, and deploy complex workflows visually.",
    targetId: "designer-root",
  },
  {
    title: "HR Building Blocks",
    content: "Our library includes specific modules for Employee Onboarding, Leave Processing, Document Verification, and more. Drag them onto the canvas to start.",
    targetId: "node-sidebar",
  },
  {
    title: "Power-User Spotlight",
    content: "Press ⌘K (or Ctrl+K) anywhere to open the Spotlight Search. Add nodes, swap templates, or navigate the app at light speed.",
    targetId: "spotlight-hint",
  },
  {
    title: "Visual Logic Canvas",
    content: "Connect nodes by dragging from their handles. We use high-performance graph logic to ensure your HR flows are always valid.",
    targetId: "workflow-canvas",
  },
  {
    title: "AI-Powered Summary",
    content: "Our unique real-time engine translates your visual graph into clear, executive-friendly English. No more guessing what a complex flow does.",
    targetId: "summary-cloud",
  },
  {
    title: "Execution Sandbox",
    content: "Switch to the Sandbox to simulate your workflow. Inspect execution logs, see data flow, and ensure perfection before going live.",
    targetId: "run-workflow",
  },
  {
    title: "Secure Credentials",
    content: "Manage API keys and access tokens for third-party integrations (like Slack or Jira) securely in our encrypted credential vault.",
    targetId: "credentials-btn",
  },
  {
    title: "Ready-to-Go Templates",
    content: "Don't start from scratch. Pick from our library of battle-tested HR automation templates to get up and running in seconds.",
    targetId: "templates-btn",
  },
  {
    title: "Portability & Export",
    content: "Export your workflows as JSON files to version control them or share sophisticated automations with other departments.",
    targetId: "toolbar-actions",
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    setTimeout(() => setCurrentStep(0), 1000);
  }, []);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < STEPS.length) {
      const el = document.getElementById(STEPS[currentStep].targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep]);

  if (currentStep < 0 || currentStep >= STEPS.length) return null;

  const step = STEPS[currentStep];

  const finish = () => {
    setCurrentStep(-1);
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed background with cutout */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-500" 
        style={{
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${coords.left}px 100%, 
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px 100%, 
            100% 100%, 
            100% 0%
          )`
        }}
      />

      {/* Tooltip Card */}
      <div 
        className="absolute pointer-events-auto w-80 bg-card border border-primary/20 shadow-2xl rounded-2xl p-5 animate-in zoom-in-95 duration-300"
        style={{ 
          top: Math.min(window.innerHeight - 300, Math.max(20, coords.top + coords.height + 15)),
          left: Math.min(window.innerWidth - 340, Math.max(20, coords.left + (coords.width / 2) - 160)) 
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 bg-primary/10 rounded">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-bold text-sm tracking-tight">{step.title}</h4>
          <button onClick={finish} className="ml-auto p-1 hover:bg-muted rounded transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn("h-1 rounded-full transition-all", i === currentStep ? "w-4 bg-primary" : "w-1 bg-muted")} 
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
               <Button variant="ghost" size="sm" onClick={() => setCurrentStep(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
               </Button>
            )}
            <Button size="sm" onClick={() => currentStep === STEPS.length - 1 ? finish() : setCurrentStep(p => p + 1)}>
              {currentStep === STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
