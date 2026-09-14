import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, ArrowDown, Play } from "lucide-react"
import { type Language, translations } from "../lib/i18n"

interface FirstRunModalProps {
  isOpen: boolean
  onConfirmAndRun: () => void
  onExploreModels: () => void
  language: Language
}

export const FirstRunModal: React.FC<FirstRunModalProps> = ({
  isOpen,
  onConfirmAndRun,
  onExploreModels,
  language,
}) => {
  if (!isOpen) return null
  const t = translations[language]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative max-w-lg w-full bg-background rounded-3xl p-6 sm:p-8 border border-border space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-muted/60 border border-border text-primary">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {t.modalTitle}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                First-time Run Interception
              </p>
            </div>
          </div>

          {/* Notice Body */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2 text-xs sm:text-sm text-foreground/90 leading-relaxed">
            <div className="font-semibold text-primary">
              {t.modalNoticeHeader}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t.modalNoticeText}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onExploreModels}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-background border border-border hover:bg-muted text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2"
            >
              <ArrowDown className="w-4 h-4 text-muted-foreground" />
              <span>{t.modalExplore}</span>
            </button>

            <button
              type="button"
              onClick={onConfirmAndRun}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-xs font-bold text-primary-foreground transition-all flex items-center justify-center gap-2 border border-primary/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.modalConfirm}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
