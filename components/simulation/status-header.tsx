"use client"

import { useSimulation } from "@/lib/simulation-store"

const phaseLabels: Record<string, { text: string; color: string }> = {
  idle: { text: "AWAITING COMMAND", color: "text-muted-foreground" },
  generating: { text: "GENERATING DISASTER ZONE", color: "text-primary" },
  ready: { text: "FLOOD ZONE READY — AWAITING AI DEPLOYMENT", color: "text-warning" },
  deploying: { text: "INITIALIZING AUTONOMOUS AGENT", color: "text-primary" },
  running: { text: "AI AGENT ACTIVE — NAVIGATING TO SURVIVOR", color: "text-[#00ff88]" },
  complete: { text: "MISSION COMPLETE — TARGET REACHED", color: "text-[#00ff88]" },
}

export function StatusHeader() {
  const { phase, computeMode, drone } = useSimulation()
  const { text, color } = phaseLabels[phase] ?? phaseLabels.idle

  return (
    <header className="glass-panel rounded-lg px-5 py-3 flex items-center justify-between">
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
            className={`h-2 w-2 rounded-full ${
              phase === "running" ? "bg-[#00ff88] animate-pulse-glow" : "bg-muted-foreground"
            }`}
          />
          <span className="text-[10px] font-mono text-muted-foreground">{computeMode}</span>
        </div>
      </div>
    </header>
  )
}
