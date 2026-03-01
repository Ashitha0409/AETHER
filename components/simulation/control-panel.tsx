"use client"

import { useSimulation, type DisasterType } from "@/lib/simulation-store"
import { Waves, Bot, Cpu, RotateCcw, Flame, ShieldAlert, Zap } from "lucide-react"
import { useState } from "react"

export function ControlPanel() {
  const {
    phase,
    floodGenerated,
    aiDeployed,
    computeMode,
    disasterType,
    riskLevel,
    generateDisaster,
    deployAI,
    switchCompute,
    resetSimulation,
    setRiskLevel
  } = useSimulation()

  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>("flood")

  const isGenerating = phase === "generating"
  const isRunning = phase === "running"
  const isComplete = phase === "complete"

  return (
    <div className="glass-panel rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Command</span>
      </div>

      {/* Disaster Selection */}
      <div className="flex flex-col gap-2 p-1 bg-secondary/30 rounded-md border border-border/30">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pl-1">Disaster Type</label>
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedDisaster("flood")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-mono transition-all ${selectedDisaster === "flood" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary/50"}`}
          >
            <Waves className="h-3 w-3" /> FLOOD
          </button>
          <button
            onClick={() => setSelectedDisaster("fire")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-mono transition-all ${selectedDisaster === "fire" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-muted-foreground hover:bg-secondary/50"}`}
          >
            <Flame className="h-3 w-3" /> FIRE
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => generateDisaster(selectedDisaster)}
        disabled={isGenerating || isRunning}
        className="group relative flex items-center gap-3 rounded-md border border-border/50 bg-secondary/80 px-4 py-3 text-sm font-mono text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className={`h-4 w-4 ${selectedDisaster === "flood" ? "text-primary" : "text-orange-400"}`}>
          {selectedDisaster === "flood" ? <Waves className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
        </div>
        <span>{isGenerating ? "GENERATING..." : floodGenerated ? `REGENERATE ${selectedDisaster.toUpperCase()}` : `GENERATE ${selectedDisaster.toUpperCase()}`}</span>
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

      {/* AI Risk Slider */}
      <div className="flex flex-col gap-3 p-3 bg-secondary/20 rounded-md border border-border/30 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">AI Risk Exposure</span>
          </div>
          <span className={`text-[10px] font-mono font-bold ${riskLevel > 0.7 ? "text-orange-400" : riskLevel < 0.3 ? "text-[#00ff88]" : "text-primary"}`}>
            {(riskLevel * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={riskLevel}
          onChange={(e) => setRiskLevel(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div className="flex justify-between text-[8px] font-mono text-muted-foreground uppercase">
          <span className="flex items-center gap-1"><ShieldAlert className="h-2 w-2" /> Safe Mode</span>
          <span className="flex items-center gap-1">Rush Mode <Zap className="h-2 w-2" /></span>
        </div>
      </div>

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
