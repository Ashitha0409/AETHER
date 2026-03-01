"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { Obstacle } from "@/lib/simulation-store"

// ── Building block ──────────────────────────────
function Building({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh position={[position[0], scale[1] / 2, position[2]]} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color="#1a1f2e" roughness={0.8} metalness={0.2} />
    </mesh>
  )
}

// ── City grid ───────────────────────────────────
export function CityGrid() {
  const buildings = useMemo(() => {
    const arr: { position: [number, number, number]; scale: [number, number, number] }[] = []
    const gridSize = 5
    const spacing = 8

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        // Leave empty space for streets
        if (Math.abs(x) % 2 === 0 && Math.abs(z) % 2 === 0) continue
        // Skip some buildings randomly for variety
        if (Math.random() < 0.15) continue

        const height = 1.5 + Math.random() * 5
        const width = 2 + Math.random() * 2.5
        const depth = 2 + Math.random() * 2.5

        arr.push({
          position: [x * spacing, 0, z * spacing],
          scale: [width, height, depth],
        })
      }
    }
    return arr
  }, [])

  return (
    <>
      {buildings.map((b, i) => (
        <Building key={i} position={b.position} scale={b.scale} />
      ))}
    </>
  )
}

// ── Ground plane ────────────────────────────────
export function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#0d1117" roughness={0.9} />
    </mesh>
  )
}

// ── Street lines ────────────────────────────────
export function StreetGrid() {
  const lineObjects = useMemo(() => {
    const result: THREE.Line[] = []
    const material = new THREE.LineBasicMaterial({ color: "#1a2535", opacity: 0.5, transparent: true })

    for (let i = -5; i <= 5; i++) {
      // Horizontal
      const hPts = [new THREE.Vector3(-45, 0.01, i * 8), new THREE.Vector3(45, 0.01, i * 8)]
      result.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(hPts), material))
      // Vertical
      const vPts = [new THREE.Vector3(i * 8, 0.01, -45), new THREE.Vector3(i * 8, 0.01, 45)]
      result.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vPts), material))
    }
    return result
  }, [])

  return (
    <group>
      {lineObjects.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  )
}

// ── Obstacle meshes ─────────────────────────────
const obstacleColors: Record<string, string> = {
  debris: "#3a2a1a",
  pole: "#4a4a4a",
  car: "#2a1a1a",
  barrier: "#4a3520",
}

export function ObstacleField({ obstacles }: { obstacles: Obstacle[] }) {
  return (
    <group>
      {obstacles.map((obs) => (
        <mesh
          key={obs.id}
          position={obs.position}
          rotation={[0, obs.rotation, obs.type === "pole" ? Math.random() * 0.5 : 0]}
          castShadow
        >
          {obs.type === "pole" ? (
            <cylinderGeometry args={[obs.scale[0], obs.scale[0], obs.scale[1], 6]} />
          ) : (
            <boxGeometry args={obs.scale} />
          )}
          <meshStandardMaterial
            color={obstacleColors[obs.type]}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Water plane ─────────────────────────────────
export function WaterPlane({ level }: { level: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = level + Math.sin(clock.elapsedTime * 0.5) * 0.05
    }
  })

  if (level <= 0) return null

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, level, 0]}>
      <planeGeometry args={[100, 100, 32, 32]} />
      <meshStandardMaterial
        color="#0a3d5c"
        transparent
        opacity={0.55}
        roughness={0.1}
        metalness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ── Target marker (survivor) ────────────────────
export function TargetMarker({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.3
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 1.5
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.15
      ringRef.current.scale.set(s, s, s)
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Pulsing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.06, 8, 32]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={2} />
      </mesh>
      {/* Center beacon */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={3} />
      </mesh>
      {/* Vertical beam */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.02, 0.15, 8, 8]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
