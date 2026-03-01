import { create } from "zustand"

export interface Obstacle {
  id: string
  position: [number, number, number]
  scale: [number, number, number]
  type: "debris" | "pole" | "car" | "barrier" | "concrete" | "metal"
  rotation: number
}

export interface BuildingState {
  id: string
  position: [number, number, number]
  scale: [number, number, number]
  stability: number // 1 to 0
  tilt: [number, number] // x, z tilt in radians
  collapsedHeight: number
  isDestroyed: boolean
  hasFire: boolean
  fireIntensity: number
}

export type DisasterType = "flood" | "fire"

export interface DroneState {
  position: [number, number, number]
  velocity: [number, number, number]
  speed: number
  altitude: number
  heading: number
  sensors: number[]
  targetReached: boolean
  pathHistory: [number, number, number][]
}

export interface TelemetryData {
  fps: number
  inferenceLatency: number
  cpuUsage: number
  powerDraw: number
  distanceToTarget: number
  episodeTime: number
  rewardScore: number
  difficulty: number
  successRate: number
}

export type ComputeMode = "CPU" | "NPU" | "GPU"
export type SimPhase = "idle" | "generating" | "ready" | "deploying" | "running" | "complete"

interface SimulationState {
  phase: SimPhase
  computeMode: ComputeMode
  floodGenerated: boolean
  aiDeployed: boolean
  obstacles: Obstacle[]
  buildingStates: BuildingState[]
  waterLevel: number
  drone: DroneState
  telemetry: TelemetryData
  targetPosition: [number, number, number]
  fogIntensity: number
  windForce: number
  difficultyLevel: number
  manualMode: boolean
  disasterType: DisasterType
  riskLevel: number // 0 to 1

  generateDisaster: (type: DisasterType) => void
  deployAI: () => void
  switchCompute: () => void
  resetSimulation: () => void
  updateDrone: (drone: Partial<DroneState>) => void
  updateTelemetry: (telemetry: Partial<TelemetryData>) => void
  setPhase: (phase: SimPhase) => void
  setManualMode: (mode: boolean) => void
  damageBuilding: (id: string, amount: number) => void
  setRiskLevel: (level: number) => void
}

function generateObstacles(count: number, areaSize: number): Obstacle[] {
  const obstacles: Obstacle[] = []
  const types: ("debris" | "pole" | "car" | "barrier" | "concrete" | "metal")[] = [
    "debris", "pole", "car", "barrier", "concrete", "metal"
  ]

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    let scale: [number, number, number] = [1, 1, 1]

    switch (type) {
      case "debris":
        scale = [0.5 + Math.random() * 1.5, 0.3 + Math.random() * 0.8, 0.5 + Math.random() * 1.5]
        break
      case "pole":
        scale = [0.15, 1.5 + Math.random() * 2, 0.15]
        break
      case "car":
        scale = [1.2, 0.6, 2.2]
        break
      case "barrier":
        scale = [2 + Math.random() * 3, 0.8 + Math.random() * 1.2, 0.3]
        break
    }

    obstacles.push({
      id: `obs-${i}`,
      position: [
        (Math.random() - 0.5) * areaSize,
        scale[1] / 2,
        (Math.random() - 0.5) * areaSize,
      ],
      scale,
      type,
      rotation: Math.random() * Math.PI * 2,
    })
  }

  return obstacles
}

export const useSimulation = create<SimulationState>((set, get) => ({
  phase: "idle",
  computeMode: "CPU",
  floodGenerated: false,
  aiDeployed: false,
  manualMode: true,
  disasterType: "flood",
  riskLevel: 0.5,
  obstacles: [],
  buildingStates: [],
  waterLevel: 0,
  drone: {
    position: [0, 3, 0],
    velocity: [0, 0, 0],
    speed: 0,
    altitude: 3,
    heading: 0,
    sensors: [10, 10, 10, 10, 10, 10],
    targetReached: false,
    pathHistory: [],
  },
  telemetry: {
    fps: 60,
    inferenceLatency: 12,
    cpuUsage: 45,
    powerDraw: 15,
    distanceToTarget: 0,
    episodeTime: 0,
    rewardScore: 0,
    difficulty: 1,
    successRate: 88.4,
  },
  targetPosition: [18, 1, 18],
  fogIntensity: 0,
  windForce: 0,
  difficultyLevel: 1,

  generateDisaster: (type) => {
    set({ phase: "generating", disasterType: type })

    setTimeout(() => {
      const obstacles = generateObstacles(55, 40)

      // Initialize buildings with full stability
      const buildings: BuildingState[] = []
      const gridSize = 5
      const spacing = 8
      for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
          if (Math.abs(x) % 2 === 0 && Math.abs(z) % 2 === 0) continue
          const id = `bldg-${x}-${z}`
          const height = 1.5 + Math.random() * 8 // Taller for potential breakage
          buildings.push({
            id,
            position: [x * spacing, 0, z * spacing],
            scale: [2.5 + Math.random() * 2, height, 2.5 + Math.random() * 2],
            stability: 1.0,
            tilt: [0, 0] as [number, number],
            collapsedHeight: height,
            isDestroyed: false,
            hasFire: type === "fire" && Math.random() < 0.3,
            fireIntensity: 0,
          })
        }
      }

      set({
        obstacles,
        buildingStates: buildings,
        waterLevel: type === "flood" ? 0.4 : 0,
        floodGenerated: true,
        fogIntensity: type === "fire" ? 0.6 : 0.45,
        windForce: 2,
        phase: "ready",
        manualMode: true,
        targetPosition: [
          15 + Math.random() * 5,
          type === "fire" ? 5 : 1, // Target might be higher on a building in fire
          15 + Math.random() * 5,
        ],
        drone: {
          ...get().drone,
          position: [-15, 3, -15],
          velocity: [0, 0, 0],
          speed: 0,
          targetReached: false,
          pathHistory: [],
        },
      })
    }, 1500)
  },

  deployAI: () => {
    if (!get().floodGenerated) return
    set({
      aiDeployed: true,
      manualMode: false,
      phase: "running",
      telemetry: {
        ...get().telemetry,
        episodeTime: 0,
        rewardScore: 0,
      },
    })
  },

  switchCompute: () => {
    const modes: ComputeMode[] = ["CPU", "NPU", "GPU"]
    const current = get().computeMode
    const nextIndex = (modes.indexOf(current) + 1) % modes.length
    const nextMode = modes[nextIndex]

    const latencyMap: Record<ComputeMode, number> = {
      CPU: 22.5 + Math.random() * 8,
      NPU: 1.8 + Math.random() * 0.8,
      GPU: 6.5 + Math.random() * 2,
    }
    const cpuMap: Record<ComputeMode, number> = {
      CPU: 88 + Math.random() * 10,
      NPU: 8 + Math.random() * 4,
      GPU: 45 + Math.random() * 12,
    }
    const powerMap: Record<ComputeMode, number> = {
      CPU: 42 + Math.random() * 8,
      NPU: 2.8 + Math.random() * 1.5,
      GPU: 32 + Math.random() * 6,
    }

    set({
      computeMode: nextMode,
      telemetry: {
        ...get().telemetry,
        inferenceLatency: latencyMap[nextMode],
        cpuUsage: cpuMap[nextMode],
        powerDraw: powerMap[nextMode],
      },
    })
  },

  resetSimulation: () => {
    set({
      phase: "idle",
      floodGenerated: false,
      aiDeployed: false,
      manualMode: true,
      obstacles: [],
      buildingStates: [],
      waterLevel: 0,
      fogIntensity: 0,
      windForce: 0,
      drone: {
        position: [0, 3, 0],
        velocity: [0, 0, 0],
        speed: 0,
        altitude: 3,
        heading: 0,
        sensors: [10, 10, 10, 10, 10, 10, 10, 10, 10],
        targetReached: false,
        pathHistory: [],
      },
      telemetry: {
        fps: 60,
        inferenceLatency: 12,
        cpuUsage: 45,
        powerDraw: 15,
        distanceToTarget: 0,
        episodeTime: 0,
        rewardScore: 0,
        difficulty: 1,
        successRate: 88.4,
      },
    })
  },

  setRiskLevel: (riskLevel) => set({ riskLevel }),

  updateDrone: (drone) => {
    const state = get()
    set({ drone: { ...state.drone, ...drone } })

    // Autonomous reweighting logic
    if (state.phase === "running" && !state.manualMode) {
      const dronePos = state.drone.position
      const targetPos = state.targetPosition
      const risk = state.riskLevel

      // 1. Calculate direction to target
      const dirToTarget = [
        targetPos[0] - dronePos[0],
        targetPos[1] - dronePos[1],
        targetPos[2] - dronePos[2]
      ]
      const dist = Math.sqrt(dirToTarget[0] ** 2 + dirToTarget[1] ** 2 + dirToTarget[2] ** 2)
      const normalizedTargetDir = dirToTarget.map(d => d / dist)

      // 2. Weights based on risk (0 = Safe, 1 = Rush)
      // Safe: High avoidance (1.0), low speed (0.5)
      // Rush: Low avoidance (0.2), high speed (2.0)
      const moveWeight = 0.5 + risk * 1.5
      const avoidanceWeight = 1.0 - risk * 0.8

      // (Simplification for simulation state update - actual physics logic is in drone.tsx)
      // But we update telemetry values here
      drone.speed = moveWeight * 5
    }

    // If drone is near a building, damage it
    if (state.phase === "running") {
      const dronePos = state.drone.position
      const updatedBuildings = state.buildingStates.map(b => {
        const dx = b.position[0] - dronePos[0]
        const dz = b.position[2] - dronePos[2]
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < 4 && !b.isDestroyed) {
          const newStability = Math.max(0, b.stability - 0.01)
          const isDestroyed = newStability <= 0
          return {
            ...b,
            stability: newStability,
            isDestroyed,
            tilt: [
              isDestroyed ? (Math.random() - 0.5) * 0.2 : b.tilt[0],
              isDestroyed ? (Math.random() - 0.5) * 0.2 : b.tilt[1],
            ] as [number, number],
            collapsedHeight: isDestroyed ? b.scale[1] * 0.6 : b.collapsedHeight
          }
        }
        return b
      })
      set({ buildingStates: updatedBuildings })
    }
  },

  updateTelemetry: (telemetry) => {
    set({ telemetry: { ...get().telemetry, ...telemetry } })
  },

  setPhase: (phase) => set({ phase }),
  setManualMode: (manualMode) => set({ manualMode }),
  damageBuilding: (id, amount) => {
    set({
      buildingStates: get().buildingStates.map(b =>
        b.id === id ? { ...b, stability: Math.max(0, b.stability - amount) } : b
      )
    })
  }
}))
