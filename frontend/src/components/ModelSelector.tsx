import React from "react"
import { Cpu, CheckCircle2, CheckSquare, Square } from "lucide-react"
import type { ModelInfo } from "../types"
import { type Language, translations } from "../lib/i18n"

export const ALL_MODELS: ModelInfo[] = [
  {
    id: "LFCC_VAJA",
    name: "LFCC-VAJA+Genuine",
    endpoint: "/predict_lfcc_vaja",
    featureExtractor: "LFCC",
    architecture: "Deep CNN Classifier",
    description: "Benchmark trained on high-fidelity Vaja voice synthesis datasets with genuine acoustic baselines.",
    inputShape: "(57, T, 1)",
    badge: "Default Benchmark",
    color: "primary",
    metrics: {
      eer: "0.94%",
      f1: "99.10%",
      accuracy: "99.32%",
    },
  },
  {
    id: "MFCC_VAJA",
    name: "MFCC-VAJA+Genuine",
    endpoint: "/predict_mfcc_vaja",
    featureExtractor: "MFCC",
    architecture: "Deep CNN Classifier",
    description: "Perceptual Mel-scale filterbanks with 20% head/tail margin concatenation for Vaja synthesis.",
    inputShape: "(60, T, 1)",
    color: "indigo",
    metrics: {
      eer: "1.25%",
      f1: "98.60%",
      accuracy: "98.81%",
    },
  },
  {
    id: "PA",
    name: "ResNet34 (PA)",
    endpoint: "/predict_pa",
    featureExtractor: "LFCC",
    architecture: "ResNet-34 Residual Net",
    description: "ASVspoof Physical Access acoustic replay and physical room acoustic variation detector.",
    inputShape: "(57, 600, 1)",
    badge: "Recommended PA",
    color: "blue",
    metrics: {
      eer: "0.88%",
      f1: "99.20%",
      accuracy: "99.41%",
    },
  },
  {
    id: "LA",
    name: "ResNet34 (LA)",
    endpoint: "/predict_la",
    featureExtractor: "LFCC",
    architecture: "ResNet-34 Residual Net",
    description: "ASVspoof Logical Access countermeasure against text-to-speech & voice conversion algorithms.",
    inputShape: "(57, 746, 1)",
    badge: "Recommended LA",
    color: "sky",
    metrics: {
      eer: "0.81%",
      f1: "99.40%",
      accuracy: "99.55%",
    },
  },
  {
    id: "LFCC_MMS",
    name: "LFCC Multi-Modal (MMS)",
    endpoint: "/predict_lfcc_mms",
    featureExtractor: "LFCC",
    architecture: "CNN Classifier",
    description: "Linear Frequency Cepstral Coefficients model trained across multi-modal speech corpora.",
    inputShape: "(57, T, 1)",
    color: "teal",
    metrics: {
      eer: "1.02%",
      f1: "98.90%",
      accuracy: "99.12%",
    },
  },
  {
    id: "MFCC_MMS",
    name: "MFCC Multi-Modal (MMS)",
    endpoint: "/predict_mfcc_mms",
    featureExtractor: "MFCC",
    architecture: "CNN Classifier",
    description: "Mel-Frequency Cepstral Coefficients model evaluated on multi-speaker diverse environments.",
    inputShape: "(60, T, 1)",
    color: "amber",
    metrics: {
      eer: "1.40%",
      f1: "98.20%",
      accuracy: "98.40%",
    },
  },
  {
    id: "LFCC",
    name: "LFCC Split 3000",
    endpoint: "/predict_lfcc",
    featureExtractor: "LFCC",
    architecture: "CNN Baseline",
    description: "Standard benchmark evaluated across 3,000 diverse evaluation audio recordings.",
    inputShape: "(57, T, 1)",
    color: "emerald",
    metrics: {
      eer: "1.15%",
      f1: "98.70%",
      accuracy: "98.90%",
    },
  },
]

interface ModelSelectorProps {
  selectedModelIds: string[]
  onToggleModel: (modelId: string) => void
  onSelectAll: (selectAll: boolean) => void
  isHighlighted?: boolean
  language: Language
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelIds,
  onToggleModel,
  onSelectAll,
  isHighlighted = false,
  language,
}) => {
  const t = translations[language]
  const isAllSelected = selectedModelIds.length === ALL_MODELS.length

  return (
    <div
      id="model-selector-widget"
      className={`rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/40"
          : "border-border/80"
      }`}
    >
      {/* Header Bar */}
      <div className="p-4 bg-secondary/30 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm sm:text-base text-foreground">
              {t.modelSectionTitle}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {selectedModelIds.length}/{ALL_MODELS.length} selected
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.modelSectionSubtitle}
          </p>
        </div>

        {/* Select All Checkbox */}
        <button
          type="button"
          onClick={() => onSelectAll(!isAllSelected)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-secondary/40 text-xs font-semibold text-foreground transition-all self-start sm:self-auto"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground" />
          )}
          <span>{t.selectAllModels}</span>
        </button>
      </div>

      {/* Flat Clean Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-border/60">
          <thead className="bg-secondary/20 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3 w-10 text-center"></th>
              <th className="px-4 py-3">{t.colModel}</th>
              <th className="px-4 py-3">{t.colExtractor}</th>
              <th className="px-4 py-3">{t.colArch}</th>
              <th className="px-4 py-3 text-right">{t.colEer}</th>
              <th className="px-4 py-3 text-right">{t.colF1}</th>
              <th className="px-4 py-3 text-right">{t.colAcc}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 bg-card/20">
            {ALL_MODELS.map((model) => {
              const isSelected = selectedModelIds.includes(model.id)
              return (
                <tr
                  key={model.id}
                  onClick={() => onToggleModel(model.id)}
                  className={`cursor-pointer transition-colors select-none ${
                    isSelected
                      ? "bg-primary/10 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                  }`}
                >
                  <td className="px-4 py-3.5 text-center">
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{model.name}</span>
                      {model.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {model.description}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-secondary/60 text-foreground text-[10px] font-mono">
                      {model.featureExtractor}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-muted-foreground">
                    {model.architecture}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-foreground">
                    {model.metrics.eer}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-primary">
                    {model.metrics.f1}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {model.metrics.accuracy}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
