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
    <section id="home" className="pt-10 pb-14 md:pt-16 md:pb-20">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Main Heading without herotag */}
        <motion.div
          key={`title-${language}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
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
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
            {t.heroDescription}
          </p>
        </motion.div>

        {/* Technical Metric Spec Cards */}
        <motion.div
          key={`metrics-${language}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 max-w-4xl mx-auto"
        >
          <div className="p-4 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Waves className="w-3.5 h-3.5 text-primary" />
              <span>{t.heroMetric1Label}</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-foreground">
              {t.heroMetric1Val}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.heroMetric2Label}</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-foreground">
              {t.heroMetric2Val}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.heroMetric3Label}</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-foreground">
              {t.heroMetric3Val}
            </span>
          </div>
        </motion.div>

        {/* Prominent CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="pt-2 flex justify-center"
        >
          <button
            type="button"
            onClick={scrollToDetection}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-background text-base sm:text-lg font-bold text-foreground shadow-neu-lg dark:shadow-neu-lg-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark active:scale-[0.98] transition-all duration-200 border border-border/50 hover:cursor-pointer"
          >
            <span className="text-primary text-base">✨</span>
            <AnimatedShinyText className="inline-flex items-center justify-center font-extrabold text-foreground transition ease-out">
              <span>{t.heroCta}</span>
            </AnimatedShinyText>
            <div className="p-1.5 rounded-full bg-primary/10 text-primary shadow-neu-sm dark:shadow-neu-sm-dark group-hover:translate-y-0.5 transition-transform">
              <ArrowDown className="w-4 h-4" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
