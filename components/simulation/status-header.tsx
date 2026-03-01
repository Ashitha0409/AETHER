"use client"

import { useSimulation } from "@/lib/simulation-store"
import { ArrowRight } from "lucide-react"

const phaseLabels: Record<string, { text: string; color: string }> = {
  idle: { text: "AWAITING COMMAND", color: "text-muted-foreground" },
  generating: { text: "GENERATING DISASTER ZONE", color: "text-primary" },
  ready: { text: "FLOOD ZONE READY — AWAITING AI DEPLOYMENT", color: "text-warning" },
  deploying: { text: "INITIALIZING AUTONOMOUS AGENT", color: "text-primary" },
  running: { text: "AI AGENT ACTIVE — NAVIGATING TO SURVIVOR", color: "text-[#00ff88]" },
  complete: { text: "MISSION COMPLETE — TARGET REACHED", color: "text-[#00ff88]" },
}

const pipelineSteps = [
  { id: "ENV", label: "ENV GEN", phases: ["generating"] },
  { id: "PPO", label: "PPO AGENT", phases: ["deploying"] },
  { id: "ONNX", label: "ONNX RUNTIME", phases: ["running"] },
  { id: "EDGE", label: "EDGE AI", phases: ["running"] },
]

export function StatusHeader() {
  const { phase, computeMode, drone } = useSimulation()
  const { text, color } = phaseLabels[phase] ?? phaseLabels.idle

  return (
    <header className="glass-panel rounded-lg px-5 py-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-sm font-mono font-bold text-foreground tracking-wider">AETHER-SIM</h1>
            <span className="text-[9px] font-mono text-muted-foreground tracking-widest">
              ADAPTIVE SYNTHETIC DISASTER TRAINING ENGINE
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border/50" />
          <span className={`hidden sm:block text-[10px] font-mono tracking-wider ${color}`}>{text}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
            <span>POS</span>
            <span className="text-foreground">
              {drone.position[0].toFixed(1)}, {drone.position[1].toFixed(1)}, {drone.position[2].toFixed(1)}
            </span>
          </div>
          <div className="hidden md:block h-4 w-px bg-border/50" />
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${phase === "running" ? "bg-[#00ff88] animate-pulse-glow" : "bg-muted-foreground"
                }`}
            />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{computeMode}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1 border-t border-border/30 mt-1">
        {pipelineSteps.map((step, index) => {
          const isActive = step.phases.includes(phase)
          const isPast = index < pipelineSteps.findIndex(s => s.phases.includes(phase))

          return (
            <div key={step.id} className="flex items-center gap-2 md:gap-4 shrink-0">
              <div
                className={`flex items-center gap-2 rounded-md border px-2 py-1 transition-all duration-500 ${isActive
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                    : isPast
                      ? "border-[#00ff88]/30 bg-[#00ff88]/5 text-[#00ff88]/60"
                      : "border-border/30 bg-secondary/20 text-muted-foreground"
                  }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary animate-pulse" : isPast ? "bg-[#00ff88]/40" : "bg-border/50"}`} />
                <span className="text-[9px] font-mono font-bold tracking-widest">{step.label}</span>
              </div>
              {index < pipelineSteps.length - 1 && (
                <ArrowRight className={`h-3 w-3 ${isPast || isActive ? "text-primary/40" : "text-border/30"}`} />
              )}
            </div>
          )
        })}
      </div>
    </header>
  )
}

