import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Language, translations } from "../lib/i18n"

interface Waypoint {
  id: string
  number: string
  label: string
}

interface FloatingWaypointRailProps {
  language: Language
}

export const FloatingWaypointRail: React.FC<FloatingWaypointRailProps> = ({ language }) => {
  const [activeSection, setActiveSection] = useState<string>("home")
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const t = translations[language]

  const waypoints: Waypoint[] = [
    { id: "home", number: "01", label: t.navHome },
    { id: "detection", number: "02", label: t.navDetection },
    { id: "history", number: "03", label: t.navHistory },
    { id: "models-guide", number: "04", label: t.navModels },
  ]

  // ScrollSpy: dynamically track visible section in viewport
  useEffect(() => {
    const sectionIds = waypoints.map((w) => w.id)

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i]
        const element = document.getElementById(id)
        if (element) {
          const top = element.offsetTop
          if (scrollPosition >= top) {
            setActiveSection(id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [language])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Calculate active index to dynamically highlight the connecting rail line
  const activeIndex = waypoints.findIndex((w) => w.id === activeSection)
  const progressPercent =
    waypoints.length > 1
      ? Math.max(0, (Math.max(0, activeIndex) / (waypoints.length - 1)) * 100)
      : 0

  return (
    <nav
      aria-label="Waypoint Rail Navigation"
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center bg-background/80 backdrop-blur-md border border-border rounded-2xl p-2.5 py-4 select-none"
    >
      <div className="relative flex flex-col items-center gap-7">
        {/* Vertical Connecting Track Line */}
        <div className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-0.5 bg-border -z-10">
          {/* Active Progress Fill */}
          <motion.div
            className="w-full bg-primary"
            initial={{ height: "0%" }}
            animate={{ height: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Waypoints */}
        {waypoints.map((item, idx) => {
          const isActive = activeSection === item.id
          const isHovered = hoveredSection === item.id

          return (
            <div
              key={item.id}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredSection(item.id)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {/* Tooltip Popup (Left Side) */}
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.div
                    initial={{ opacity: 0, x: 8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-full mr-3.5 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap pointer-events-none ${
                      isActive
                        ? "bg-background text-foreground border-primary/40"
                        : "bg-background/90 text-muted-foreground border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-primary">{item.number}</span>
                      <span>{item.label}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Waypoint Step Button */}
              <button
                type="button"
                onClick={() => scrollToSection(item.id)}
                aria-label={`Scroll to ${item.label}`}
                className={`group relative flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground scale-105 border border-primary ring-2 ring-primary/20"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 hover:bg-muted"
                }`}
              >
                <span>{item.number}</span>
              </button>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
