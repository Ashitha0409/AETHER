"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useSimulation, type Obstacle, type BuildingState } from "@/lib/simulation-store"

// ── Window Lights Component ─────────────────────
function WindowLights({ scale, collapsedHeight }: { scale: [number, number, number]; collapsedHeight: number }) {
  return (
    <group>
      {Array.from({ length: Math.floor(collapsedHeight) }).map((_, i) => (
        <mesh key={i} position={[0, (i - collapsedHeight / 2) * 1.5 + 0.5, scale[2] / 2 + 0.05]}>
          <planeGeometry args={[scale[0] * 0.7, 0.05]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={Math.random() > 0.4 ? 2.5 : 0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Fire Effect Component ───────────────────────
function FireEffect({ intensity, scale }: { intensity: number; scale: [number, number, number] }) {
  const fireRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (fireRef.current) {
      fireRef.current.scale.setScalar(intensity * (1 + Math.sin(clock.elapsedTime * 10) * 0.1))
    }
  })

  return (
    <group ref={fireRef} position={[0, 0, scale[2] / 2 + 0.1]}>
      {/* Flame cores */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[scale[0] * 0.4, 8, 8]} />
        <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={5} />
      </mesh>
      {/* Outer glow */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[scale[0] * 0.6, 8, 8]} />
        <meshStandardMaterial color="#ff8c00" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

// ── Building block ──────────────────────────────
function Building({ building }: { building: BuildingState }) {
  const { position, scale, stability, tilt, collapsedHeight, isDestroyed, hasFire } = building

  const color = isDestroyed ? "#2a2d3a" : "#3a415a"

  return (
    <group position={[position[0], collapsedHeight / 2, position[2]]} rotation={[tilt[0], 0, tilt[1]]}>
      {/* Main structure or broken segments */}
      {isDestroyed ? (
        <group>
          {/* Smashed base */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[scale[0], collapsedHeight * 0.4, scale[2]]} />
            <meshStandardMaterial color="#2d221a" roughness={1} />
          </mesh>
          {/* Slanted ruins */}
          <mesh position={[0.5, collapsedHeight * 0.3, 0]} rotation={[0.2, 0.1, 0.4]} castShadow>
            <boxGeometry args={[scale[0] * 0.8, collapsedHeight * 0.5, scale[2] * 0.8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Rebar poking out */}
          <mesh position={[-0.8, collapsedHeight * 0.2, 0.8]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2, 4]} />
            <meshStandardMaterial color="#444" metalness={1} />
          </mesh>
        </group>
      ) : (
        <>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[scale[0], collapsedHeight, scale[2]]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
          </mesh>
          <WindowLights scale={scale} collapsedHeight={collapsedHeight} />
          {/* Roof detail */}
          <mesh position={[0, collapsedHeight / 2 + 0.05, 0]}>
            <boxGeometry args={[scale[0] * 0.9, 0.1, scale[2] * 0.9]} />
            <meshStandardMaterial color="#1a1c25" />
          </mesh>
        </>
      )}

      {/* Raging Fire */}
      {hasFire && <FireEffect intensity={1} scale={scale} />}
    </group>
  )
}

// ── City grid ───────────────────────────────────
export function CityGrid() {
  const { buildingStates, floodGenerated } = useSimulation()

  // During empty state, show static buildings if buildingStates is empty
  if (buildingStates.length === 0) {
    return (
      <group>
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i % 6 - 3) * 8
          const z = (Math.floor(i / 6) - 3) * 8
          if (Math.abs(x) < 4 && Math.abs(z) < 4) return null

          // Deterministic "Broken" look for placeholder
          const isBroken = (i % 3 === 0)
          const baseHeight = 4 + (i % 5) * 2

          return <Building key={i} building={{
            id: `placeholder-${i}`,
            position: [x, 0, z],
            scale: [3, baseHeight, 3],
            stability: isBroken ? 0.4 : 1.0,
            tilt: [isBroken ? 0.1 : 0, 0] as [number, number],
            collapsedHeight: isBroken ? baseHeight * 0.7 : baseHeight,
            isDestroyed: isBroken,
            hasFire: false,
            fireIntensity: 0
          }} />
        })}
      </group>
    )
  }

  return (
    <group>
      {buildingStates.map((b: BuildingState) => (
        <Building key={b.id} building={b} />
      ))}
    </group>
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
  car: "#2d3436",
  barrier: "#4a3520",
  concrete: "#636e72",
  metal: "#2d3436",
}

export function ObstacleField({ obstacles }: { obstacles: Obstacle[] }) {
  return (
    <group>
      {obstacles.map((obs) => (
        <mesh
          key={obs.id}
          position={obs.position}
          rotation={[Math.random(), obs.rotation, Math.random()]}
          castShadow
        >
          {obs.type === "pole" ? (
            <cylinderGeometry args={[obs.scale[0], obs.scale[0], obs.scale[1], 6]} />
          ) : obs.type === "debris" ? (
            <dodecahedronGeometry args={[obs.scale[0]]} />
          ) : (
            <boxGeometry args={obs.scale} />
          )}
          <meshStandardMaterial
            color={obstacleColors[obs.type] || "#444"}
            roughness={0.9}
            metalness={obs.type === "metal" ? 0.8 : 0.1}
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
      ref.current.position.y = level + Math.sin(clock.elapsedTime * 0.4) * 0.08
    }
  })

  if (level <= 0) return null

  return (
    <group>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, level, 0]} receiveShadow>
        <planeGeometry args={[120, 120, 64, 64]} />
        <meshStandardMaterial
          color="#124a6e"
          transparent
          opacity={0.7}
          roughness={0.05}
          metalness={0.9}
          emissive="#001a2e"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Sub-surface depth layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, level - 0.2, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial color="#051a29" transparent opacity={0.4} />
      </mesh>
    </group>
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
