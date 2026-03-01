"use client"

import Image from "next/image"
import { Play } from "lucide-react"

export function DemoSection() {
    return (
        <section className="relative py-24 px-6 bg-secondary/20">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">
                            SPRINTING TO REALITY
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-mono font-bold text-foreground">
                        AETHER Unity Engine Demo
                    </h2>
                    <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
                        Witness the exact GenerateFlood → DeployAI flow in-engine.
                        Real urban prefabs, dynamic debris spawning, and a PPO-trained agent
                        executing in real-time via ONNX Runtime with Ryzen AI.
                    </p>
                </div>

                {/* Demo Visual */}
                <div className="relative w-full aspect-video rounded-xl border border-primary/20 bg-background overflow-hidden group shadow-[0_0_50px_rgba(0,229,255,0.1)]">
                    <img
                        src="/unity_ppo_demo.png"
                        alt="Unity PPO Training Demo"
                        className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay UI elements to make it look like a demo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />

                    {/* Center Play Button (Mockup) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:bg-primary/30 group-hover:border-primary/60">
                            <Play className="h-6 w-6 text-primary fill-primary" />
                        </div>
                    </div>

                    {/* Bottom labeling */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">PPO_TRAINING_ACTIVE</span>
                            <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-70">Latency: 3.2ms (Ryzen AI NPU)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#00ff88] animate-pulse" />
                            <span className="text-[10px] font-mono text-[#00ff88] font-bold tracking-widest uppercase">RECORDING TRAJECTORY</span>
                        </div>
                    </div>

                    {/* Top labeling */}
                    <div className="absolute top-6 right-6">
                        <div className="glass-panel text-[9px] font-mono text-primary/80 px-2 py-1 rounded border-primary/20 border">
                            EPISODE 41,291 — SUCCESS RATE: 94.2%
                        </div>
                    </div>
                </div>

                {/* Sprint points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
                    {[
                        { title: "Real Urban Assets", desc: "Unity scene with high-fidelity urban prefabs and dynamic debris." },
                        { title: "PPO Policy Export", desc: "Trained Python model exported to ONNX for Unity inference." },
                        { title: "AMD NPU Backend", desc: "Optimized C# runner utilizing Ryzen AI Silicon (NPU EP)." }
                    ].map((item, i) => (
                        <div key={i} className="glass-panel p-5 rounded-lg border-border/30">
                            <div className="text-primary font-mono text-xs font-bold mb-2 uppercase tracking-widest">Sprint {i + 1}</div>
                            <h4 className="text-foreground font-mono text-sm font-bold mb-2">{item.title}</h4>
                            <p className="text-muted-foreground text-[11px] font-mono leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
