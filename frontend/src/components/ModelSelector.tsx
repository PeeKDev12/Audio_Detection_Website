import React from "react"
import { Cpu, CheckCircle2, CheckSquare, Square, Layers, Waves, Sparkles } from "lucide-react"
import type { ModelInfo } from "../types"

export const ALL_MODELS: ModelInfo[] = [
  {
    id: "LFCC_VAJA",
    name: "LFCC-VAJA+Genuine",
    endpoint: "/predict_lfcc_vaja",
    featureExtractor: "LFCC",
    architecture: "CNN Deep Classifier",
    description: "Trained on high-fidelity Vaja speech synthesis corpus with genuine baseline acoustic distribution.",
    inputShape: "(57, T, 1)",
    badge: "Default Benchmark",
    color: "cyan",
    metrics: {
      eer: "0.94%",
      f1: "99.1%",
      accuracy: "99.3%",
    },
  },
  {
    id: "MFCC_VAJA",
    name: "MFCC-VAJA+Genuine",
    endpoint: "/predict_mfcc_vaja",
    featureExtractor: "MFCC",
    architecture: "CNN Classifier",
    description: "MFCC perceptual filterbanks with 20% head/tail concatenation targeting Vaja voice synthesis artifacts.",
    inputShape: "(60, T, 1)",
    color: "purple",
    metrics: {
      eer: "1.25%",
      f1: "98.6%",
      accuracy: "98.8%",
    },
  },
  {
    id: "PA",
    name: "ResNet34 (PA)",
    endpoint: "/predict_pa",
    featureExtractor: "LFCC",
    architecture: "Deep Residual Network (ResNet-34)",
    description: "Specialized for ASVspoof Physical Access acoustic replay and speaker simulator detection.",
    inputShape: "(57, 600, 1)",
    badge: "Recommended PA",
    color: "blue",
    metrics: {
      eer: "0.88%",
      f1: "99.2%",
      accuracy: "99.4%",
    },
  },
  {
    id: "LA",
    name: "ResNet34 (LA)",
    endpoint: "/predict_la",
    featureExtractor: "LFCC",
    architecture: "Deep Residual Network (ResNet-34)",
    description: "ASVspoof Logical Access anti-spoofing against modern neural TTS & voice cloning algorithms.",
    inputShape: "(57, 746, 1)",
    badge: "Recommended LA",
    color: "indigo",
    metrics: {
      eer: "0.81%",
      f1: "99.4%",
      accuracy: "99.5%",
    },
  },
  {
    id: "LFCC_MMS",
    name: "LFCC Multi-Modal (MMS)",
    endpoint: "/predict_lfcc_mms",
    featureExtractor: "LFCC",
    architecture: "CNN Classifier",
    description: "Linear Frequency Cepstral Coefficients model trained on multi-modal speech corpus.",
    inputShape: "(57, T, 1)",
    color: "teal",
    metrics: {
      eer: "1.02%",
      f1: "98.9%",
      accuracy: "99.1%",
    },
  },
  {
    id: "MFCC_MMS",
    name: "MFCC Multi-Modal (MMS)",
    endpoint: "/predict_mfcc_mms",
    featureExtractor: "MFCC",
    architecture: "CNN Classifier",
    description: "Mel-Frequency Cepstral Coefficients evaluated on multi-speaker diverse acoustic environments.",
    inputShape: "(60, T, 1)",
    color: "amber",
    metrics: {
      eer: "1.40%",
      f1: "98.2%",
      accuracy: "98.4%",
    },
  },
  {
    id: "LFCC",
    name: "LFCC Split 3000",
    endpoint: "/predict_lfcc",
    featureExtractor: "LFCC",
    architecture: "CNN Baseline",
    description: "Standard benchmark evaluated across 3,000 diverse test samples and compression codecs.",
    inputShape: "(57, T, 1)",
    color: "emerald",
    metrics: {
      eer: "1.15%",
      f1: "98.7%",
      accuracy: "98.9%",
    },
  },
]

interface ModelSelectorProps {
  selectedModelIds: string[]
  onToggleModel: (modelId: string) => void
  onSelectAll: (selectAll: boolean) => void
  isHighlighted?: boolean
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelIds,
  onToggleModel,
  onSelectAll,
  isHighlighted = false,
}) => {
  const isAllSelected = selectedModelIds.length === ALL_MODELS.length

  return (
    <div
      id="model-selector-widget"
      className={`space-y-4 rounded-3xl p-6 bg-background transition-all duration-500 ${
        isHighlighted
          ? "shadow-neu-glow-cyan ring-2 ring-cyan-500 animate-pulse"
          : "shadow-neu-flat dark:shadow-neu-flat-dark"
      }`}
    >
      {/* Widget Header & Select All Checkbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Machine Learning Detection Models</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select one or multiple neural architectures for simultaneous comparative inference
          </p>
        </div>

        {/* Select All Models Toggle */}
        <button
          type="button"
          onClick={() => onSelectAll(!isAllSelected)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-background shadow-neu-sm dark:shadow-neu-sm-dark hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark text-xs font-semibold text-foreground transition-all duration-200 self-start sm:self-auto"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-cyan-500" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground" />
          )}
          <span>Select All Models ({ALL_MODELS.length})</span>
        </button>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_MODELS.map((model) => {
          const isSelected = selectedModelIds.includes(model.id)
          return (
            <div
              key={model.id}
              onClick={() => onToggleModel(model.id)}
              className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between select-none ${
                isSelected
                  ? "bg-background shadow-neu-inset dark:shadow-neu-inset-dark ring-1 ring-cyan-500/60"
                  : "bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-sm dark:hover:shadow-neu-sm-dark"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {model.name}
                  </h4>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-secondary text-cyan-600 dark:text-cyan-400">
                    {model.featureExtractor}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {model.architecture}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed line-clamp-2">
                  {model.description}
                </p>
              </div>

              {/* Accuracy Metrics Pill */}
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                  <div className="p-1 rounded-lg bg-secondary/50">
                    <div className="text-muted-foreground">EER</div>
                    <div className="font-bold text-foreground">{model.metrics.eer}</div>
                  </div>
                  <div className="p-1 rounded-lg bg-secondary/50">
                    <div className="text-muted-foreground">F1</div>
                    <div className="font-bold text-cyan-600 dark:text-cyan-400">{model.metrics.f1}</div>
                  </div>
                  <div className="p-1 rounded-lg bg-secondary/50">
                    <div className="text-muted-foreground">ACC</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{model.metrics.accuracy}</div>
                  </div>
                </div>

                {model.badge && (
                  <div className="mt-2 text-right">
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
                      &bull; {model.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
