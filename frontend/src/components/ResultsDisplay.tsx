import React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, AlertTriangle, Download, Sparkles } from "lucide-react"
import type { PredictionResult } from "../types"
import { type Language, translations } from "../lib/i18n"

interface ResultsDisplayProps {
  results: PredictionResult[]
  onSelectAudioForPlayback?: (filename: string) => void
  language: Language
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  onSelectAudioForPlayback,
  language,
}) => {
  if (!results || results.length === 0) return null
  const t = translations[language]

  const total = results.length
  const fakeCount = results.filter((r) => r.label?.toLowerCase() === "fake").length
  const realCount = results.filter((r) => r.label?.toLowerCase() === "real").length
  const avgConfidence = (
    results.reduce((acc, r) => acc + (r.confidence_pct || 0), 0) / (total || 1)
  ).toFixed(1)

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `nectec_aasist_verdict_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const exportCSV = () => {
    const headers = ["Filename", "Model", "Verdict", "Confidence_Pct", "Raw_Score"]
    const rows = results.map((r) => [
      `"${r.filename}"`,
      `"${r.model || ""}"`,
      `"${r.label || ""}"`,
      r.confidence_pct || 0,
      r.confidence || 0,
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", encodeURI(csvContent))
    downloadAnchor.setAttribute("download", `nectec_aasist_verdict_${Date.now()}.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pt-4"
    >
      {/* Metric Summary Grid (Clean Flat Cards with minimal borders) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl p-4 bg-card/60 border border-border/80 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">{t.summaryTotal}</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1.5">{total}</span>
        </div>

        <div className="rounded-2xl p-4 bg-card/60 border border-border/80 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t.summaryReal}</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">{realCount}</span>
        </div>

        <div className="rounded-2xl p-4 bg-card/60 border border-border/80 flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{t.summaryFake}</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1.5">{fakeCount}</span>
        </div>

        <div className="rounded-2xl p-4 bg-card/60 border border-border/80 flex flex-col justify-between">
          <span className="text-xs font-semibold text-primary">{t.summaryAvgConf}</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-primary mt-1.5">{avgConfidence}%</span>
        </div>
      </div>

      {/* Action Header & Exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{t.resultsTitle}</span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl border border-border/80 bg-card/60 hover:bg-secondary/40 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={exportJSON}
            className="px-3 py-1.5 rounded-xl border border-border/80 bg-card/60 hover:bg-secondary/40 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{t.exportJson}</span>
          </button>
        </div>
      </div>

      {/* Results List (Clean Flat Cards with Crisp Accents) */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((res, index) => {
          const isReal = res.label?.toLowerCase() === "real"
          const hasError = !!res.error

          return (
            <motion.div
              key={`${res.filename}-${index}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`rounded-2xl p-5 border transition-all ${
                hasError
                  ? "bg-rose-500/5 border-rose-500/30"
                  : isReal
                  ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-foreground break-all">
                      {res.filename}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-primary font-semibold">
                      {res.model}
                    </span>
                  </div>
                  {hasError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{res.error}</span>
                    </p>
                  )}
                </div>

                {/* Verdict Badge */}
                {!hasError && (
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
                        isReal
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isReal ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      <span>{isReal ? t.verdictReal : t.verdictFake}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Confidence Progress Gauge */}
              {!hasError && (
                <div className="mt-3.5 pt-3 border-t border-border/40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>{t.confidenceLabel}</span>
                    <span className="font-bold text-foreground">{res.confidence_pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isReal
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-rose-500 to-amber-400"
                      }`}
                      style={{ width: `${Math.min(Math.max(res.confidence_pct, 5), 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
