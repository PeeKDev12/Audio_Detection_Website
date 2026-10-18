
import React from "react"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { type Language, translations } from "../lib/i18n"
import { TextAnimate } from "@/registry/magicui/text-animate"
import { AnimatedShinyText } from "@/registry/magicui/animated-shiny-text"
import {
  Terminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/registry/magicui/terminal"
import { AuroraText } from "@/registry/magicui/aurora-text"

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
    <section
      id="home"
      className="relative isolate overflow-hidden min-h-screen min-h-[100svh] flex flex-col justify-center py-12 md:py-16 scroll-mt-24 w-full"
    >


      {/* Existing hero content stays above the starfield */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2-Column Wide Viewport Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Main Hero Copy */}
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
                  <TextAnimate
                    animation="blurInUp"
                    by="character"
                    once
                    as="span"
                  >
                    {t.heroTitleLine1}
                  </TextAnimate>{" "}
                </>
              )}

              {t.heroTitleLine2 && (
                <>
                  <AuroraText>
                    {t.heroTitleLine2}
                  </AuroraText>{" "}
                </>
              )}

              {t.heroTitleLine3 && (
                <TextAnimate
                  animation="blurInUp"
                  by="character"
                  once
                  as="span"
                >
                  {t.heroTitleLine3}
                </TextAnimate>
              )}
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
              {t.heroDescription}
            </p>
          </motion.div>

          {/* Right Column: Interactive Terminal Graphic */}
          <motion.div
            key={`metrics-${language}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center items-end w-full"
          >
            <Terminal
              key={`terminal-${language}`}
              className="w-full"
            >
              <TypingAnimation className="text-primary font-mono font-bold text-xs sm:text-sm">
                {language === "th"
                  ? "> เริ่มต้นการทำงานระบบ AASIST core..."
                  : "> initializing AASIST acoustic core..."}
              </TypingAnimation>

              <AnimatedSpan
                delay={150}
                className="text-xs font-mono text-muted-foreground"
              >
                <span className="text-foreground font-semibold">
                  ✔ [{t.heroMetric1Label}]
                </span>
                : {t.heroMetric1Val}
              </AnimatedSpan>

              <AnimatedSpan
                delay={250}
                className="text-xs font-mono text-muted-foreground"
              >
                <span className="text-emerald-500 font-semibold">
                  ✔ [{t.heroMetric2Label}]
                </span>
                : {t.heroMetric2Val}
              </AnimatedSpan>

              <AnimatedSpan
                delay={350}
                className="text-xs font-mono text-muted-foreground"
              >
                <span className="text-indigo-400 font-semibold">
                  ✔ [{t.heroMetric3Label}]
                </span>
                : {t.heroMetric3Val}
              </AnimatedSpan>

              <AnimatedSpan
                delay={450}
                className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold"
              >
                <span>✔ [status]</span>
                :{" "}
                {language === "th"
                  ? "โมเดลพร้อมสำหรับการวิเคราะห์"
                  : "AASIST GAT Model Ready"}
              </AnimatedSpan>
            </Terminal>
          </motion.div>
        </div>

        {/* Center CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="pt-4 flex justify-center w-full"
        >
          <button
              type="button"
              onClick={scrollToDetection}
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-border bg-background px-7 py-3.5 text-sm sm:text-base font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <AnimatedShinyText className="inline-flex items-center justify-center font-semibold">
                <span>{t.heroCta}</span>
              </AnimatedShinyText>

              <ArrowDown
                className="h-4 w-4 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-y-0.5 group-hover:text-foreground"
                aria-hidden="true"
              />
            </button>
        </motion.div>
      </div>
    </section>
  )
}
