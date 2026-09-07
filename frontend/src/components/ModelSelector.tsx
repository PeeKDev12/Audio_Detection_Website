import React from "react"
import { CheckSquare, Square } from "lucide-react"
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
    badge: "DEFAULT BENCHMARK",
    color: "zinc",
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
    color: "zinc",
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
    badge: "RECOMMENDED PA",
    color: "zinc",
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
    badge: "RECOMMENDED LA",
    color: "zinc",
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
    color: "zinc",
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
    color: "zinc",
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
    color: "zinc",
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
      className={`border transition-all duration-300 ${
        isHighlighted
          ? "border-foreground ring-2 ring-foreground"
          : "border-border"
      }`}
    >
      {/* Logbook Header Bar */}
      <div className="p-4 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
              {t.modelSectionTitle}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              [{selectedModelIds.length}/{ALL_MODELS.length} ACTIVE]
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">
            {t.modelSectionSubtitle}
          </p>
        </div>

        {/* Select All Checkbox */}
        <button
          type="button"
          onClick={() => onSelectAll(!isAllSelected)}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-background hover:bg-surface font-mono text-xs text-foreground transition-colors self-start sm:self-auto"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-foreground" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground" />
          )}
          <span>{t.selectAllModels}</span>
        </button>
      </div>

      {/* Strict Tabular Engineering Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs divide-y divide-border">
          <thead className="bg-surface/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 w-12 text-center">SEL</th>
              <th className="px-4 py-2.5">{t.colModel}</th>
              <th className="px-4 py-2.5">{t.colExtractor}</th>
              <th className="px-4 py-2.5">{t.colArch}</th>
              <th className="px-4 py-2.5 text-right">{t.colEer}</th>
              <th className="px-4 py-2.5 text-right">{t.colF1}</th>
              <th className="px-4 py-2.5 text-right">{t.colAcc}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {ALL_MODELS.map((model, idx) => {
              const isSelected = selectedModelIds.includes(model.id)
              return (
                <tr
                  key={model.id}
                  onClick={() => onToggleModel(model.id)}
                  className={`cursor-pointer transition-colors select-none ${
                    isSelected
                      ? "bg-surface font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-surface/40 hover:text-foreground"
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-foreground cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{model.name}</span>
                      {model.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 border border-border text-muted-foreground uppercase">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-sans text-muted-foreground mt-0.5 line-clamp-1">
                      {model.description}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 border border-border bg-background text-[10px]">
                      {model.featureExtractor}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">
                    {model.architecture}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {model.metrics.eer}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {model.metrics.f1}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
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
