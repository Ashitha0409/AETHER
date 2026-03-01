"use client"

import dynamic from "next/dynamic"
import { StatusHeader } from "@/components/simulation/status-header"
import { ControlPanel } from "@/components/simulation/control-panel"
import { TelemetryPanel } from "@/components/simulation/telemetry-panel"
import { ArchitecturePanel } from "@/components/simulation/architecture-panel"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const SimulationCanvas = dynamic(
  () => import("@/components/simulation/simulation-canvas").then((mod) => mod.SimulationCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-muted-foreground tracking-widest">
            INITIALIZING 3D ENGINE
          </span>
        </div>
      </div>
    ),
  }
)

const PovWindow = dynamic(
  () => import("@/components/simulation/pov-window").then((mod) => mod.PovWindow),
  { ssr: false }
)

export default function SimulationPage() {
  return (
    <div className="bg-background text-foreground h-screen w-full overflow-hidden flex flex-col">
      <section className="relative flex-1 w-full overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-40">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 font-mono text-[10px] text-muted-foreground transition-all hover:bg-background hover:text-primary backdrop-blur-sm"
          >
            <ArrowLeft className="h-3 w-3" />
            BACK TO DASHBOARD
          </Link>
        </div>

        {/* Section label */}
        <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-2">
          <div className="rounded-b-lg bg-primary/10 border border-t-0 border-primary/20 px-4 py-1">
            <span className="text-[9px] font-mono text-primary uppercase tracking-[0.2em]">
              Interactive Simulation
            </span>
          </div>
        </div>

        {/* 3D Scene */}
        <SimulationCanvas />

        {/* UI Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-3 gap-4 md:p-6 md:gap-6">
          {/* Top bar header */}
          <div className="pointer-events-auto shrink-0 mt-8">
            <StatusHeader />
          </div>

          {/* Main content area */}
          <div className="flex flex-1 gap-4 md:gap-6 min-h-0 min-w-0">
            {/* Left panel */}
            <div className="pointer-events-auto flex flex-col gap-3 md:gap-4 w-56 md:w-64 shrink-0 overflow-y-auto no-scrollbar pb-4">
              <ControlPanel />
              <ArchitecturePanel />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right panel */}
            <div className="pointer-events-auto w-56 md:w-64 shrink-0 overflow-y-auto no-scrollbar pb-4 flex flex-col gap-3 md:gap-4">
              <PovWindow />
              <TelemetryPanel />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pointer-events-auto glass-panel rounded-lg px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-mono text-muted-foreground tracking-widest">
                AETHER-SIM v0.2.0
              </span>
              <div className="hidden sm:block h-3 w-px bg-border/30" />
              <span className="hidden sm:block text-[9px] font-mono text-muted-foreground">
                AMD RYZEN AI | ONNX RUNTIME | PPO AGENT
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-muted-foreground uppercase">Orbit: Click + Drag</span>
              <div className="h-3 w-px bg-border/30" />
              <span className="text-[9px] font-mono text-muted-foreground uppercase">Zoom: Scroll</span>
            </div>
          </div>
        </div>

        {/* Scanline overlay effect */}
        <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.03]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 229, 255, 0.1) 2px, transparent 4px)",
            }}
          />
        </div>
      </section>
    </div>
  )
}
