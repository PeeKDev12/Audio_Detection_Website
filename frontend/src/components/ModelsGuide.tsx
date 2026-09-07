import React from "react"
import { Cpu, Sparkles, Layers, Waves, CheckCircle2, ExternalLink } from "lucide-react"
import { type Language, translations } from "../lib/i18n"

interface ModelsGuideProps {
  language: Language
}

export const ModelsGuide: React.FC<ModelsGuideProps> = ({ language }) => {
  const t = translations[language]

  return (
    <section id="models-guide" className="py-12 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Cpu className="w-6 h-6 text-primary" />
          <span>{t.guideTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {t.guideSubtitle}
        </p>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ResNet34 Monograph */}
        <div className="rounded-3xl p-6 sm:p-8 bg-background shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-primary">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                {t.resnetTitle}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">ResNet-34 Residual Network</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.resnetDesc}
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><strong>PA (Physical Access):</strong> Detects acoustic replay spoofing in physical acoustic environments.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><strong>LA (Logical Access):</strong> Detects text-to-speech (TTS) synthesis and voice conversion (VC).</span>
            </li>
          </ul>
        </div>

        {/* AASIST Monograph */}
        <div className="rounded-3xl p-6 sm:p-8 bg-background shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-indigo-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                {t.aasistTitle}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">PyTorch Graph Attention Network</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.aasistDesc}
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong>16 kHz Native Resampling:</strong> Decodes and processes raw audio waveforms directly.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong>Heterogeneous Graph:</strong> Models spectral nodes and temporal nodes simultaneously.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature Extractors */}
      <div className="rounded-3xl p-6 sm:p-8 bg-background shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          <span>Acoustic Feature Extraction Engineering</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark space-y-1.5">
            <h4 className="font-bold text-sm text-primary">{t.lfccTitle}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.lfccDesc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark space-y-1.5">
            <h4 className="font-bold text-sm text-indigo-500">{t.mfccTitle}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.mfccDesc}
            </p>
          </div>
        </div>
      </div>

      {/* AASIST Research Repository Reference */}
      <div className="flex justify-center pt-2">
        <a
          href="https://github.com/clovaai/aasist"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark text-xs font-semibold text-foreground hover:text-primary transition-all duration-200 border border-border/40"
        >
          <svg className="w-4 h-4 fill-current text-foreground" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>Based on research by clovaai/aasist</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
        </a>
      </div>
    </section>
  )
}
