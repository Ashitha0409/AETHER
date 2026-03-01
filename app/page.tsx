"use client"

import dynamic from "next/dynamic"
import { StatusHeader } from "@/components/simulation/status-header"
import { ControlPanel } from "@/components/simulation/control-panel"
import { TelemetryPanel } from "@/components/simulation/telemetry-panel"
import { ArchitecturePanel } from "@/components/simulation/architecture-panel"

const SimulationCanvas = dynamic(
  () => import("@/components/simulation/simulation-canvas").then((mod) => mod.SimulationCanvas),
  { ssr: false }
)

export default function AetherSimPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      {/* 3D Scene */}
      <SimulationCanvas />

      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-3 gap-3 md:p-4 md:gap-4">
        {/* Top bar */}
        <div className="pointer-events-auto">
          <StatusHeader />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 gap-3 md:gap-4 min-h-0">
          {/* Left panel */}
          <div className="pointer-events-auto flex flex-col gap-3 md:gap-4 w-56 md:w-64 shrink-0">
            <ControlPanel />
            <ArchitecturePanel />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right panel */}
          <div className="pointer-events-auto w-56 md:w-64 shrink-0">
            <TelemetryPanel />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pointer-events-auto glass-panel rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-muted-foreground tracking-widest">
              AETHER-SIM v0.1.0
            </span>
            <div className="hidden sm:block h-3 w-px bg-border/30" />
            <span className="hidden sm:block text-[9px] font-mono text-muted-foreground">
              AMD RYZEN AI | ONNX RUNTIME | PPO AGENT
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted-foreground">ORBIT: CLICK + DRAG</span>
            <div className="h-3 w-px bg-border/30" />
            <span className="text-[9px] font-mono text-muted-foreground">ZOOM: SCROLL</span>
          </div>
        </div>
      </div>

      {/* Scanline overlay effect */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 229, 255, 0.1) 2px, transparent 4px)",
          }}
        />
      </div>
    </main>
  )
}
