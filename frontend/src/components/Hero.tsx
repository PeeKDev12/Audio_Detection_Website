import React from "react"
import { motion } from "framer-motion"
import { ArrowDown, ShieldCheck, Waves, Cpu } from "lucide-react"
import { type Language, translations } from "../lib/i18n"
import { TextAnimate } from "@/registry/magicui/text-animate"
import { AnimatedShinyText } from "@/registry/magicui/animated-shiny-text"

interface HeroProps {
  language: Language
}

export const Hero: React.FC<HeroProps> = ({ language }) => {
  const t = translations[language]

  const scrollToDetection = () => {
    const el = document.getElementById("detection")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="home" className="pt-8 pb-12 md:pt-14 md:pb-16 scroll-mt-24">
      <div className="w-full max-w-7xl mx-auto space-y-12">
        {/* 2-Column Wide Viewport Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Main Hero Copy (Strictly Left-Aligned) */}
          <motion.div
            key={`title-${language}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 xl:col-span-8 text-left space-y-5"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {t.heroTitleLine1 && (
                <>
                  <TextAnimate animation="blurInUp" by="character" once as="span">
                    {t.heroTitleLine1}
                  </TextAnimate>{" "}
                </>
              )}
              {t.heroTitleLine2 && (
                <>
                  <TextAnimate
                    animation="blurInUp"
                    by="character"
                    once
                    as="span"
                    className="text-primary"
                  >
                    {t.heroTitleLine2}
                  </TextAnimate>{" "}
                </>
              )}
              {t.heroTitleLine3 && (
                <TextAnimate animation="blurInUp" by="character" once as="span">
                  {t.heroTitleLine3}
                </TextAnimate>
              )}
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
              {t.heroDescription}
            </p>
          </motion.div>

          {/* Right Column: Vertical Technical Specifications List (Strictly Right-Aligned) */}
          <motion.div
            key={`metrics-${language}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center space-y-3.5"
          >
            {/* Spec 1: Sampling Frequency */}
            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between gap-4 hover:border-primary/40 hover:bg-muted/30 transition-all">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Waves className="w-4 h-4" />
                </div>
                <span>{t.heroMetric1Label}</span>
              </div>
              <span className="text-sm sm:text-base font-mono font-bold text-foreground text-right">
                {t.heroMetric1Val}
              </span>
            </div>

            {/* Spec 2: Min-tDCF Benchmark */}
            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between gap-4 hover:border-emerald-500/40 hover:bg-muted/30 transition-all">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>{t.heroMetric2Label}</span>
              </div>
              <span className="text-sm sm:text-base font-mono font-bold text-foreground text-right">
                {t.heroMetric2Val}
              </span>
            </div>

            {/* Spec 3: Model Graph Architecture */}
            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between gap-4 hover:border-indigo-500/40 hover:bg-muted/30 transition-all">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Cpu className="w-4 h-4" />
                </div>
                <span>{t.heroMetric3Label}</span>
              </div>
              <span className="text-sm sm:text-base font-mono font-bold text-foreground text-right">
                {t.heroMetric3Val}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Center CTA Button (Bridging Both Columns) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="pt-4 flex justify-center w-full"
        >
          <button
            type="button"
            onClick={scrollToDetection}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-background text-base sm:text-lg font-bold text-foreground border border-border hover:bg-muted active:scale-[0.98] transition-all duration-200 hover:cursor-pointer"
          >
            <span className="text-primary text-base">✨</span>
            <AnimatedShinyText className="inline-flex items-center justify-center font-extrabold text-foreground transition ease-out">
              <span>{t.heroCta}</span>
            </AnimatedShinyText>
            <div className="p-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:translate-y-0.5 transition-transform">
              <ArrowDown className="w-4 h-4" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
