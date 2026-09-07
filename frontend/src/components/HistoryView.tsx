import React, { useEffect, useState } from "react"
import { History, Search, Trash2, RefreshCw, ShieldCheck, ShieldAlert, ChevronDown } from "lucide-react"
import { apiService } from "../services/api"
import type { PredictionHistoryItem } from "../types"
import { type Language, translations } from "../lib/i18n"

interface HistoryViewProps {
  language: Language
}

const PAGE_SIZE = 10

export const HistoryView: React.FC<HistoryViewProps> = ({ language }) => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLabel, setFilterLabel] = useState<"ALL" | "Real" | "Fake">("ALL")
  const t = translations[language]

  const fetchInitialHistory = async () => {
    setLoading(true)
    try {
      const data = await apiService.getHistory(PAGE_SIZE, 0)
      setHistory(data)
      setOffset(data.length)
      setHasMore(data.length === PAGE_SIZE)
    } catch (err) {
      console.error("Failed to fetch prediction history:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSeeMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextBatch = await apiService.getHistory(PAGE_SIZE, offset)
      if (nextBatch.length > 0) {
        setHistory((prev) => [...prev, ...nextBatch])
        setOffset((prev) => prev + nextBatch.length)
      }
      setHasMore(nextBatch.length === PAGE_SIZE)
    } catch (err) {
      console.error("Failed to load more history:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchInitialHistory()
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
    <section id="history" className="py-12 space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>{t.historyTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t.historySubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInitialHistory}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-border/80 bg-card/60 hover:bg-secondary/40 text-xs font-semibold text-foreground transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{t.refreshLogs}</span>
        </button>
      </div>

      {/* Toolbar: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card/60 border border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterLabel("ALL")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filterLabel === "ALL"
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-card/60 border-border/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.filterAll} ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterLabel("Real")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filterLabel === "Real"
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                : "bg-card/60 border-border/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.filterReal}
          </button>
          <button
            type="button"
            onClick={() => setFilterLabel("Fake")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filterLabel === "Fake"
                ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400"
                : "bg-card/60 border-border/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.filterFake}
          </button>
        </div>
      </div>

      {/* History Table Container (Flat Data Layout) */}
      <div className="rounded-2xl border border-border/80 bg-card/40 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-muted-foreground animate-pulse">
            Fetching history logs from database...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-10 text-center text-xs text-muted-foreground">
            {t.emptyHistory}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm divide-y divide-border/60">
              <thead className="bg-secondary/20 text-muted-foreground uppercase text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3">{t.tableId}</th>
                  <th className="px-4 py-3">{t.tableFilename}</th>
                  <th className="px-4 py-3">{t.tableVerdict}</th>
                  <th className="px-4 py-3">{t.tableConfidence}</th>
                  <th className="px-4 py-3">{t.tableTimestamp}</th>
                  <th className="px-4 py-3 text-right">{t.tableAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {filteredHistory.map((item) => {
                  const isReal = item.label.toLowerCase() === "real"
                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-muted-foreground">#{item.id}</td>
                      <td className="px-4 py-3.5 text-foreground max-w-xs truncate font-semibold">{item.filename}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                            isReal
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isReal ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {item.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        {item.confidence}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                          title="Delete Record"
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

        {/* Paginated "See More" Button */}
        {history.length > 0 && (
          <div className="p-4 bg-secondary/10 border-t border-border/60 text-center">
            {hasMore ? (
              <button
                type="button"
                onClick={handleSeeMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-xl border border-border/80 bg-card/80 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all inline-flex items-center gap-2 hover:scale-[1.02]"
              >
                {loadingMore ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>{t.seeMoreLoading}</span>
                  </>
                ) : (
                  <>
                    <span>{t.seeMore}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-primary" />
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-muted-foreground font-medium">
                {t.noMoreHistory} ({history.length} records)
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
