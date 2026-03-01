"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { CityGrid, Ground, StreetGrid, ObstacleField, WaterPlane, TargetMarker } from "./city-scene"
import { Drone } from "./drone"
import { useSimulation } from "@/lib/simulation-store"

function Scene() {
  const { obstacles, waterLevel, floodGenerated, targetPosition, fogIntensity, disasterType } = useSimulation()

  const fogColor = disasterType === "fire" ? "#1a0805" : "#080c14"
  const ambientColor = disasterType === "fire" ? "#ff6633" : "#5588ff"
  const fogDensity = disasterType === "fire" ? 1.2 : 1.0

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={disasterType === "fire" ? 0.3 : 0.4} color={ambientColor} />
      <directionalLight
        position={[40, 60, 30]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 30, 0]} intensity={0.5} color="#00e5ff" />

      {/* Atmosphere */}
      <fog attach="fog" args={[fogColor, 20, 100 - fogIntensity * 80 * (1 / fogDensity)]} />
      <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />

      {/* City */}
      <Ground />
      <StreetGrid />
      <CityGrid />

      {/* Disaster elements */}
      <ObstacleField obstacles={obstacles} />
      <WaterPlane level={waterLevel} />

      {/* Target */}
      {floodGenerated && <TargetMarker position={targetPosition} />}

      {/* Drone */}
      <Drone />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={8}
        maxDistance={60}
        target={[0, 2, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

export function SimulationCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#080c14"]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
