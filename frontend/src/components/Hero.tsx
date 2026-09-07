import React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Sparkles, ArrowDown, Activity, Waves, Cpu } from "lucide-react"

export const Hero: React.FC = () => {
  const scrollToDetection = () => {
    const el = document.getElementById("detection")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="home" className="pt-8 pb-16 md:pt-14 md:pb-24">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background shadow-neu-inset dark:shadow-neu-inset-dark text-cyan-600 dark:text-cyan-400 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AASIST &bull; End-to-End Audio Anti-Spoofing</span>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            State-of-the-Art{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Deepfake Audio
            </span>{" "}
            Detection
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Protect acoustic biometric authentication against generative AI voice synthesis, neural vocoders, and replay spoofing attacks using integrated spectro-temporal graph attention networks.
          </p>
        </motion.div>

        {/* Neumorphic Feature Pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-xs font-medium text-foreground">
            <Waves className="w-4 h-4 text-cyan-500" />
            <span>16 kHz Raw Waveform Processing</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-xs font-medium text-foreground">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>AASIST Graph Attention Architecture</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-xs font-medium text-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Real-time Multi-Model Ensemble</span>
          </div>
        </motion.div>

        {/* Large Prominent Neumorphic CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-4"
        >
          <button
            onClick={scrollToDetection}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-3xl bg-background text-base sm:text-lg font-bold text-foreground shadow-neu-lg dark:shadow-neu-lg-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark active:scale-[0.98] transition-all duration-300 border border-border/40"
          >
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              Start Detection
            </span>
            <div className="p-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-neu-sm dark:shadow-neu-sm-dark group-hover:translate-y-0.5 transition-transform">
              <ArrowDown className="w-4 h-4" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
