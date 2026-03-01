"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
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

// Ground heatmap indicating search coverage or risk
function GroundHeatmap({ position, sensors }: { position: [number, number, number]; sensors: number[] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const minSensor = Math.min(...sensors.slice(0, 8)) // Ignore downward sensor for risk

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.set(position[0], 0.05, position[2])
      meshRef.current.rotation.z += 0.01
      const scale = 1.5 + Math.sin(clock.elapsedTime * 2) * 0.2
      meshRef.current.scale.set(scale, scale, 1)
    }
  })

  const color = minSensor < 2 ? "#ff3333" : minSensor < 4 ? "#ffaa00" : "#00e5ff"

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        alphaMap={new THREE.TextureLoader().load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lensflare/lensflare0.png")}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Trail renderer for drone path
function DroneTrail({ points }: { points: [number, number, number][] }) {
  const lineRef = useRef<THREE.Line>(null)

  useFrame(() => {
    if (lineRef.current && points.length >= 2) {
      const vecs = points.map((p) => new THREE.Vector3(...p))
      lineRef.current.geometry.dispose()
      lineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(vecs)
    }
  })

  if (points.length < 2) return null

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints(points.map(p => new THREE.Vector3(...p)))} />
      <lineBasicMaterial attach="material" color="#00e5ff" opacity={0.3} transparent />
    </line>
  )
}

export function Drone() {
  const groupRef = useRef<THREE.Group>(null)
  const propRefs = useRef<(THREE.Mesh | null)[]>([])
  const glowRef = useRef<THREE.PointLight>(null)

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
    riskLevel, // Pulled from store
  } = useSimulation()

  const startTime = useRef(0)
  const reward = useRef(0)

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return

    // Spin propellers - speed up if running
    const propSpeed = phase === "running" ? 45 : 15
    propRefs.current.forEach((p) => {
      if (p) p.rotation.y += propSpeed * delta
    })

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 4) * 0.4
    }

    // Drone orientation - slight tilt based on movement (simulated)
    if (phase === "running") {
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 2) * 0.05 + 0.1
      groupRef.current.rotation.z = Math.cos(clock.elapsedTime * 2) * 0.05
    } else {
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 1) * 0.02
      groupRef.current.rotation.z = Math.cos(clock.elapsedTime * 1) * 0.02
    }

    if (phase === "running" && aiDeployed) {
      if (startTime.current === 0) startTime.current = clock.elapsedTime

      const current = new THREE.Vector3(...drone.position)
      const target = new THREE.Vector3(...targetPosition)
      const direction = target.clone().sub(current).normalize()
      const distance = current.distanceTo(target)

      // Obstacle avoidance: compute repulsion from nearby obstacles
      const avoidance = new THREE.Vector3(0, 0, 0)
      const sensorDistances = new Array(9).fill(15) // 8 horizontal + 1 downward

      obstacles.forEach((obs) => {
        const obsPos = new THREE.Vector3(...obs.position)
        const diff = current.clone().sub(obsPos)
        const dist = diff.length()
        if (dist < 6) {
          avoidance.add(diff.normalize().multiplyScalar(4 / (dist + 0.5)))

          // Simplified sensor update (just find min distance for demonstration)
          for (let i = 0; i < 8; i++) {
            sensorDistances[i] = Math.min(sensorDistances[i], dist + (Math.random() * 0.5))
          }
        }
      })

      // Downward sensor to water level
      sensorDistances[8] = Math.max(0, current.y - waterLevel)

      // Reweight speed and avoidance based on riskLevel
      // riskLevel 0: cautious (more avoidance, less speed)
      // riskLevel 1: aggressive (less avoidance, more speed)
      const speedWeight = THREE.MathUtils.lerp(2.8, 4.5, riskLevel) // Base speed 2.8, up to 4.5
      const avoidanceWeight = THREE.MathUtils.lerp(2.0, 0.8, riskLevel) // Base avoidance 2.0, down to 0.8

      // Combined movement: target seeking + obstacle avoidance
      const combined = direction
        .multiplyScalar(speedWeight)
        .add(avoidance.multiplyScalar(avoidanceWeight))
        .normalize()

      const speed = Math.min(6, distance * 0.5 + 1.5)
      const movement = combined.multiplyScalar(speed * delta)

      // Anti-gravity bobbing logic
      const targetY = 3.5 + (phase === "running" ? Math.sin(clock.elapsedTime * 2.5) * 0.3 : 0)
      const newPos: [number, number, number] = [
        current.x + movement.x,
        targetY,
        current.z + movement.z,
      ]

      // Path history (sampled)
      const newHistory = [...drone.pathHistory]
      if (
        newHistory.length === 0 ||
        new THREE.Vector3(...newHistory[newHistory.length - 1]).distanceTo(
          new THREE.Vector3(...newPos)
        ) > 0.4
      ) {
        newHistory.push(newPos)
        if (newHistory.length > 250) newHistory.shift()
      }

      // Reward calculation
      const prevDist = new THREE.Vector3(...drone.position).distanceTo(target)
      const newDist = new THREE.Vector3(...newPos).distanceTo(target)
      reward.current += (prevDist - newDist) * 3 // Forward reward
      reward.current -= delta * 0.2 // Time penalty
      if (Math.min(...sensorDistances) < 1.5) reward.current -= 5 * delta // Collision penalty

      const episodeTime = clock.elapsedTime - startTime.current

      updateDrone({
        position: newPos,
        speed: speed,
        altitude: newPos[1] - waterLevel,
        heading: Math.atan2(movement.x, movement.z) * (180 / Math.PI),
        sensors: sensorDistances,
        pathHistory: newHistory,
      })

      updateTelemetry({
        distanceToTarget: newDist,
        episodeTime: episodeTime,
        rewardScore: reward.current,
        fps: 59 + Math.random() * 2,
        difficulty: Math.max(1, Math.min(5, Math.floor(reward.current / 40) + 1)),
      })

      // Target reached
      if (distance < 2.5) {
        reward.current += 500
        updateDrone({ targetReached: true })
        updateTelemetry({
          rewardScore: reward.current,
          successRate: Math.min(99.9, telemetry.successRate + 0.1)
        })
        setPhase("complete")
        startTime.current = 0
      }
    }

    // Update group position
    groupRef.current.position.set(...drone.position)
    if (phase === "running") {
      // Smooth rotation towards heading
      const targetRotation = (drone.heading * Math.PI) / 180
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.1)
    }
  })

  const propPositions: [number, number, number][] = [
    [0.6, 0.15, 0.6],
    [-0.6, 0.15, 0.6],
    [0.6, 0.15, -0.6],
    [-0.6, 0.15, -0.6],
  ]

  return (
    <>
      <DroneTrail points={drone.pathHistory} />
      <SensorRays position={drone.position} sensors={drone.sensors} />
      <GroundHeatmap position={drone.position} sensors={drone.sensors} />

      <group ref={groupRef}>
        {/* Main Body - Carbon Fiber aesthetic */}
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.18, 0.7]} />
          <meshStandardMaterial color="#121212" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Top Protective Shell */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.5]} />
          <meshStandardMaterial color="#00e5ff" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Risk-Reactive Core Glow */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color={riskLevel > 0.7 ? "#ff6b35" : "#00e5ff"}
            emissive={riskLevel > 0.7 ? "#ff6b35" : "#00e5ff"}
            emissiveIntensity={3}
          />
        </mesh>

        {/* Structural Arms */}
        {propPositions.map((pos, i) => (
          <group key={i}>
            <mesh position={[pos[0] * 0.5, 0.05, pos[2] * 0.5]} rotation={[0, Math.atan2(pos[0], pos[2]), 0]}>
              <boxGeometry args={[0.1, 0.08, 0.8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Rotor Motors */}
            <mesh position={pos}>
              <cylinderGeometry args={[0.12, 0.12, 0.15, 8]} />
              <meshStandardMaterial color="#333" />
            </mesh>
            {/* Propellers - Semi-transparent cyan */}
            <mesh
              ref={(el) => {
                if (el) propRefs.current[i] = el
              }}
              position={[pos[0], pos[1] + 0.08, pos[2]]}
            >
              <cylinderGeometry args={[0.45, 0.45, 0.01, 3]} />
              <meshStandardMaterial
                color="#00e5ff"
                emissive="#00e5ff"
                emissiveIntensity={0.8}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        ))}

        {/* Underside Navigation Light */}
        <pointLight
          ref={glowRef}
          position={[0, -0.4, 0]}
          color="#00e5ff"
          intensity={2.5}
          distance={6}
          decay={2}
        />

        {/* AI Processing Unit Hub (Front) */}
        <mesh position={[0, 0, 0.4]}>
          <boxGeometry args={[0.3, 0.1, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Status Optical Sensor */}
        <mesh position={[0, 0.05, 0.42]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color={aiDeployed ? "#00ff88" : "#ff3333"}
            emissive={aiDeployed ? "#00ff88" : "#ff3333"}
            emissiveIntensity={4}
          />
        </mesh>
      </group>
    </>
  )
}

