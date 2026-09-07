import React from "react"
import { ShieldAlert, Activity, Radio, Cpu, History, Sparkles } from "lucide-react"

interface NavbarProps {
  activeTab: "detector" | "history" | "models" | "about"
  setActiveTab: (tab: "detector" | "history" | "models" | "about") => void
  backendOnline: boolean
  modelsCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  backendOnline,
  modelsCount,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("detector")}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">ASV & AASIST</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/50 text-cyan-400 font-mono">
                  v2.0 AI
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Audio Deepfake & Synthetic Speech Detection System
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab("detector")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "detector"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Detector</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab("models")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "models"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Model Architectures</span>
              <span className="sm:hidden">Models</span>
            </button>
          </nav>

          {/* Backend Status Indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border ${
                backendOnline
                  ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-400"
                  : "bg-red-950/60 border-red-700/60 text-red-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? "bg-emerald-400 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="hidden md:inline">
                {backendOnline ? `Backend Live (${modelsCount} Models)` : "Backend Offline"}
              </span>
              <span className="md:hidden">{backendOnline ? "Live" : "Offline"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
