import React, { useEffect, useState } from "react"
import { Search, Trash2, RefreshCw } from "lucide-react"
import { apiService } from "../services/api"
import type { PredictionHistoryItem } from "../types"
import { type Language, translations } from "../lib/i18n"

interface HistoryViewProps {
  language: Language
}

export const HistoryView: React.FC<HistoryViewProps> = ({ language }) => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLabel, setFilterLabel] = useState<"ALL" | "Real" | "Fake">("ALL")
  const t = translations[language]

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await apiService.getHistory()
      const sorted = [...data].sort((a, b) => b.id - a.id)
      setHistory(sorted)
    } catch (err) {
      console.error("Failed to fetch prediction history:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteHistoryItem(id)
      setHistory((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Failed to delete history record:", err)
    }
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterLabel === "ALL" ||
      (filterLabel === "Real" && item.label.toLowerCase() === "real") ||
      (filterLabel === "Fake" && item.label.toLowerCase() === "fake")
    return matchesSearch && matchesFilter
  })

  return (
    <section id="history" className="py-16 space-y-8 hairline-t">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 font-mono">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            [SQLITE_AUDIT_LOG]
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase">
            {t.historyTitle}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            {t.historySubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className="px-4 py-2 border border-border bg-background hover:bg-surface text-xs font-bold text-foreground uppercase transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{t.refreshLogs}</span>
        </button>
      </div>

      {/* Toolbar: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 font-mono text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterLabel("ALL")}
            className={`px-3 py-2 border border-border uppercase transition-colors ${
              filterLabel === "ALL"
                ? "bg-foreground text-background font-bold"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.filterAll} [{history.length}]
          </button>
          <button
            type="button"
            onClick={() => setFilterLabel("Real")}
            className={`px-3 py-2 border border-border uppercase transition-colors ${
              filterLabel === "Real"
                ? "bg-foreground text-background font-bold"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.filterReal}
          </button>
          <button
            type="button"
            onClick={() => setFilterLabel("Fake")}
            className={`px-3 py-2 border border-border uppercase transition-colors ${
              filterLabel === "Fake"
                ? "bg-foreground text-background font-bold"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.filterFake}
          </button>
        </div>
      </div>

      {/* Table Ledger Container */}
      <div className="border border-border font-mono text-xs">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground uppercase tracking-widest text-[11px]">
            [FETCHING_DATABASE_LEDGER...]
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            {t.emptyHistory}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-border">
              <thead className="bg-surface/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t.tableId}</th>
                  <th className="px-4 py-3">{t.tableFilename}</th>
                  <th className="px-4 py-3">{t.tableVerdict}</th>
                  <th className="px-4 py-3">{t.tableConfidence}</th>
                  <th className="px-4 py-3">{t.tableTimestamp}</th>
                  <th className="px-4 py-3 text-right">{t.tableAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {filteredHistory.map((item) => {
                  const isReal = item.label.toLowerCase() === "real"
                  return (
                    <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-muted-foreground">#{item.id}</td>
                      <td className="px-4 py-3 font-bold text-foreground max-w-xs truncate">{item.filename}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                            isReal
                              ? "border-emerald-600/60 text-emerald-600 dark:text-emerald-400"
                              : "border-rose-600/60 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">
                        {item.confidence}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {new Date(item.timestamp).toISOString().replace("T", " ").substring(0, 19)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
