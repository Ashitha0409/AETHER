"use client"

import { ArrowDown } from "lucide-react"

const pipeline = [
  {
    id: "sim",
    label: "Unity Simulation",
    desc: "Procedural Disaster World",
    details: ["Drone Physics", "Sensor Raycasts", "Survivor Target", "HDRP Rendering"],
    color: "text-primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/5",
  },
  {
    id: "rl",
    label: "Python PPO Trainer",
    desc: "RTX 4060 GPU Training",
    details: ["Policy Network", "Reward Computation", "Curriculum Learning", "Stable Baselines3"],
    color: "text-[#00ff88]",
    borderColor: "border-[#00ff88]/30",
    bgColor: "bg-[#00ff88]/5",
  },
  {
    id: "onnx",
    label: "ONNX Export",
    desc: "Model Conversion Pipeline",
    details: ["PyTorch to ONNX", "Inference Validation", "Quantization Ready", "Cross-Platform"],
    color: "text-warning",
    borderColor: "border-warning/30",
    bgColor: "bg-warning/5",
  },
  {
    id: "edge",
    label: "Edge AI Runtime",
    desc: "Ryzen AI NPU Deployment",
    details: ["ONNX Runtime C#", "AMD NPU EP", "Telemetry Metrics", "Real-Time Inference"],
    color: "text-primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/5",
  },
]

export function ArchitectureSection() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            System Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground text-center text-balance">
            End-to-End Pipeline
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground text-center text-pretty leading-relaxed">
            From procedural world generation to NPU-accelerated inference,
            every stage is designed for real-time edge deployment.
          </p>
        </div>

        {/* Pipeline */}
        <div className="flex flex-col items-center gap-0">
          {pipeline.map((stage, i) => (
            <div key={stage.id} className="flex flex-col items-center w-full max-w-lg">
              <div
                className={`w-full rounded-lg border ${stage.borderColor} ${stage.bgColor} p-5 transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-2 w-2 rounded-full ${stage.color.replace("text-", "bg-")} animate-pulse-glow`} />
                  <div>
                    <h3 className={`text-sm font-mono font-bold ${stage.color} tracking-wider`}>{stage.label}</h3>
                    <p className="text-[10px] font-mono text-muted-foreground">{stage.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {stage.details.map((d) => (
                    <div key={d} className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                      <span className="text-[10px] font-mono text-muted-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector arrow */}
              {i < pipeline.length - 1 && (
                <div className="flex flex-col items-center py-2">
                  <div className="h-6 w-px bg-border/50" />
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                  <div className="h-2 w-px bg-border/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
