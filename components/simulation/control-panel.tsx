"use client"

import { useSimulation } from "@/lib/simulation-store"
import { Waves, Bot, Cpu, RotateCcw } from "lucide-react"

export function ControlPanel() {
  const { phase, floodGenerated, aiDeployed, computeMode, generateFlood, deployAI, switchCompute, resetSimulation } =
    useSimulation()

  const isGenerating = phase === "generating"
  const isRunning = phase === "running"
  const isComplete = phase === "complete"

  return (
    <div className="glass-panel rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Command</span>
      </div>

      {/* Generate Flood */}
      <button
        onClick={generateFlood}
        disabled={isGenerating || isRunning}
        className="group relative flex items-center gap-3 rounded-md border border-border/50 bg-secondary/50 px-4 py-3 text-sm font-mono text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Waves className="h-4 w-4 text-primary" />
        <span>{isGenerating ? "GENERATING..." : floodGenerated ? "REGENERATE FLOOD" : "GENERATE FLOOD"}</span>
        {isGenerating && (
          <div className="absolute right-3 h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
      </button>

      {/* Deploy AI */}
      <button
        onClick={deployAI}
        disabled={!floodGenerated || aiDeployed || isGenerating}
        className="group relative flex items-center gap-3 rounded-md border border-border/50 bg-secondary/50 px-4 py-3 text-sm font-mono text-foreground transition-all hover:border-[#00ff88]/50 hover:bg-[#00ff88]/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Bot className="h-4 w-4 text-[#00ff88]" />
        <span>{isRunning ? "AI DEPLOYED" : isComplete ? "MISSION COMPLETE" : "DEPLOY AI"}</span>
        {isRunning && (
          <div className="absolute right-3 flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[10px] text-[#00ff88]">LIVE</span>
          </div>
        )}
      </button>

      {/* Switch Compute */}
      <button
        onClick={switchCompute}
        className="group flex items-center gap-3 rounded-md border border-border/50 bg-secondary/50 px-4 py-3 text-sm font-mono text-foreground transition-all hover:border-warning/50 hover:bg-warning/10"
      >
        <Cpu className="h-4 w-4 text-warning" />
        <span>SWITCH COMPUTE</span>
        <span className="ml-auto rounded bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
          {computeMode}
        </span>
      </button>

      {/* Reset */}
      <button
        onClick={resetSimulation}
        className="flex items-center gap-3 rounded-md border border-border/30 bg-transparent px-4 py-2 text-xs font-mono text-muted-foreground transition-all hover:border-destructive/50 hover:text-destructive"
      >
        <RotateCcw className="h-3 w-3" />
        <span>RESET SIMULATION</span>
      </button>
    </div>
  )
}
