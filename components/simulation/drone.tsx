"use client"

import { useRef, useMemo } from "react"
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
      new THREE.Vector3(-0.7, 0, -0.7).normalize(),
    ],
    []
  )

  return (
    <group position={position}>
      {directions.map((dir, i) => {
        const dist = sensors[i] ?? 10
        const pts = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(dist)]
        const geometry = new THREE.BufferGeometry().setFromPoints(pts)
        const isNear = dist < 4
        return (
          <lineSegments key={i} geometry={geometry}>
            <lineBasicMaterial
              color={isNear ? "#ff3333" : "#00e5ff"}
              opacity={isNear ? 0.8 : 0.25}
              transparent
            />
          </lineSegments>
        )
      })}
    </group>
  )
}

// Trail renderer for drone path
function DroneTrail({ points }: { points: [number, number, number][] }) {
  const geometry = useMemo(() => {
    if (points.length < 2) return null
    const vecs = points.map((p) => new THREE.Vector3(...p))
    return new THREE.BufferGeometry().setFromPoints(vecs)
  }, [points])

  if (!geometry) return null

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#00e5ff" opacity={0.4} transparent linewidth={1} />
    </line>
  )
}

export function Drone() {
  const groupRef = useRef<THREE.Group>(null)
  const propRefs = useRef<THREE.Mesh[]>([])
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
  } = useSimulation()

  const startTime = useRef(0)
  const reward = useRef(0)

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return

    // Spin propellers
    propRefs.current.forEach((p) => {
      if (p) p.rotation.y += 25 * delta
    })

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 4) * 0.5
    }

    if (phase === "running" && aiDeployed) {
      if (startTime.current === 0) startTime.current = clock.elapsedTime

      const current = new THREE.Vector3(...drone.position)
      const target = new THREE.Vector3(...targetPosition)
      const direction = target.clone().sub(current).normalize()
      const distance = current.distanceTo(target)

      // Obstacle avoidance: compute repulsion from nearby obstacles
      const avoidance = new THREE.Vector3(0, 0, 0)
      const sensorDistances = [...drone.sensors]

      obstacles.forEach((obs, idx) => {
        const obsPos = new THREE.Vector3(...obs.position)
        const diff = current.clone().sub(obsPos)
        const dist = diff.length()
        if (dist < 5) {
          avoidance.add(diff.normalize().multiplyScalar(3 / (dist + 0.5)))
          // Update sensor data
          if (idx < sensorDistances.length) {
            sensorDistances[idx] = Math.min(sensorDistances[idx], dist)
          }
        }
      })

      // Combined movement: target seeking + obstacle avoidance
      const combined = direction
        .multiplyScalar(2.5)
        .add(avoidance.multiplyScalar(1.5))
        .normalize()

      const speed = Math.min(5, distance * 0.4 + 1)
      const movement = combined.multiplyScalar(speed * delta)

      const newPos: [number, number, number] = [
        current.x + movement.x,
        3 + Math.sin(clock.elapsedTime * 1.5) * 0.2,
        current.z + movement.z,
      ]

      // Path history (sampled)
      const newHistory = [...drone.pathHistory]
      if (
        newHistory.length === 0 ||
        new THREE.Vector3(...newHistory[newHistory.length - 1]).distanceTo(
          new THREE.Vector3(...newPos)
        ) > 0.5
      ) {
        newHistory.push(newPos)
        if (newHistory.length > 200) newHistory.shift()
      }

      // Reward calculation
      const prevDist = new THREE.Vector3(...drone.position).distanceTo(target)
      const newDist = new THREE.Vector3(...newPos).distanceTo(target)
      reward.current += (prevDist - newDist) * 2 // Forward reward
      reward.current -= delta * 0.1 // Time penalty

      const episodeTime = clock.elapsedTime - startTime.current

      updateDrone({
        position: newPos,
        speed: speed,
        altitude: newPos[1],
        heading: Math.atan2(movement.x, movement.z) * (180 / Math.PI),
        sensors: sensorDistances,
        pathHistory: newHistory,
      })

      updateTelemetry({
        distanceToTarget: newDist,
        episodeTime: episodeTime,
        rewardScore: reward.current,
        fps: 58 + Math.random() * 4,
        difficulty: Math.max(1, Math.min(5, Math.floor(reward.current / 20) + 1)),
      })

      // Target reached
      if (distance < 2) {
        reward.current += 100
        updateDrone({ targetReached: true })
        updateTelemetry({ rewardScore: reward.current })
        setPhase("complete")
        startTime.current = 0
      }
    }

    // Update group position
    groupRef.current.position.set(...drone.position)
    groupRef.current.rotation.y = (drone.heading * Math.PI) / 180
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

      <group ref={groupRef}>
        {/* Body */}
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.15, 0.8]} />
          <meshStandardMaterial color="#0f1923" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Arms */}
        {propPositions.map((pos, i) => (
          <group key={i}>
            {/* Arm */}
            <mesh position={[pos[0] * 0.5, 0.05, pos[2] * 0.5]}>
              <boxGeometry args={[Math.abs(pos[0]) * 1.1, 0.05, 0.06]} />
              <meshStandardMaterial color="#1a2535" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Propeller */}
            <mesh
              ref={(el) => {
                if (el) propRefs.current[i] = el
              }}
              position={pos}
            >
              <cylinderGeometry args={[0.35, 0.35, 0.02, 3]} />
              <meshStandardMaterial
                color="#00e5ff"
                emissive="#00e5ff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        ))}

        {/* Bottom glow */}
        <pointLight
          ref={glowRef}
          position={[0, -0.3, 0]}
          color="#00e5ff"
          intensity={2}
          distance={5}
        />

        {/* Status light */}
        <mesh position={[0, 0.12, 0.3]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color={aiDeployed ? "#00ff88" : "#ff3333"}
            emissive={aiDeployed ? "#00ff88" : "#ff3333"}
            emissiveIntensity={3}
          />
        </mesh>
      </group>
    </>
  )
}
