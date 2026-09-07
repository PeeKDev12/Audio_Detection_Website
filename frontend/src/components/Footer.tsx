import React from "react"
import { ShieldCheck, Mail, MapPin, Globe } from "lucide-react"

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-border/60 bg-background/80 shadow-neu-sm dark:shadow-neu-sm-dark py-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-border/40">
          {/* NECTEC & Project Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                NECTEC
              </span>
              <span className="text-xs font-semibold text-foreground">
                &bull; Audio AI & Biometrics Lab
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Research and development in automatic speaker verification (ASV), synthetic speech countermeasure detection, and spectro-temporal graph attention networks.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <h4 className="font-bold text-foreground text-sm mb-2">Contact & Institutional Info</h4>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>National Electronics and Computer Technology Center (NECTEC), Thailand</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>contact@nectec.or.th</span>
            </p>
            <p className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>www.nectec.or.th</span>
            </p>
          </div>

          {/* Internship Acknowledgment */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <h4 className="font-bold text-foreground text-sm mb-2">Project Credits</h4>
            <div className="p-4 rounded-2xl bg-background shadow-neu-inset dark:shadow-neu-inset-dark">
              <p className="font-bold text-foreground">
                Developed by [Your Name] / NECTEC Internship 2026
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Audio Anti-Spoofing & Deepfake Detection Web Application
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <p>&copy; 2026 NECTEC &bull; All Rights Reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-cyan-600 dark:text-cyan-400">FastAPI Async</span>
            <span>&bull;</span>
            <span className="text-indigo-600 dark:text-indigo-400">PyTorch AASIST</span>
            <span>&bull;</span>
            <span className="text-blue-600 dark:text-blue-400">React / Vite Neumorphism</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
