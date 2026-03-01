"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, Stars } from "@react-three/drei"
import { useSimulation } from "@/lib/simulation-store"
import { CityScene, Ground } from "./city-scene"
import { useRef } from "react"
import * as THREE from "three"
import { Camera, Maximize2 } from "lucide-react"

function DronePerspective() {
    const { drone, targetPosition } = useSimulation()
    const camRef = useRef<THREE.PerspectiveCamera>(null)

    useFrame(() => {
        if (camRef.current) {
            // Position camera slightly in front of the drone
            const pos = new THREE.Vector3(...drone.position)
            const rot = (drone.heading * Math.PI) / 180

            const offset = new THREE.Vector3(0, 0, 0.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot)
            camRef.current.position.copy(pos.add(offset))
            camRef.current.rotation.y = rot + Math.PI // Face forward
        }
    })

    return (
        <PerspectiveCamera
            makeDefault
            ref={camRef}
            fov={75}
            near={0.1}
            far={100}
        />
    )
}

export function PovWindow() {
    const { aiDeployed, phase, survivorFound } = useSimulation()

    return (
        <div
            className="w-full border border-white/10 rounded-xl bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden group relative"
            style={{ aspectRatio: '16 / 9', minHeight: '140px' }}
        >
            {/* Header */}
            <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-3 bg-black/60 z-10">
                <div className="flex items-center gap-2">
                    <Camera size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                        Drone POV <span className="text-cyan-400/60 ml-1">01</span>
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-medium text-white/50 uppercase">REC</span>
                </div>
            </div>

            {/* Render Canvas */}
            <div className="w-full h-full relative">
                <Canvas shadows gl={{ antialias: false }}>
                    <ambientLight intensity={0.5} color="#5588ff" />
                    <directionalLight position={[10, 20, 10]} intensity={1} />
                    <fog attach="fog" args={["#080c14", 10, 50]} />

                    <DronePerspective />
                    <CityScene />
                    <Ground />
                </Canvas>

                {/* HUD Elements */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    {/* Top Info */}
                    <div className="flex justify-between mt-6">
                        <div className="flex flex-col gap-0.5">
                            <div className="w-4 h-4 border-t border-l border-cyan-400" />
                            <span className="text-[8px] text-cyan-400 font-mono tracking-tighter ml-1">ISO 800</span>
                        </div>
                        <div className="w-4 h-4 border-t border-r border-cyan-400" />
                    </div>

                    {/* Center Crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 border border-white/20 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="w-px h-10 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
                            <div className="w-10 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent absolute top-1/2" />
                        </div>
                    </div>

                    {/* Bottom Alerts */}
                    <div className="flex justify-between items-end">
                        <div className="w-4 h-4 border-b border-l border-cyan-400" />
                        <div className="flex flex-col items-end gap-1 mb-1">
                            {aiDeployed && (
                                <div className="px-1.5 py-0.5 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 text-[8px] font-bold uppercase tracking-widest animate-pulse">
                                    AI ACTIVE
                                </div>
                            )}
                            {survivorFound && (
                                <div className="px-1.5 py-0.5 bg-green-500/20 border border-green-400/50 text-green-400 text-[8px] font-bold uppercase tracking-widest">
                                    TARGET FOUND
                                </div>
                            )}
                        </div>
                        <div className="w-4 h-4 border-b border-r border-cyan-400" />
                    </div>
                </div>
            </div>

            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        </div>
    )
}
