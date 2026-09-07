import React from "react"
import { Cpu, Waves, Activity, Sparkles, Layers, ShieldCheck, CheckCircle2 } from "lucide-react"

export const ModelsGuide: React.FC = () => {
  return (
    <section id="models-guide" className="py-12 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          <span>Model Architectures & Anti-Spoofing Countermeasures</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
          In-depth technical breakdown of the neural network backbones, acoustic feature extractors, and loss functions powering our deepfake detection suite.
        </p>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ResNet34 Section */}
        <div className="bg-background rounded-3xl p-6 shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-cyan-600 dark:text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">ResNet-34 Classifiers (PA & LA)</h3>
              <p className="text-xs text-muted-foreground font-mono">34-layer Deep Residual Neural Networks</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ResNet-34 applies identity shortcut connections across residual blocks to prevent gradient dissipation while learning high-dimensional cepstral representations.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <span><strong className="text-foreground">PA (Physical Access):</strong> Detects acoustic replay spoofing in physical spaces.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <span><strong className="text-foreground">LA (Logical Access):</strong> Detects generative TTS and voice conversion algorithms.</span>
            </li>
          </ul>
        </div>

        {/* AASIST Section */}
        <div className="bg-background rounded-3xl p-6 shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">AASIST Graph Attention (PyTorch)</h3>
              <p className="text-xs text-muted-foreground font-mono">End-to-End Raw Waveform Modeling</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Audio Anti-Spoofing using Integrated Spectro-Temporal graph attention networks. Operates directly on raw audio waveforms to preserve subtle phase cues.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong className="text-foreground">16 kHz Native Resampling:</strong> Decodes and unifies all sample rates to 16,000 Hz.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Heterogeneous Attention:</strong> Couples spectral nodes with temporal nodes simultaneously.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature Extractors Comparison */}
      <div className="bg-background rounded-3xl p-6 shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Waves className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>Feature Extraction Engineering</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark space-y-1.5">
            <h4 className="font-bold text-sm text-cyan-600 dark:text-cyan-400">LFCC (Linear Frequency Cepstral Coefficients)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Linearly spaced filterbanks retain high-frequency artifacts often discarded by perceptual scales, making them ideal for vocoder boundary inspection.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark space-y-1.5">
            <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">MFCC (Mel-Frequency Cepstral Coefficients)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Logarithmic Mel-scale filterbanks paired with 20% head/tail margin concatenation to detect onset/offset spectral anomalies in synthetic speech.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
