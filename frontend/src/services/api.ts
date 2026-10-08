import axios from "axios"
import type { PredictionResult, PredictionHistoryItem, SystemStatus } from "../types"

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`
  }
  return "http://127.0.0.1:8000"
}

const API_BASE_URL = getApiBaseUrl()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
})

export const apiService = {
  async checkHealth(): Promise<{ ok: boolean; time: string }> {
    const res = await apiClient.get<{ ok: boolean; time: string }>("/health")
    return res.data
  },

  async getModelsStatus(): Promise<Record<string, { name: string; loaded: boolean; input_shape?: any }>> {
    const res = await apiClient.get("/models")
    return res.data
  },

  async predictBatch(endpoint: string, files: File[]): Promise<PredictionResult[]> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const res = await apiClient.post<PredictionResult[]>(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data
  },

  async getHistory(limit: number = 10, offset: number = 0): Promise<PredictionHistoryItem[]> {
    const res = await apiClient.get<PredictionHistoryItem[]>("/history", {
      params: { limit, offset },
    })
    return res.data
  },

  async deleteHistoryItem(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/history/${id}`)
    return res.data
  },
}
