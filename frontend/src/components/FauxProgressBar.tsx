import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu } from "lucide-react"
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
      setPhaseText("Inference complete! Preparing classification report...")
    }
  }, [isComplete])

  if (!isAnalyzing && progress === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-3xl p-6 bg-background border border-border my-6 space-y-4"
      >
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2 text-foreground">
            <Cpu className="w-4 h-4 text-primary animate-spin" />
            <span>{t.progressLabel} ({modelNames})</span>
          </div>
          <span className="font-mono font-bold text-primary">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Flat Progress Track */}
        <div className="w-full h-3 rounded-full bg-muted/60 border border-border/80 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="animate-pulse">{phaseText}</span>
          <span className="font-mono text-[11px] text-primary">Non-blocking threadpool</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
