import React from "react"
import { type Language, translations } from "../lib/i18n"

interface FooterProps {
  language: Language
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language]

  return (
    <footer className="hairline-t bg-background py-14 font-mono text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-border">
          {/* Col 1 */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-foreground block font-bold">
              {t.footerCol1Title}
            </span>
            <p className="text-[11px] font-sans leading-relaxed text-muted-foreground">
              {t.footerCol1Desc}
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-foreground block font-bold">
              {t.footerCol2Title}
            </span>
            <p className="text-[11px] text-foreground font-bold">
              {t.footerCredits}
            </p>
            <p className="text-[10px] text-muted-foreground">
              AASIST DEEPFAKE AUDIO RESEARCH
            </p>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-foreground block font-bold">
              {t.footerCol3Title}
            </span>
            <p className="text-[11px] text-muted-foreground">
              {t.footerSpecs}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-wider">
          <span>&copy; 2026 NECTEC // ALL RIGHTS RESERVED.</span>
          <span>DIE NEUE TYPOGRAPHIE &bull; SWISS MINIMALIST SYSTEM</span>
        </div>
      </div>
    </footer>
  )
}
