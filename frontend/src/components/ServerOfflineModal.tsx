import React, { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogMedia,
} from "./ui/alert-dialog"
import { WifiOff, RefreshCw } from "lucide-react"
import { type Language, translations } from "../lib/i18n"

interface ServerOfflineModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => Promise<void> | void
  language: Language
}

export const ServerOfflineModal: React.FC<ServerOfflineModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  language,
}) => {
  const [isRetrying, setIsRetrying] = useState(false)
  const t = translations[language]

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setTimeout(() => {
        setIsRetrying(false)
      }, 500)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <WifiOff className="w-5 h-5 text-amber-500" />
          </AlertDialogMedia>
          <div className="space-y-1">
            <AlertDialogTitle className="text-foreground">
              {t.serverOfflineTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.serverOfflineDesc}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {t.serverOfflineDismiss}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-amber-500 hover:bg-amber-600 text-white border-amber-600/30"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`}
            />
            <span>
              {isRetrying
                ? language === "th"
                  ? "กำลังตรวจสอบ..."
                  : "Checking..."
                : t.serverOfflineRetry}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
