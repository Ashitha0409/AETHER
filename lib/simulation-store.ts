import { create } from "zustand"

export interface Obstacle {
  id: string
  position: [number, number, number]
  scale: [number, number, number]
  type: "debris" | "pole" | "car" | "barrier"
  rotation: number
}

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
}

export type ComputeMode = "CPU" | "NPU" | "GPU"
export type SimPhase = "idle" | "generating" | "ready" | "deploying" | "running" | "complete"

interface SimulationState {
  phase: SimPhase
  computeMode: ComputeMode
  floodGenerated: boolean
  aiDeployed: boolean
  obstacles: Obstacle[]
  waterLevel: number
  drone: DroneState
  telemetry: TelemetryData
  targetPosition: [number, number, number]
  fogIntensity: number
  windForce: number
  difficultyLevel: number

  generateFlood: () => void
  deployAI: () => void
  switchCompute: () => void
  resetSimulation: () => void
  updateDrone: (drone: Partial<DroneState>) => void
  updateTelemetry: (telemetry: Partial<TelemetryData>) => void
  setPhase: (phase: SimPhase) => void
}

function generateObstacles(count: number, areaSize: number): Obstacle[] {
  const types: Obstacle["type"][] = ["debris", "pole", "car", "barrier"]
  const obstacles: Obstacle[] = []

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    let scale: [number, number, number]

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
  obstacles: [],
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
  },
  targetPosition: [18, 1, 18],
  fogIntensity: 0,
  windForce: 0,
  difficultyLevel: 1,

  generateFlood: () => {
    set({ phase: "generating" })

    setTimeout(() => {
      const obstacles = generateObstacles(55, 40)
      set({
        obstacles,
        waterLevel: 0.35,
        floodGenerated: true,
        fogIntensity: 0.3,
        windForce: 2,
        phase: "ready",
        targetPosition: [
          15 + Math.random() * 5,
          1,
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
      CPU: 12 + Math.random() * 4,
      NPU: 2.5 + Math.random() * 1.5,
      GPU: 5 + Math.random() * 2,
    }
    const cpuMap: Record<ComputeMode, number> = {
      CPU: 78 + Math.random() * 15,
      NPU: 22 + Math.random() * 10,
      GPU: 35 + Math.random() * 12,
    }
    const powerMap: Record<ComputeMode, number> = {
      CPU: 35 + Math.random() * 10,
      NPU: 8 + Math.random() * 4,
      GPU: 25 + Math.random() * 8,
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
      obstacles: [],
      waterLevel: 0,
      fogIntensity: 0,
      windForce: 0,
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
      },
    })
  },

  updateDrone: (drone) => {
    set({ drone: { ...get().drone, ...drone } })
  },

  updateTelemetry: (telemetry) => {
    set({ telemetry: { ...get().telemetry, ...telemetry } })
  },

  setPhase: (phase) => set({ phase }),
}))
