
import type { PredictionHistoryItem } from "../types"

const STORAGE_KEY = "nectec_prediction_history"

export const localHistoryService = {
  getAll(): PredictionHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)

      if (!stored) return []

      const parsed: unknown = JSON.parse(stored)

      if (!Array.isArray(parsed)) return []

      return parsed as PredictionHistoryItem[]
    } catch (error) {
      console.error("Failed to read local history:", error)
      return []
    }
  },

  save(item: PredictionHistoryItem): void {
    const history = this.getAll()
    const updated = [item, ...history]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  },

  delete(id: number): void {
    const updated = this.getAll().filter((item) => item.id !== id)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
