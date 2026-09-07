import React, { useState } from "react"
import { Sun, Moon, Menu, X, ShieldAlert, Cpu, History, Radio, Home } from "lucide-react"

interface HeaderProps {
  darkMode: boolean
  setDarkMode: (val: boolean) => void
  backendOnline: boolean
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  backendOnline,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60 shadow-neu-sm dark:shadow-neu-sm-dark transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: NECTEC Logo Placeholder & Branding */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => scrollToSection("home")}
          >
            {/* NECTEC Brand Pill */}
            <div className="flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark group-hover:shadow-neu-inset dark:group-hover:shadow-neu-inset-dark transition-all duration-300">
              <img src="/Logo_of_NECTEC.svg" alt="NECTEC Logo" className="h-10 w-auto drop-shadow-sm" />
            </div>
          </div>

          {/* Center/Right: Desktop Navigation & Smooth Scroll */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollToSection("home")}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => scrollToSection("detection")}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark transition-all flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Detection</span>
            </button>

            <button
              onClick={() => scrollToSection("history")}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark transition-all flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => scrollToSection("models-guide")}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark transition-all flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Architectures</span>
            </button>
          </nav>

          {/* Right: Theme Switcher & Status & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Live Backend Badge */}
            <div
              className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono shadow-neu-inset dark:shadow-neu-inset-dark ${
                backendOnline
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span>{backendOnline ? "API Live" : "Offline"}</span>
            </div>

            {/* Light / Dark Mode Toggle (Neumorphic Switch) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-foreground hover:text-cyan-500 transition-all duration-200"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark active:shadow-neu-pressed dark:active:shadow-neu-pressed-dark text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => scrollToSection("home")}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/40 flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-cyan-500" />
              <span>Home</span>
            </button>
            <button
              onClick={() => scrollToSection("detection")}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/40 flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-cyan-500" />
              <span>Audio Detection</span>
            </button>
            <button
              onClick={() => scrollToSection("history")}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/40 flex items-center gap-2"
            >
              <History className="w-4 h-4 text-cyan-500" />
              <span>Detection History</span>
            </button>
            <button
              onClick={() => scrollToSection("models-guide")}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/40 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>Model Architectures</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
