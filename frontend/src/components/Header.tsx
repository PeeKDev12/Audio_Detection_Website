import React, { useState } from "react"
import { motion } from "framer-motion"
import { Sun, Moon, Menu, X } from "lucide-react"
import { type Language, translations } from "../lib/i18n"

interface HeaderProps {
  darkMode: boolean
  setDarkMode: (val: boolean) => void
  language: Language
  setLanguage: (lang: Language) => void
  backendOnline: boolean
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  backendOnline,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = translations[language]

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-none hairline-b transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: NECTEC Architectural Monogram */}
          <div
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="px-2.5 py-1 bg-foreground text-background font-mono font-bold text-xs uppercase tracking-widest transition-transform group-hover:scale-95">
              NECTEC
            </div>
            <div className="hidden sm:block">
              <span className="font-mono text-xs font-bold tracking-tight text-foreground uppercase">
                AASIST // MONOGRAPH
              </span>
              <span className="text-[10px] font-mono text-muted-foreground ml-2">
                REV.2026
              </span>
            </div>
          </div>

          {/* Center/Desktop Navigation (Monospaced Index style) */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono tracking-wider">
            <button
              onClick={() => scrollToSection("home")}
              className="text-muted-foreground hover:text-foreground hover:underline underline-offset-8 transition-colors"
            >
              {t.navHome}
            </button>
            <button
              onClick={() => scrollToSection("detection")}
              className="text-muted-foreground hover:text-foreground hover:underline underline-offset-8 transition-colors"
            >
              {t.navDetection}
            </button>
            <button
              onClick={() => scrollToSection("history")}
              className="text-muted-foreground hover:text-foreground hover:underline underline-offset-8 transition-colors"
            >
              {t.navHistory}
            </button>
            <button
              onClick={() => scrollToSection("models-guide")}
              className="text-muted-foreground hover:text-foreground hover:underline underline-offset-8 transition-colors"
            >
              {t.navModels}
            </button>
          </nav>

          {/* Right: Bilingual Mechanical Switch & Theme Switch */}
          <div className="flex items-center gap-3">
            {/* Backend API Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted-foreground border border-border px-2 py-1">
              <span
                className={`w-1.5 h-1.5 ${
                  backendOnline ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span>{backendOnline ? t.statusOnline : t.statusOffline}</span>
            </div>

            {/* Bilingual Mechanical Physical Toggle */}
            <div className="flex items-center border border-border p-0.5 bg-surface font-mono text-xs select-none">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 text-[11px] font-bold tracking-wider transition-all ${
                  language === "en"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("th")}
                className={`px-2 py-1 text-[11px] font-bold tracking-wider transition-all ${
                  language === "th"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                TH
              </button>
            </div>

            {/* Dark/Light Minimal Switch */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 border border-border hover:bg-surface text-foreground transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 border border-border hover:bg-surface text-foreground"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 hairline-t space-y-3 font-mono text-xs">
            <button
              onClick={() => scrollToSection("home")}
              className="block w-full text-left py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-surface"
            >
              {t.navHome}
            </button>
            <button
              onClick={() => scrollToSection("detection")}
              className="block w-full text-left py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-surface"
            >
              {t.navDetection}
            </button>
            <button
              onClick={() => scrollToSection("history")}
              className="block w-full text-left py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-surface"
            >
              {t.navHistory}
            </button>
            <button
              onClick={() => scrollToSection("models-guide")}
              className="block w-full text-left py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-surface"
            >
              {t.navModels}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
