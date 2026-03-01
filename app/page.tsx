"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { StatusHeader } from "@/components/simulation/status-header"
import { ControlPanel } from "@/components/simulation/control-panel"
import { TelemetryPanel } from "@/components/simulation/telemetry-panel"
import { ArchitecturePanel } from "@/components/simulation/architecture-panel"
import { HeroSection } from "@/components/showcase/hero-section"
import { ArchitectureSection } from "@/components/showcase/architecture-section"
import { TechSection } from "@/components/showcase/tech-section"
import { ModulesSection } from "@/components/showcase/modules-section"
import { FooterSection } from "@/components/showcase/footer-section"

const SimulationCanvas = dynamic(
  () => import("@/components/simulation/simulation-canvas").then((mod) => mod.SimulationCanvas),
  { ssr: false }
)

export default function AetherSimPage() {
  const simRef = useRef<HTMLDivElement>(null)

  const scrollToSim = () => {
    simRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="bg-background text-foreground">
      {/* Section 1: Project Showcase / Hero */}
      <HeroSection onScrollToSim={scrollToSim} />

      {/* Section 2: Interactive 3D Simulation */}
      <div ref={simRef}>
        <section className="relative h-screen w-full overflow-hidden">
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
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-3 gap-3 md:p-4 md:gap-4">
            {/* Top bar */}
            <div className="pointer-events-auto pt-4">
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
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 229, 255, 0.1) 2px, transparent 4px)",
              }}
            />
          </div>
        </section>
      </div>

      {/* Section 3: Architecture */}
      <ArchitectureSection />

      {/* Divider */}
      <div className="flex justify-center">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Section 4: Modules */}
      <ModulesSection />

      {/* Divider */}
      <div className="flex justify-center">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Section 5: Tech Stack */}
      <TechSection />

      {/* Section 6: Footer */}
      <FooterSection />
    </div>
  )
}
