import React from "react"
import { motion } from "framer-motion"
import { Download, Sparkles, AlertTriangle, FileAudio } from "lucide-react"
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
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(results, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute(
      "download",
      `nectec_aasist_verdict_${Date.now()}.json`
    )
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
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", encodeURI(csvContent))
    downloadAnchor.setAttribute(
      "download",
      `nectec_aasist_verdict_${Date.now()}.csv`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pt-2"
    >
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{t.resultsTitle}</span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-secondary/50 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={exportJSON}
            className="px-3 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-secondary/50 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{t.exportJson}</span>
          </button>
        </div>
      </div>

      {/* Table 1: Evaluation Summary Table (Simple Line Axis) */}
      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        <div className="px-4 py-2.5 bg-secondary/30 border-b border-border text-xs font-bold text-foreground flex items-center gap-2">
          <span>{language === "th" ? "สรุปผลการวิเคราะห์ภาพรวม" : "Evaluation Summary Overview"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-border">
            <thead className="bg-secondary/20 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-3">{t.summaryTotal}</th>
                <th className="px-4 py-3">{t.summaryReal}</th>
                <th className="px-4 py-3">{t.summaryFake}</th>
                <th className="px-4 py-3 text-right">{t.summaryAvgConf}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card/20">
              <tr>
                <td className="px-4 py-3.5 font-mono font-bold text-foreground text-sm sm:text-base">
                  {total}
                </td>
                <td className="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                  {realCount}
                </td>
                <td className="px-4 py-3.5 font-mono font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                  {fakeCount}
                </td>
                <td className="px-4 py-3.5 font-mono font-bold text-primary text-right text-sm sm:text-base">
                  {avgConfidence}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Analysis Results Table (Detailed Item Breakdown) */}
      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        <div className="px-4 py-2.5 bg-secondary/30 border-b border-border text-xs font-bold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-primary" />
            <span>{language === "th" ? "รายละเอียดผลการวิเคราะห์จำแนกไฟล์" : "File-by-File Analysis Results"}</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {results.length} {language === "th" ? "รายการ" : "items"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-border">
            <thead className="bg-secondary/20 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">{t.tableFilename}</th>
                <th className="px-4 py-3">{t.colModel}</th>
                <th className="px-4 py-3">{t.tableVerdict}</th>
                <th className="px-4 py-3 text-right">{t.tableConfidence}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card/20">
              {results.map((res, index) => {
                const isReal = res.label?.toLowerCase() === "real"
                const hasError = !!res.error

                return (
                  <tr
                    key={`${res.filename}-${index}`}
                    onClick={() =>
                      onSelectAudioForPlayback &&
                      onSelectAudioForPlayback(res.filename)
                    }
                    className="hover:bg-muted/40 transition-colors cursor-pointer select-none"
                    title="Click to preview audio waveform"
                  >
                    <td className="px-4 py-3.5 text-center font-mono text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground break-all">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{res.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px] font-mono border border-border">
                        {res.model || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">
                      {hasError ? (
                        <span className="text-rose-500 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{res.error}</span>
                        </span>
                      ) : (
                        <span
                          className={
                            isReal
                              ? "text-emerald-600 dark:text-emerald-400 font-bold"
                              : "text-rose-600 dark:text-rose-400 font-bold"
                          }
                        >
                          {isReal ? t.verdictReal : t.verdictFake}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                      {hasError ? "-" : `${res.confidence_pct}%`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
