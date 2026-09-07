import React from "react"
import { type Language, translations } from "../lib/i18n"

interface ModelsGuideProps {
  language: Language
}

export const ModelsGuide: React.FC<ModelsGuideProps> = ({ language }) => {
  const t = translations[language]

  return (
    <section id="models-guide" className="py-16 space-y-10 hairline-t">
      <div className="font-mono">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
          [TECHNICAL_SPECIFICATION_MONOGRAPH]
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase">
          {t.guideTitle}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          {t.guideSubtitle}
        </p>
      </div>

      {/* 2x2 Architectural Monograph Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-border divide-y md:divide-y-0 md:divide-x divide-border">
        {/* ResNet34 Monograph */}
        <div className="p-6 sm:p-8 bg-background space-y-4">
          <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground border-b border-border pb-2">
            <span>RESNET-34 // PA & LA</span>
            <span>BACKBONE: RESIDUAL</span>
          </div>
          <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
            {t.resnetTitle}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.resnetDesc}
          </p>
          <div className="pt-2 font-mono text-[11px] text-muted-foreground space-y-1">
            <div>&bull; INPUT TENSOR: (57, 600, 1) / (57, 746, 1)</div>
            <div>&bull; ASVSPOOF BENCHMARK: MIN-TDCF 0.081</div>
          </div>
        </div>

        {/* AASIST Monograph */}
        <div className="p-6 sm:p-8 bg-background space-y-4">
          <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground border-b border-border pb-2">
            <span>AASIST // PYTORCH GRAPH</span>
            <span>BACKBONE: GAT</span>
          </div>
          <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
            {t.aasistTitle}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.aasistDesc}
          </p>
          <div className="pt-2 font-mono text-[11px] text-muted-foreground space-y-1">
            <div>&bull; RAW AUDIO INPUT: 16,000 HZ 1D TENSOR</div>
            <div>&bull; GRAPH TOPOLOGY: SPECTRO-TEMPORAL DUAL ATTENTION</div>
          </div>
        </div>
      </div>

      {/* Feature Extractors Specification Monograph */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-border divide-y md:divide-y-0 md:divide-x divide-border">
        {/* LFCC */}
        <div className="p-6 sm:p-8 bg-surface/40 space-y-3">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">
            FEATURE_EXTRACTOR // 01
          </span>
          <h4 className="text-sm font-bold text-foreground uppercase">
            {t.lfccTitle}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            {t.lfccDesc}
          </p>
        </div>

        {/* MFCC */}
        <div className="p-6 sm:p-8 bg-surface/40 space-y-3">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">
            FEATURE_EXTRACTOR // 02
          </span>
          <h4 className="text-sm font-bold text-foreground uppercase">
            {t.mfccTitle}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            {t.mfccDesc}
          </p>
        </div>
      </div>
    </section>
  )
}
