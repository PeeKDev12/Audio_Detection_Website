import React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { type Language, translations } from "../lib/i18n"

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
    <section id="home" className="pt-12 pb-16 md:pt-20 md:pb-24 hairline-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Specification Top Index */}
        <motion.div
          key={`tag-${language}`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border pb-3"
        >
          <span>{t.heroTag}</span>
          <span>ARCH // RESNET34 + AASIST-GAT</span>
        </motion.div>

        {/* Stark Editorial Hero Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <motion.div
            key={`title-${language}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-8 space-y-2"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] uppercase">
              <div>{t.heroTitleLine1}</div>
              <div>{t.heroTitleLine2}</div>
              <div className="text-muted-foreground">{t.heroTitleLine3}</div>
            </h1>
          </motion.div>

          {/* Right Column / Description & CTA */}
          <motion.div
            key={`desc-${language}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-4 space-y-6 lg:border-l lg:border-border lg:pl-8"
          >
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t.heroDescription}
            </p>

            {/* Sharp Flat Monochromatic CTA */}
            <div>
              <button
                type="button"
                onClick={scrollToDetection}
                className="group w-full sm:w-auto inline-flex items-center justify-between gap-6 px-6 py-4 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted-foreground transition-colors"
              >
                <span>{t.heroCta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Technical Metric Spec Sheet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-border divide-y sm:divide-y-0 sm:divide-x divide-border font-mono">
          <div className="p-4 bg-surface/50">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              {t.heroMetric1Label}
            </span>
            <span className="text-sm sm:text-base font-bold text-foreground">
              {t.heroMetric1Val}
            </span>
          </div>

          <div className="p-4 bg-surface/50">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              {t.heroMetric2Label}
            </span>
            <span className="text-sm sm:text-base font-bold text-foreground">
              {t.heroMetric2Val}
            </span>
          </div>

          <div className="p-4 bg-surface/50">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              {t.heroMetric3Label}
            </span>
            <span className="text-sm sm:text-base font-bold text-foreground">
              {t.heroMetric3Val}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
