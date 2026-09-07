import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, Activity } from "lucide-react"

interface FauxProgressBarProps {
  isAnalyzing: boolean
  isComplete: boolean
  modelNames: string
}

export const FauxProgressBar: React.FC<FauxProgressBarProps> = ({
  isAnalyzing,
  isComplete,
  modelNames,
}) => {
  const [progress, setProgress] = useState(0)
  const [phaseText, setPhaseText] = useState("Decoding audio signal & resampling to 16 kHz...")

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0)
      return
    }

    setProgress(10)
    setPhaseText("Decoding audio signal & resampling to 16 kHz...")

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) {
          setPhaseText("Extracting acoustic spectro-temporal features (LFCC/MFCC)...")
          return prev + Math.random() * 8 + 4
        }
        if (prev < 65) {
          setPhaseText("Forwarding tensors to neural graph attention layers...")
          return prev + Math.random() * 5 + 2
        }
        if (prev < 86) {
          setPhaseText("Evaluating anti-spoofing decision boundary...")
          return prev + Math.random() * 3 + 1
        }
        // Randomly stall between 85% - 95%
        if (prev < 94) {
          setPhaseText("Finalizing ensemble probability distribution...")
          return prev + Math.random() * 0.8
        }
        return prev
      })
    }, 280)

    return () => clearInterval(interval)
  }, [isAnalyzing])

  useEffect(() => {
    if (isComplete) {
      setProgress(100)
      setPhaseText("Inference complete! Generating classification report...")
    }
  }, [isComplete])

  if (!isAnalyzing && progress === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-3xl p-6 bg-background shadow-neu-flat dark:shadow-neu-flat-dark space-y-4 my-6"
      >
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" />
            <span>Asynchronous Neural Inference ({modelNames})</span>
          </div>
          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Neumorphic Inset Progress Track */}
        <div className="w-full h-4 rounded-full bg-background shadow-neu-inset dark:shadow-neu-inset-dark overflow-hidden p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-neu-glow-cyan"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span className="animate-pulse">{phaseText}</span>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400">Non-blocking threadpool</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
