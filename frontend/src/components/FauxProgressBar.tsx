import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Language, translations } from "../lib/i18n"

interface FauxProgressBarProps {
  isAnalyzing: boolean
  isComplete: boolean
  modelNames: string
  language: Language
}

export const FauxProgressBar: React.FC<FauxProgressBarProps> = ({
  isAnalyzing,
  isComplete,
  modelNames,
  language,
}) => {
  const [progress, setProgress] = useState(0)
  const t = translations[language]
  const [phaseText, setPhaseText] = useState(t.phase1)

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0)
      return
    }

    setProgress(12)
    setPhaseText(t.phase1)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) {
          setPhaseText(t.phase2)
          return prev + Math.random() * 8 + 4
        }
        if (prev < 65) {
          setPhaseText(t.phase3)
          return prev + Math.random() * 5 + 2
        }
        if (prev < 86) {
          setPhaseText(t.phase4)
          return prev + Math.random() * 3 + 1
        }
        // Randomly stall between 85% - 95%
        if (prev < 94) {
          setPhaseText(t.phase5)
          return prev + Math.random() * 0.8
        }
        return prev
      })
    }, 250)

    return () => clearInterval(interval)
  }, [isAnalyzing, language])

  useEffect(() => {
    if (isComplete) {
      setProgress(100)
      setPhaseText("[INFERENCE_RESOLVED // GENERATING_VERDICT]")
    }
  }, [isComplete])

  if (!isAnalyzing && progress === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="border border-border p-5 bg-surface font-mono my-6 space-y-3"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-foreground">
            {t.progressLabel} &bull; [{modelNames}]
          </span>
          <span className="font-bold text-foreground">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Stark Geometric Flat Progress Bar */}
        <div className="w-full h-3 bg-background border border-border overflow-hidden">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.15 }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground tracking-wider">
          <span className="font-semibold">{phaseText}</span>
          <span>[THREAD_ASYNC_IDLE: FALSE]</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
