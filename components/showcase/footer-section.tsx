"use client"

export function FooterSection() {
  return (
    <footer className="relative py-16 px-6 border-t border-border/30">
      <div className="max-w-5xl mx-auto">
        {/* Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel rounded-lg p-5">
            <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-wider mb-2">Short-Term Impact</h3>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              Demonstrates safe AI training without real-world risk. Shows practical edge-efficient AI deployment on consumer hardware.
            </p>
          </div>
          <div className="glass-panel rounded-lg p-5">
            <h3 className="text-xs font-mono font-bold text-warning uppercase tracking-wider mb-2">Long-Term Vision</h3>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              Training SaaS for drone manufacturers. Disaster preparedness research tool. Smart city infrastructure AI testbed.
            </p>
          </div>
          <div className="glass-panel rounded-lg p-5">
            <h3 className="text-xs font-mono font-bold text-[#00ff88] uppercase tracking-wider mb-2">Theme Alignment</h3>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              AI for Smart Cities. Generative AI for Everyone. Sustainable AI through efficient edge inference on AMD Ryzen AI.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border/20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-foreground tracking-wider">AETHER-SIM</span>
            <span className="text-[10px] font-mono text-muted-foreground">v0.1.0</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span>AMD Ryzen AI</span>
            <span className="text-border">|</span>
            <span>ONNX Runtime</span>
            <span className="text-border">|</span>
            <span>PPO Agent</span>
            <span className="text-border">|</span>
            <span>Unity 2023 LTS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
