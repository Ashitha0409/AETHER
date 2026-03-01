"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { PerspectiveCamera, Float, Trail } from "@react-three/drei"
import { useSimulation } from "@/lib/simulation-store"

// Sensor ray visualizer
function SensorRays({ position, sensors }: { position: [number, number, number]; sensors: number[] }) {
  const directions = useMemo(
    () => [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0.7, 0, 0.7).normalize(),
      new THREE.Vector3(-0.7, 0, 0.7).normalize(),
      new THREE.Vector3(0.7, 0, -0.7).normalize(),
      new THREE.Vector3(-0.7, 0, 0.7).normalize(),
      new THREE.Vector3(0, -1, 0), // Downward
      new THREE.Vector3(0, 1, 0),  // Upward
    ],
    []
  )

  return (
    <group position={position}>
      {directions.map((dir, i) => {
        const dist = sensors[i] ?? 10
        const isNear = dist < 3
        const isCritical = dist < 1.5

        return (
          <group key={i}>
            <line>
              <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints([new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(dist)])} />
              <lineBasicMaterial
                attach="material"
                color={isCritical ? "#ff0000" : isNear ? "#ffaa00" : "#00e5ff"}
                opacity={isNear ? 0.6 : 0.15}
                transparent
              />
            </line>
            {isNear && (
              <mesh position={dir.clone().multiplyScalar(dist)}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color={isCritical ? "#ff0000" : "#ffaa00"} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

// Trail renderer for drone path
function DroneTrail({ points }: { points: [number, number, number][] }) {
  if (points.length < 2) return null
  const vecs = points.map((p) => new THREE.Vector3(...p))

  return (
    <Trail
      width={1}
      length={10}
      color="#00e5ff"
      attenuation={(t) => t * t}
    >
      {/* We use a simple parent mesh for the trail */}
      <mesh position={points[points.length - 1]} />
    </Trail>
  )
}

export function Drone() {
  const groupRef = useRef<THREE.Group>(null)
  const propRefs = useRef<(THREE.Mesh | null)[]>([])
  const glowRef = useRef<THREE.PointLight>(null)
  const povCameraRef = useRef<THREE.PerspectiveCamera>(null)
  const { scene } = useThree()

  const {
    drone,
    aiDeployed,
    targetPosition,
    obstacles,
    phase,
    updateDrone,
    updateTelemetry,
    telemetry,
    setPhase,
    waterLevel,
    riskLevel,
    manualMode,
    survivorFound
  } = useSimulation()

  const startTime = useRef(0)
  const reward = useRef(0)
  const velocity = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return

    // Spin propellers
    const propSpeed = phase === "running" ? 45 : 15
    propRefs.current.forEach((p) => {
      if (p) p.rotation.y += propSpeed * delta
    })

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 4) * 0.4
    }

    if (phase === "running" && aiDeployed && !survivorFound) {
      if (startTime.current === 0) startTime.current = clock.elapsedTime

      const currentPos = new THREE.Vector3(...drone.position)
      const targetPos = new THREE.Vector3(...targetPosition)
      const vel = velocity.current

      // 1. Goal Seeking Force
      const distToTarget = currentPos.distanceTo(targetPos)
      const goalDirection = targetPos.clone().sub(currentPos).normalize()
      const goalForce = goalDirection.clone().multiplyScalar(5)

      // 2. Obstacle Avoidance (3D)
      const avoidanceForce = new THREE.Vector3(0, 0, 0)
      const sensorDistances = new Array(10).fill(15)

      // Horizontal & Vertical Proximity Check
      obstacles.forEach((obs) => {
        const obsPos = new THREE.Vector3(...obs.position)
        const diff = currentPos.clone().sub(obsPos)
        const dist = diff.length()
        if (dist < 6) {
          const repulse = diff.normalize().multiplyScalar(4 / (dist + 0.5))
          avoidanceForce.add(repulse)
        }
      })

      // Vertical Sensors (Raycasting for better precision)
      const verticalDirs = [
        new THREE.Vector3(0, 1, 0), // Up
        new THREE.Vector3(0, -1, 0) // Down
      ]
      verticalDirs.forEach((dir, idx) => {
        const ray = new THREE.Raycaster(currentPos, dir, 0, 5)
        const hits = ray.intersectObjects(scene.children, true)
        if (hits.length > 0) {
          const hitDist = hits[0].distance
          sensorDistances[8 + idx] = hitDist
          const forceMag = (2 / (hitDist + 0.2)) * (1 - riskLevel * 0.5)
          avoidanceForce.y += idx === 0 ? -forceMag : forceMag
        }
      })

      // Reweight based on risk
      const speedWeight = THREE.MathUtils.lerp(3.0, 5.5, riskLevel)
      const avoidanceWeight = THREE.MathUtils.lerp(2.0, 0.8, riskLevel)

      const totalForce = goalForce.clone().multiplyScalar(speedWeight * 0.2)
        .add(avoidanceForce.multiplyScalar(avoidanceWeight))

      // Physics Integration
      const friction = 0.94
      velocity.current.add(totalForce.multiplyScalar(delta)).multiplyScalar(friction)

      const movement = velocity.current.clone().multiplyScalar(delta * 10)
      const nextPosVec = currentPos.clone().add(movement)

      // Clamping
      if (nextPosVec.y < 1.5) nextPosVec.y = 1.5
      if (nextPosVec.y > 15) nextPosVec.y = 15

      const nextPos: [number, number, number] = [nextPosVec.x, nextPosVec.y, nextPosVec.z]

      // Path history
      const newHistory = [...drone.pathHistory]
      if (newHistory.length === 0 || nextPosVec.distanceTo(new THREE.Vector3(...newHistory[newHistory.length - 1])) > 0.4) {
        newHistory.push(nextPos)
        if (newHistory.length > 200) newHistory.shift()
      }

      // Update State
      updateDrone({
        position: nextPos,
        speed: velocity.current.length() * 5,
        altitude: nextPos[1] - waterLevel,
        heading: Math.atan2(movement.x, movement.z) * (180 / Math.PI),
        sensors: sensorDistances,
        pathHistory: newHistory,
      })

      updateTelemetry({
        distanceToTarget: distToTarget,
        episodeTime: clock.elapsedTime - startTime.current,
        rewardScore: (reward.current += (distToTarget < 2 ? 1 : 0)), // Simple accumulation
      })

      // Mission Complete
      if (distToTarget < 1.8) {
        updateDrone({ targetReached: true })
        setPhase("complete")
      }
    }

    // Update group position & rotation
    groupRef.current.position.set(...drone.position)
    if (phase === "running" && velocity.current.length() > 0.1) {
      const targetRotation = (drone.heading * Math.PI) / 180
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.1)
    }
  })

  const riskColor = riskLevel > 0.7 ? "#ff6b35" : "#00e5ff"

  return (
    <>
      <DroneTrail points={drone.pathHistory} />
      <SensorRays position={drone.position} sensors={drone.sensors} />

      <group ref={groupRef}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* Main Body */}
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.18, 0.7]} />
            <meshStandardMaterial color="#121212" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Core Glow */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={riskColor} emissive={riskColor} emissiveIntensity={3} />
          </mesh>

          {/* Arms & Rotors */}
          {[[0.6, 0.15, 0.6], [-0.6, 0.15, 0.6], [0.6, 0.15, -0.6], [-0.6, 0.15, -0.6]].map((pos, i) => (
            <group key={i}>
              <mesh position={[pos[0] * 0.5, 0.05, pos[2] * 0.5]} rotation={[0, Math.atan2(pos[0], pos[2]), 0]}>
                <boxGeometry args={[0.1, 0.08, 0.8]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={pos as [number, number, number]}>
                <cylinderGeometry args={[0.12, 0.12, 0.15, 8]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh
                ref={(el) => { if (el) propRefs.current[i] = el }}
                position={[pos[0], pos[1] + 0.08, pos[2]] as [number, number, number]}
              >
                <cylinderGeometry args={[0.45, 0.45, 0.01, 3]} />
                <meshStandardMaterial color={riskColor} transparent opacity={0.4} />
              </mesh>
            </group>
          ))}

          {/* FRONT Camera & Sensor */}
          <group position={[0, 0.05, 0.4]}>
            <mesh>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color={aiDeployed ? "#00ff88" : "#ff3333"} emissive={aiDeployed ? "#00ff88" : "#ff3333"} emissiveIntensity={2} />
            </mesh>
            {/* THE POV CAMERA */}
            <PerspectiveCamera
              makeDefault={false}
              ref={povCameraRef}
              fov={70}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              name="dronePOV"
            />
          </group>
        </Float>

        <pointLight ref={glowRef} position={[0, -0.4, 0]} color={riskColor} intensity={2.5} distance={6} />
      </group>
    </>
  )
}

