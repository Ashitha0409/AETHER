"use client"

import { useEffect, useState } from "react"
import { useSimulation } from "@/lib/simulation-store"
import {
  Gauge,
  Zap,
  Timer,
  Target,
  Activity,
  Thermometer,
  TrendingUp,
  Layers,
} from "lucide-react"

function TelemetryRow({
  icon: Icon,
  label,
  value,
  unit,
  color = "text-primary",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  unit: string
  color?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon className={`h-3 w-3 ${color}`} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-mono font-bold text-foreground">{value}</span>
        <span className="text-[9px] font-mono text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function LatencyBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = Math.min((value / max) * 100, 100)
  return (
    <div className="h-1 w-full rounded-full bg-secondary/50 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function TelemetryPanel() {
  const { drone, telemetry, computeMode, phase, survivorFound } = useSimulation()
  const [time, setTime] = useState("00:00")

  useEffect(() => {
    const mins = Math.floor(telemetry.episodeTime / 60)
    const secs = Math.floor(telemetry.episodeTime % 60)
    setTime(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`)
  }, [telemetry.episodeTime])

  return (
    <div className="glass-panel rounded-lg p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-primary" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Telemetry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${phase === "running" ? "bg-[#00ff88] animate-pulse" : "bg-muted-foreground"
              }`}
          />
          <span className="text-[9px] font-mono text-muted-foreground uppercase">
            {phase === "running" ? "RECORDING" : phase.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="border-t border-border/30 pt-1">
        <TelemetryRow icon={Gauge} label="Speed" value={drone.speed.toFixed(1)} unit="m/s" />
        <TelemetryRow icon={Layers} label="Altitude" value={drone.altitude.toFixed(1)} unit="m" color="text-[#00ff88]" />
        <TelemetryRow icon={Target} label="Distance" value={telemetry.distanceToTarget.toFixed(1)} unit="m" color="text-warning" />
        <TelemetryRow icon={Timer} label="Mission" value={time} unit="" />
        <TelemetryRow
          icon={Activity}
          label="Target"
          value={survivorFound ? "LOCATED" : "SEARCHING"}
          unit=""
          color={survivorFound ? "text-[#00ff88]" : "text-muted-foreground"}
        />
      </div>

      <div className="border-t border-border/30 pt-2 mt-1">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2 block">
          Compute: {computeMode}
        </span>

        <div className="flex flex-col gap-2">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono text-muted-foreground">INFERENCE</span>
              <span className="text-[10px] font-mono text-foreground font-bold">
                {telemetry.inferenceLatency.toFixed(1)} ms
              </span>
            </div>
            <LatencyBar
              value={telemetry.inferenceLatency}
              max={20}
              color={computeMode === "NPU" ? "#00e5ff" : computeMode === "GPU" ? "#00ff88" : "#ff6b35"}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono text-muted-foreground">CPU LOAD</span>
              <span className="text-[10px] font-mono text-foreground font-bold">
                {telemetry.cpuUsage.toFixed(0)}%
              </span>
            </div>
            <LatencyBar
              value={telemetry.cpuUsage}
              max={100}
              color={telemetry.cpuUsage > 70 ? "#ff3333" : telemetry.cpuUsage > 40 ? "#ff6b35" : "#00ff88"}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono text-muted-foreground">POWER</span>
              <span className="text-[10px] font-mono text-foreground font-bold">
                {telemetry.powerDraw.toFixed(1)} W
              </span>
            </div>
            <LatencyBar
              value={telemetry.powerDraw}
              max={50}
              color="#00e5ff"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border/30 pt-2 mt-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-mono text-muted-foreground">REWARD</span>
        </div>
        <span className="text-sm font-mono font-bold text-foreground">
          {telemetry.rewardScore.toFixed(1)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Success Rate</span>
        </div>
        <span className="text-sm font-mono font-bold text-[#00ff88]">
          {telemetry.successRate.toFixed(1)}%
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="h-3 w-3 text-warning" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Difficulty</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-foreground">LV. {telemetry.difficulty}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-3 rounded-sm ${i < telemetry.difficulty ? "bg-warning" : "bg-secondary/50"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-[#00ff88]" />
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">FPS</span>
        </div>
        <span className="text-sm font-mono font-bold text-foreground">{telemetry.fps.toFixed(0)}</span>
      </div>
    </div>
  )
}
