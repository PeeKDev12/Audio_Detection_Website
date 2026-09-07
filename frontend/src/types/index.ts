export interface PredictionResult {
  filename: string
  model: string
  label: "Real" | "Fake" | string
  confidence: number
  confidence_pct: number
  error?: string
}

export interface ModelMetrics {
  eer: string
  f1: string
  accuracy: string
}

export interface ModelInfo {
  id: string
  name: string
  endpoint: string
  featureExtractor: "LFCC" | "MFCC" | "Raw Waveform"
  architecture: string
  description: string
  badge?: string
  inputShape?: string
  color: string
  metrics: ModelMetrics
}

export interface PredictionHistoryItem {
  id: number
  filename: string
  label: string
  confidence: string
  timestamp: string
}

export interface SystemStatus {
  status: string
  version: string
  models: Record<string, { name: string; loaded: boolean; input_shape?: any }>
}
