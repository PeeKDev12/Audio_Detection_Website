import React, { useState, useEffect } from "react"
import { Sun, Moon, Menu, X } from "lucide-react"
import { type Language, translations } from "../lib/i18n"

interface HeaderProps {
  darkMode: boolean
  setDarkMode: (val: boolean) => void
  language: Language
  setLanguage: (lang: Language) => void
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("home")
  const t = translations[language]

  // Scrollspy: Observe active visible section
  useEffect(() => {
    const sectionIds = ["home", "detection", "history", "models-guide"]
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

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
    handleScroll() // initial call

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navItems = [
    { id: "home", label: t.navHome },
    { id: "detection", label: t.navDetection },
    { id: "history", label: t.navHistory },
    { id: "models-guide", label: t.navModels },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md shadow-neu-sm dark:shadow-neu-sm-dark transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: NECTEC SVG Logo clearly visible */}
          <div
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="p-2 rounded-2xl bg-background dark:dark transition-all hover:scale-105">
              <img
                src="/Logo_of_NECTEC.svg"
                alt="NECTEC Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          {/* Center: Desktop Navigation with Scrollspy Active Glow */}
          <nav className="hidden lg:flex items-center space-x-2 text-xs font-semibold">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-xl transition-colors duration-200 ${
                    isActive
                      ? "text-black dark:text-white font-bold"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {item.label}
                </button> 
              )
            })}
          </nav>

          {/* Right: Bilingual Switch & Theme Switch */}
          <div className="flex items-center gap-3">
            {/* Bilingual Neumorphic Switch */}
            <div className="flex items-center p-1 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark text-xs select-none">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  language === "en"
                    ? "bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("th")}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  language === "th"
                    ? "bg-background shadow-neu-flat dark:shadow-neu-flat-dark text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                TH
              </button>
            </div>

            {/* Dark/Light Neumorphic Switch */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-foreground hover:text-primary transition-all duration-200"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Active Indicator */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/60 space-y-2 text-sm font-medium animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left py-2.5 px-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-secondary/40 text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
