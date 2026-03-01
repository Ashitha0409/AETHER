"use client"

import { useSimulation } from "@/lib/simulation-store"

const modules = [
  { id: "env", label: "ENV GEN", desc: "Procedural Disaster", phases: ["generating", "ready", "running", "complete"] },
  { id: "rl", label: "PPO RL", desc: "Policy Network", phases: ["running", "complete"] },
  { id: "onnx", label: "ONNX", desc: "Model Export", phases: ["running", "complete"] },
  { id: "npu", label: "EDGE AI", desc: "Ryzen AI NPU", phases: ["running", "complete"] },
]

export function ArchitecturePanel() {
  const { phase } = useSimulation()

  return (
    <div className="glass-panel rounded-lg p-4">
      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-3 block">
        System Pipeline
      </span>
      <div className="flex flex-col gap-2">
        {modules.map((mod, i) => {
          const isActive = mod.phases.includes(phase)
          return (
            <div key={mod.id} className="flex items-center gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  isActive ? "bg-primary animate-pulse-glow" : "bg-secondary"
                }`}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={`text-[10px] font-mono font-bold tracking-wider transition-colors duration-500 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {mod.label}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground truncate">{mod.desc}</span>
              </div>
              {i < modules.length - 1 && (
                <div
                  className={`h-3 w-px transition-colors duration-500 ${
                    isActive ? "bg-primary/40" : "bg-border/30"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
