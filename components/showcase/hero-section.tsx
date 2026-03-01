"use client"

import { ArrowDown, Cpu, Zap, Shield, Brain } from "lucide-react"

export function HeroSection({ onScrollToSim }: { onScrollToSim: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.75 0.15 195 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0.15 195 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, oklch(0.75 0.15 195) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-4xl text-center flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            AMD Pervasive AI Developer Contest 2025
          </span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl md:text-7xl font-mono font-bold text-foreground tracking-tight text-balance">
            AETHER-SIM
          </h1>
          <p className="text-lg md:text-xl font-mono text-primary tracking-wider">
            Adaptive Synthetic Disaster Training Engine
          </p>
        </div>

        {/* Description */}
        <p className="max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground text-pretty">
          A procedural disaster environment generator with reinforcement learning drone navigation
          and edge-optimized inference on AMD Ryzen AI. Infinite training scenarios.
          Real-time autonomous rescue. NPU-accelerated deployment.
        </p>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {[
            { icon: Brain, label: "PPO Agent", value: "RL-Trained" },
            { icon: Zap, label: "NPU Latency", value: "< 4ms" },
            { icon: Shield, label: "Scenarios", value: "Infinite" },
            { icon: Cpu, label: "Edge Deploy", value: "Ryzen AI" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-lg p-4 flex flex-col items-center gap-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-lg font-mono font-bold text-foreground">{stat.value}</span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onScrollToSim}
          className="group flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-6 py-3 font-mono text-sm text-primary transition-all hover:bg-primary/20 hover:border-primary/50"
        >
          <span>LAUNCH SIMULATION</span>
          <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[9px] font-mono text-muted-foreground tracking-widest">SCROLL</span>
        <div className="h-8 w-px bg-gradient-to-b from-primary/40 to-transparent" />
      </div>
    </section>
  )
}
