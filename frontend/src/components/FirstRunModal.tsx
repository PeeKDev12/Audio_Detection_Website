import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Info, ArrowDown, Play, CheckCircle2 } from "lucide-react"

interface FirstRunModalProps {
  isOpen: boolean
  onConfirmAndRun: () => void
  onExploreModels: () => void
}

export const FirstRunModal: React.FC<FirstRunModalProps> = ({
  isOpen,
  onConfirmAndRun,
  onExploreModels,
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative max-w-lg w-full rounded-3xl bg-background p-6 sm:p-8 shadow-neu-lg dark:shadow-neu-lg-dark border border-border/80 space-y-6"
        >
          {/* Header Icon */}
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Model Configuration Notice
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                First-time Analysis Interception
              </p>
            </div>
          </div>

          {/* Body Notice */}
          <div className="p-4 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark space-y-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
            <p className="flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <span>
                You are currently using the default <strong className="text-cyan-600 dark:text-cyan-400">LFCC-VAJA+Genuine</strong> model.
              </span>
            </p>
            <p className="text-muted-foreground text-xs pl-6">
              Feel free to explore and select other models (such as ResNet34 PA/LA or AASIST), enable multi-model comparison, or proceed with the default setup now.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onExploreModels}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2"
            >
              <ArrowDown className="w-4 h-4 text-muted-foreground" />
              <span>Explore Models First</span>
            </button>

            <button
              onClick={onConfirmAndRun}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark text-xs font-bold text-cyan-600 dark:text-cyan-400 transition-all flex items-center justify-center gap-2 border border-cyan-500/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Confirm & Run Analysis</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
