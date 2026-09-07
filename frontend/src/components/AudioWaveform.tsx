import React, { useEffect, useRef, useState } from "react"
import WaveSurfer from "wavesurfer.js"
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward } from "lucide-react"

interface AudioWaveformProps {
  file?: File
  audioUrl?: string
  height?: number
  onReady?: (duration: number) => void
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  file,
  audioUrl,
  height = 70,
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
    }

    const isDark = document.documentElement.classList.contains("dark")

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isDark ? "#475569" : "#94a3b8",
      progressColor: isDark ? "#60a5fa" : "#3b82f6",
      cursorColor: isDark ? "#93c5fd" : "#2563eb",
      cursorWidth: 2,
      height: height,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    })

    wavesurferRef.current = ws

    ws.on("ready", () => {
      const dur = ws.getDuration()
      setDuration(dur)
      setIsLoaded(true)
      if (onReady) onReady(dur)
    })

    ws.on("timeupdate", (time) => {
      setCurrentTime(time)
    })

    ws.on("finish", () => {
      setIsPlaying(false)
    })

    if (file) {
      const objectUrl = URL.createObjectURL(file)
      ws.load(objectUrl)
      return () => {
        URL.revokeObjectURL(objectUrl)
        ws.destroy()
      }
    } else if (audioUrl) {
      ws.load(audioUrl)
      return () => {
        ws.destroy()
      }
    }

    return () => {
      ws.destroy()
    }
  }, [file, audioUrl, height])

  const togglePlay = () => {
    if (!wavesurferRef.current || !isLoaded) return
    wavesurferRef.current.playPause()
    setIsPlaying(wavesurferRef.current.isPlaying())
  }

  const handleRestart = () => {
    if (!wavesurferRef.current) return
    wavesurferRef.current.seekTo(0)
    wavesurferRef.current.play()
    setIsPlaying(true)
  }

  const toggleMute = () => {
    if (!wavesurferRef.current) return
    const nextMute = !isMuted
    wavesurferRef.current.setMuted(nextMute)
    setIsMuted(nextMute)
  }

  const cyclePlaybackRate = () => {
    if (!wavesurferRef.current) return
    const rates = [1.0, 1.25, 1.5, 0.75]
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIdx]
    wavesurferRef.current.setPlaybackRate(nextRate)
    setPlaybackRate(nextRate)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}.${ms}`
  }

  return (
    <div className="bg-background rounded-2xl p-4 shadow-neu-inset dark:shadow-neu-inset-dark space-y-3">
      {/* Waveform Canvas */}
      <div className="relative">
        <div ref={containerRef} className="w-full rounded-xl overflow-hidden" />
        {!isLoaded && (
          <div className="h-16 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
            Decoding audio waveform...
          </div>
        )}
      </div>

      {/* Neumorphic Mechanical Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={!isLoaded}
            className="p-2.5 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-primary font-bold disabled:opacity-40 transition-all"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            disabled={!isLoaded}
            className="p-2.5 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-foreground/80 hover:text-foreground disabled:opacity-40 transition-all"
            title="Restart Track"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mute */}
          <button
            type="button"
            onClick={toggleMute}
            disabled={!isLoaded}
            className="p-2.5 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-foreground/80 hover:text-foreground disabled:opacity-40 transition-all"
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Speed */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            disabled={!isLoaded}
            className="px-3 py-2 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-primary font-mono text-xs disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" />
            <span>{playbackRate}x</span>
          </button>
        </div>

        {/* Timestamp */}
        <div className="font-mono text-xs px-3 py-1.5 rounded-xl bg-background shadow-neu-sm dark:shadow-neu-sm-dark">
          <span className="text-primary font-bold">{formatTime(currentTime)}</span>
          <span className="text-muted-foreground"> / {formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
