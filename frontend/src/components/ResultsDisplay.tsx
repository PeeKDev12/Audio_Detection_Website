import React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, AlertTriangle, Download, Sparkles, PieChart, Volume2 } from "lucide-react"
import type { PredictionResult } from "../types"

interface ResultsDisplayProps {
  results: PredictionResult[]
  onSelectAudioForPlayback?: (filename: string) => void
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  onSelectAudioForPlayback,
}) => {
  if (!results || results.length === 0) return null

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
    downloadAnchor.setAttribute("download", `aasist_deepfake_results_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const exportCSV = () => {
    const headers = ["Filename", "Model", "Label", "Confidence_Pct", "Raw_Confidence"]
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
    downloadAnchor.setAttribute("download", `aasist_deepfake_results_${Date.now()}.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pt-6"
    >
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-background shadow-neu-flat dark:shadow-neu-flat-dark flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Evaluated Samples</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">{total}</span>
        </div>

        <div className="rounded-2xl p-5 bg-background shadow-neu-flat dark:shadow-neu-flat-dark flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Authentic (Real)</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{realCount}</span>
        </div>

        <div className="rounded-2xl p-5 bg-background shadow-neu-flat dark:shadow-neu-flat-dark flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Synthetic (Fake)</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{fakeCount}</span>
        </div>

        <div className="rounded-2xl p-5 bg-background shadow-neu-flat dark:shadow-neu-flat-dark flex flex-col justify-between">
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Avg Confidence</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-2">{avgConfidence}%</span>
        </div>
      </div>

      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>Inference Verdicts & Classification Details</span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="px-3.5 py-2 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Results Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {results.map((res, index) => {
          const isReal = res.label?.toLowerCase() === "real"
          const isFake = res.label?.toLowerCase() === "fake"
          const hasError = !!res.error

          return (
            <motion.div
              key={`${res.filename}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`rounded-3xl p-6 transition-all bg-background select-none ${
                hasError
                  ? "shadow-neu-flat dark:shadow-neu-flat-dark border border-rose-500/30"
                  : isReal
                  ? "shadow-neu-flat dark:shadow-neu-flat-dark border border-emerald-500/30"
                  : "shadow-neu-flat dark:shadow-neu-flat-dark border border-rose-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Filename and Model Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-foreground break-all">
                      {res.filename}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-background shadow-neu-inset dark:shadow-neu-inset-dark text-cyan-600 dark:text-cyan-400">
                      {res.model}
                    </span>
                  </div>

                  {hasError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1.5 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{res.error}</span>
                    </p>
                  )}
                </div>

                {/* Verdict Badge */}
                {!hasError && (
                  <div className="flex items-center gap-3">
                    {isReal ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-extrabold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>BONAFIDE / REAL</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-extrabold">
                        <ShieldAlert className="w-4 h-4" />
                        <span>SPOOF / DEEPFAKE</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confidence Progress Gauge */}
              {!hasError && (
                <div className="mt-5 pt-4 border-t border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>Classification Confidence</span>
                    <span className="font-bold text-foreground">{res.confidence_pct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-background shadow-neu-inset dark:shadow-neu-inset-dark overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isReal
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-neu-glow-emerald"
                          : "bg-gradient-to-r from-rose-500 to-orange-400 shadow-neu-glow-rose"
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
