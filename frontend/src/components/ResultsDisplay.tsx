import React from "react"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pt-6 font-mono"
    >
      {/* Metric Ledger Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-4 bg-surface/50">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            {t.summaryTotal}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-foreground mt-1 block">
            {total}
          </span>
        </div>

        <div className="p-4 bg-surface/50">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            {t.summaryReal}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-foreground mt-1 block">
            {realCount}
          </span>
        </div>

        <div className="p-4 bg-surface/50">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            {t.summaryFake}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-foreground mt-1 block">
            {fakeCount}
          </span>
        </div>

        <div className="p-4 bg-surface/50">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            {t.summaryAvgConf}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-foreground mt-1 block">
            {avgConfidence}%
          </span>
        </div>
      </div>

      {/* Action Header & Exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          {t.resultsTitle}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3 py-1.5 border border-border hover:bg-surface text-xs font-bold text-foreground transition-colors flex items-center gap-1.5 uppercase"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={exportJSON}
            className="px-3 py-1.5 border border-border hover:bg-surface text-xs font-bold text-foreground transition-colors flex items-center gap-1.5 uppercase"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportJson}</span>
          </button>
        </div>
      </div>

      {/* Results Ledger Entries */}
      <div className="border border-border divide-y divide-border">
        {results.map((res, index) => {
          const isReal = res.label?.toLowerCase() === "real"
          const hasError = !!res.error

          return (
            <div
              key={`${res.filename}-${index}`}
              className="p-5 bg-background hover:bg-surface/30 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-foreground break-all">
                      {res.filename}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 border border-border text-muted-foreground uppercase">
                      [{res.model}]
                    </span>
                  </div>
                  {hasError && (
                    <div className="text-xs text-rose-500">
                      [ERROR: {res.error}]
                    </div>
                  )}
                </div>

                {/* Verdict Badge */}
                {!hasError && (
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                        isReal
                          ? "border-emerald-600/60 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                          : "border-rose-600/60 text-rose-600 dark:text-rose-400 bg-rose-500/5"
                      }`}
                    >
                      {isReal ? t.verdictReal : t.verdictFake}
                    </span>
                  </div>
                )}
              </div>

              {/* Monospaced Confidence Bar */}
              {!hasError && (
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t.confidenceLabel}</span>
                    <span className="font-bold text-foreground">{res.confidence_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface border border-border overflow-hidden">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${Math.min(Math.max(res.confidence_pct, 2), 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
