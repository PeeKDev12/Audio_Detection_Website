import React, { useEffect, useState } from "react"
import { History, Search, Trash2, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react"
import { apiService } from "../services/api"
import type { PredictionHistoryItem } from "../types"

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLabel, setFilterLabel] = useState<"ALL" | "Real" | "Fake">("ALL")

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await apiService.getHistory()
      // Sort newest first by ID or timestamp
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
    <section id="history" className="py-12 space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Detection Audit History</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Persisted historical runs logged in the SQLite backend database (sorted newest first)
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark text-xs font-bold text-foreground transition-all flex items-center gap-2 self-start sm:self-auto border border-border/40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Toolbar: Search and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search filenames in audit log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setFilterLabel("ALL")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              filterLabel === "ALL"
                ? "shadow-neu-inset dark:shadow-neu-inset-dark text-cyan-600 dark:text-cyan-400"
                : "shadow-neu-flat dark:shadow-neu-flat-dark text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilterLabel("Real")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              filterLabel === "Real"
                ? "shadow-neu-inset dark:shadow-neu-inset-dark text-emerald-600 dark:text-emerald-400"
                : "shadow-neu-flat dark:shadow-neu-flat-dark text-muted-foreground hover:text-foreground"
            }`}
          >
            Real
          </button>
          <button
            onClick={() => setFilterLabel("Fake")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              filterLabel === "Fake"
                ? "shadow-neu-inset dark:shadow-neu-inset-dark text-rose-600 dark:text-rose-400"
                : "shadow-neu-flat dark:shadow-neu-flat-dark text-muted-foreground hover:text-foreground"
            }`}
          >
            Fake
          </button>
        </div>
      </div>

      {/* History Log Container */}
      <div className="rounded-3xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark overflow-hidden p-4 sm:p-6">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground animate-pulse font-mono">
            Fetching audit logs from backend...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No matching detection records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-muted-foreground uppercase text-[10px] font-mono border-b border-border/50">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Audio Filename</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Recorded Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {filteredHistory.map((item) => {
                  const isReal = item.label.toLowerCase() === "real"
                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-muted-foreground">#{item.id}</td>
                      <td className="px-4 py-3.5 text-foreground max-w-xs truncate">{item.filename}</td>
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
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 shadow-neu-sm dark:shadow-neu-sm-dark hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark transition-all"
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
      </div>
    </section>
  )
}
