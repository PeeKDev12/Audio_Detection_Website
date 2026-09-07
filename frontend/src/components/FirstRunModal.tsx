import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown, Play } from "lucide-react"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-lg w-full bg-background border border-foreground p-6 sm:p-8 space-y-6 shadow-none font-mono"
        >
          {/* Header */}
          <div className="border-b border-border pb-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              [DISPATCH // 2026-ASV]
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground mt-1 uppercase tracking-tight">
              {t.modalTitle}
            </h3>
          </div>

          {/* Notice Body */}
          <div className="p-4 bg-surface border border-border space-y-2 text-xs text-foreground/90 font-sans leading-relaxed">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
              &bull; {t.modalNoticeHeader}
            </div>
            <p className="text-muted-foreground text-xs">
              {t.modalNoticeText}
            </p>
          </div>

          {/* Stark Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 font-mono text-xs font-bold uppercase">
            <button
              type="button"
              onClick={onExploreModels}
              className="w-full sm:w-1/2 py-3 px-4 border border-border hover:bg-surface text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>{t.modalExplore}</span>
            </button>

            <button
              type="button"
              onClick={onConfirmAndRun}
              className="w-full sm:w-1/2 py-3 px-4 bg-foreground text-background hover:opacity-85 transition-opacity flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.modalConfirm}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
