import React from "react"
import { type Language, translations } from "../lib/i18n"
import { MapPin, Mail, Globe } from "lucide-react"

interface FooterProps {
  language: Language
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language]

  return (
    <footer className="mt-20 border-t border-border bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-border/60">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-primary">
                NECTEC
              </span>
              <span className="text-xs font-semibold text-foreground">
                • Audio AI & Biometrics Lab
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.footerCol1Desc}
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <h4 className="font-bold text-foreground text-sm mb-2">{t.footerCol2Title}</h4>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <p className="font-bold text-foreground">
                {t.footerCredits}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Audio Deepfake & Synthetic Voice Detection Web Application
              </p>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <h4 className="font-bold text-foreground text-sm mb-2">{t.footerCol3Title}</h4>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Thailand Science Park, Pathum Thani, Thailand</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>contact@nectec.or.th</span>
            </p>
            <p className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>www.nectec.or.th</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} NECTEC • All Rights Reserved.</span>
          <span className="font-mono text-[11px] text-primary">FastAPI • PyTorch AASIST • React / Vite</span>
        </div>
      </div>
    </footer>
  )
}
