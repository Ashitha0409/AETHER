"use client"

const modules = [
  {
    id: "A",
    title: "Procedural Disaster Generator",
    description: "Generates infinite disaster layouts using grid-based coordinate sampling with density parameters and path-validity checking via NavMesh.",
    features: [
      "Broken cars, flood water, concrete debris, collapsed poles",
      "Configurable obstacle density and distribution",
      "Wind force, fog intensity, water turbulence parameters",
      "Path validity ensures solvable environments",
    ],
    innovation: "This is the Generative AI component -- procedural generation creates unlimited unique training scenarios.",
  },
  {
    id: "B",
    title: "Drone Physics Engine",
    description: "Anti-gravity drone with rigidbody physics, thrust control, and multi-directional sensor arrays for environment perception.",
    features: [
      "Rigidbody with anti-gravity hover mechanics",
      "6-8 directional raycasts for obstacle detection",
      "Altitude, velocity, and goal direction sensors",
      "10-15 numeric observation vector for RL input",
    ],
    innovation: "Anti-gravity approach eliminates aerodynamic complexity while maintaining stable, RL-trainable flight behavior.",
  },
  {
    id: "C",
    title: "RL Training Engine (PPO)",
    description: "Proximal Policy Optimization with curriculum learning that progressively increases environment difficulty.",
    features: [
      "Forward movement reward + survivor reach bonus",
      "Collision penalty, time penalty, instability penalty",
      "Curriculum: empty environment to dense obstacles",
      "Train on RTX 4060, export to ONNX",
    ],
    innovation: "Curriculum learning ensures stable training progression from simple to complex disaster scenarios.",
  },
  {
    id: "D",
    title: "Adaptive Evolution Engine",
    description: "Post-episode difficulty adjustment that makes the environment evolve based on agent performance.",
    features: [
      "Success rate > 80%: increase difficulty",
      "Success rate < 30%: decrease difficulty",
      "Dynamic obstacle density scaling",
      "Progressive environmental complexity",
    ],
    innovation: "Core innovation -- the training environment co-evolves with the agent, creating an endless difficulty frontier.",
  },
  {
    id: "E",
    title: "Edge Inference Optimization",
    description: "ONNX model deployment with heterogeneous compute switching between CPU, GPU, and AMD Ryzen AI NPU.",
    features: [
      "ONNX Runtime with AMD NPU execution provider",
      "Real-time inference latency benchmarking",
      "CPU usage and power draw telemetry",
      "Live compute switching during demo",
    ],
    innovation: "Demonstrates practical edge AI deployment where NPU inference frees GPU for rendering while reducing power.",
  },
]

export function ModulesSection() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Core Modules
          </span>
          <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground text-center text-balance">
            System Modules
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground text-center text-pretty leading-relaxed">
            Five interconnected modules form the complete Aether-SIM pipeline,
            from world generation to edge deployment.
          </p>
        </div>

        {/* Module cards */}
        <div className="flex flex-col gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="glass-panel rounded-lg p-6 md:p-8 transition-all hover:border-primary/30"
              style={{ borderColor: "oklch(0.75 0.15 195 / 0.1)" }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 border border-primary/20">
                  <span className="text-xs font-mono font-bold text-primary">{mod.id}</span>
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-foreground">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 ml-12">
                {mod.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1 w-1 rounded-full bg-primary/50 shrink-0" />
                    <span className="text-[11px] font-mono text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <div className="ml-12 rounded-md bg-primary/5 border border-primary/10 px-4 py-2.5">
                <span className="text-[10px] font-mono text-primary">
                  {mod.innovation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
