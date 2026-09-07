import React, { useEffect, useRef, useState } from "react"
import WaveSurfer from "wavesurfer.js"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"

interface AudioWaveformProps {
  file?: File
  audioUrl?: string
  height?: number
  onReady?: (duration: number) => void
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  file,
  audioUrl,
  height = 64,
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
      waveColor: isDark ? "#3f3f46" : "#d4d4d8",
      progressColor: isDark ? "#ffffff" : "#09090b",
      cursorColor: isDark ? "#ffffff" : "#09090b",
      cursorWidth: 1,
      height: height,
      barWidth: 1,
      barGap: 2,
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
    <div className="border border-border p-4 bg-surface/30 space-y-3 font-mono">
      {/* Waveform Canvas */}
      <div className="relative">
        <div ref={containerRef} className="w-full" />
        {!isLoaded && (
          <div className="h-16 flex items-center justify-center text-[11px] text-muted-foreground tracking-widest uppercase">
            [DECODING_PCM_STREAM...]
          </div>
        )}
      </div>

      {/* Strict Minimal Mechanical Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs">
        <div className="flex items-center gap-1.5">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={!isLoaded}
            className="px-3 py-1.5 bg-foreground text-background font-bold text-[11px] uppercase tracking-wider hover:opacity-80 disabled:opacity-30 transition-opacity flex items-center gap-1.5"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            disabled={!isLoaded}
            className="p-1.5 border border-border hover:bg-surface text-foreground disabled:opacity-30 transition-colors"
            title="Restart Track"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mute */}
          <button
            type="button"
            onClick={toggleMute}
            disabled={!isLoaded}
            className="p-1.5 border border-border hover:bg-surface text-foreground disabled:opacity-30 transition-colors"
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Speed */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            disabled={!isLoaded}
            className="px-2.5 py-1.5 border border-border hover:bg-surface text-foreground font-mono text-[10px] disabled:opacity-30 transition-colors"
          >
            {playbackRate}X
          </button>
        </div>

        {/* Timestamp */}
        <div className="text-[11px] text-muted-foreground">
          <span className="text-foreground font-bold">{formatTime(currentTime)}</span> / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}
