"use client"

const categories = [
  {
    title: "Simulation",
    items: ["Unity 2023 LTS", "HDRP", "NavMesh", "C# Scripts"],
  },
  {
    title: "Machine Learning",
    items: ["Python 3.10", "PyTorch", "Stable Baselines3 (PPO)", "ONNX Exporter"],
  },
  {
    title: "Edge Deployment",
    items: ["ONNX Runtime C#", "Ryzen AI SDK", "AMD NPU EP", "Heterogeneous Compute"],
  },
  {
    title: "Hardware",
    items: [
      "HP Omen - Ryzen 7 7840HS",
      "RTX 4060 (Training)",
      "XDNA NPU (Inference)",
      "ASUS TUF - i7 + RTX 3050",
    ],
  },
]

const amdPoints = [
  { label: "Ryzen AI NPU", desc: "Real-time inference on XDNA architecture" },
  { label: "Ryzen AI SDK", desc: "Benchmarking and deployment toolkit" },
  { label: "ONNX Runtime AMD EP", desc: "Execution provider for NPU acceleration" },
  { label: "Ryzen CPU", desc: "Physics simulation processing" },
  { label: "Radeon 780M iGPU", desc: "Optional inference comparison baseline" },
]

export function TechSection() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Technology
          </span>
          <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground text-center text-balance">
            Full Tech Stack
          </h2>
        </div>

        {/* Tech grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {categories.map((cat) => (
            <div key={cat.title} className="glass-panel rounded-lg p-5">
              <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-wider mb-4">{cat.title}</h3>
              <div className="flex flex-col gap-2">
                {cat.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="h-1 w-4 rounded-full bg-primary/30" />
                    <span className="text-sm font-mono text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AMD Integration callout */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
            <h3 className="text-lg font-mono font-bold text-foreground">AMD Integration Points</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amdPoints.map((point) => (
              <div key={point.label} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="text-sm font-mono font-bold text-foreground">{point.label}</span>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
