"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { CityGrid, Ground, StreetGrid, ObstacleField, WaterPlane, TargetMarker } from "./city-scene"
import { Drone } from "./drone"
import { useSimulation } from "@/lib/simulation-store"

function Scene() {
  const { obstacles, waterLevel, floodGenerated, targetPosition, fogIntensity } = useSimulation()

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#4466aa" />
      <directionalLight
        position={[30, 40, 20]}
        intensity={0.4}
        color="#88aaff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[0, 20, 0]} intensity={0.2} color="#00e5ff" />

      {/* Atmosphere */}
      <fog attach="fog" args={["#080c14", 20, 80 - fogIntensity * 80]} />
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
