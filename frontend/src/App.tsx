import React, { useState, useEffect, useRef } from "react"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { ModelSelector, ALL_MODELS } from "./components/ModelSelector"
import { FileDropzone } from "./components/FileDropzone"
import { FauxProgressBar } from "./components/FauxProgressBar"
import { ResultsDisplay } from "./components/ResultsDisplay"
import { HistoryView } from "./components/HistoryView"
import { ModelsGuide } from "./components/ModelsGuide"
import { Footer } from "./components/Footer"
import { FirstRunModal } from "./components/FirstRunModal"
import { ServerOfflineModal } from "./components/ServerOfflineModal"
import { SmoothCursor } from "./components/SmoothCursor"
import { apiService } from "./services/api"
import type { PredictionResult } from "./types"
import { type Language, translations } from "./lib/i18n"
import { AlertCircle } from "lucide-react"

export function App() {
  // Light mode is default (false), Dark mode is soft matte (true)
  const [darkMode, setDarkMode] = useState(false)
  
  // Bilingual state: "en" | "th"
  const [language, setLanguage] = useState<Language>("en")
  const t = translations[language]

  // Model selection: Default is ONLY LFCC_VAJA (LFCC-VAJA+Genuine)
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(["LFCC_VAJA"])
  
  // Audio files queue & waveform selection
  const [files, setFiles] = useState<File[]>([])
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null)
  
  // Analysis & Progress States
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false)
  const [results, setResults] = useState<PredictionResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // First-Run Interception State
  const [hasConfirmedFirstRun, setHasConfirmedFirstRun] = useState(false)
  const [isFirstRunModalOpen, setIsFirstRunModalOpen] = useState(false)
  const [isModelSelectorHighlighted, setIsModelSelectorHighlighted] = useState(false)

  // Backend Health Ping & Server Offline Modal State
  const [backendOnline, setBackendOnline] = useState(true)
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false)
  const hasShownInitialOfflineAlertRef = useRef(false)

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Backend Health Check
  const checkStatus = async (isInitialEntry: boolean = false) => {
    try {
      const health = await apiService.checkHealth()
      if (health.ok) {
        setBackendOnline(true)
        setIsOfflineModalOpen(false)
      } else {
        setBackendOnline(false)
        if (isInitialEntry && !hasShownInitialOfflineAlertRef.current) {
          hasShownInitialOfflineAlertRef.current = true
          setIsOfflineModalOpen(true)
        }
      }
    } catch (err) {
      setBackendOnline(false)
      if (isInitialEntry && !hasShownInitialOfflineAlertRef.current) {
        hasShownInitialOfflineAlertRef.current = true
        setIsOfflineModalOpen(true)
      }
    }
  }

  // Manual retry handler (for user clicking "Retry Connection" inside the modal)
  const handleManualRetry = async () => {
    try {
      const health = await apiService.checkHealth()
      if (health.ok) {
        setBackendOnline(true)
        setIsOfflineModalOpen(false)
      } else {
        setBackendOnline(false)
      }
    } catch (err) {
      setBackendOnline(false)
    }
  }

  useEffect(() => {
    // Only show the offline modal once on initial entry
    checkStatus(true)
    const interval = setInterval(() => {
      checkStatus(false)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // File Queue Handlers
  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    if (!selectedPreviewFile && newFiles.length > 0) {
      setSelectedPreviewFile(newFiles[0])
    }
  }

  const handleFileRemoved = (index: number) => {
    const target = files[index]
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    if (selectedPreviewFile === target) {
      setSelectedPreviewFile(updated.length > 0 ? updated[0] : null)
    }
  }

  const handleClearAll = () => {
    setFiles([])
    setSelectedPreviewFile(null)
    setResults([])
    setErrorMessage(null)
    setIsAnalysisComplete(false)
  }

  // Model Selection Handlers
  const handleToggleModel = (modelId: string) => {
    setIsModelSelectorHighlighted(false)
    setSelectedModelIds((prev) => {
      if (prev.includes(modelId)) {
        if (prev.length === 1) return prev
        return prev.filter((id) => id !== modelId)
      } else {
        return [...prev, modelId]
      }
    })
  }

  const handleSelectAllModels = (selectAll: boolean) => {
    setIsModelSelectorHighlighted(false)
    if (selectAll) {
      setSelectedModelIds(ALL_MODELS.map((m) => m.id))
    } else {
      setSelectedModelIds(["LFCC_VAJA"])
    }
  }

  // First-Run Interception Trigger
  const handleRunClick = () => {
    if (files.length === 0) return

    if (!backendOnline) {
      setIsOfflineModalOpen(true)
      return
    }

    if (!hasConfirmedFirstRun) {
      setIsFirstRunModalOpen(true)
      setIsModelSelectorHighlighted(true)
      const el = document.getElementById("model-selector-widget")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    executeInference()
  }

  const handleConfirmAndRun = () => {
    setHasConfirmedFirstRun(true)
    setIsFirstRunModalOpen(false)
    setIsModelSelectorHighlighted(false)
    executeInference()
  }

  const handleExploreModels = () => {
    setIsFirstRunModalOpen(false)
    const el = document.getElementById("model-selector-widget")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Execute Asynchronous Inference across all selected models
  const executeInference = async () => {
    if (files.length === 0 || selectedModelIds.length === 0) return
    setIsAnalyzing(true)
    setIsAnalysisComplete(false)
    setErrorMessage(null)
    setResults([])

    try {
      const selectedModels = ALL_MODELS.filter((m) => selectedModelIds.includes(m.id))
      const combinedResults: PredictionResult[] = []

      for (const model of selectedModels) {
        const batchRes = await apiService.predictBatch(model.endpoint, files)
        combinedResults.push(...batchRes)
      }

      setIsAnalysisComplete(true)
      setTimeout(() => {
        setResults(combinedResults)
        setIsAnalyzing(false)
      }, 400)
    } catch (err: any) {
      console.error("Inference execution failed:", err)
      setIsAnalyzing(false)
      setIsAnalysisComplete(false)
      setBackendOnline(false)
      setIsOfflineModalOpen(true)
      setErrorMessage(
        err.response?.data?.detail ||
          (language === "th"
            ? "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ประมวลผลได้ กรุณาติดต่อผู้ดูแลระบบหรือนักพัฒนา"
            : "The detection server is currently unreachable. Please contact the administrator or developer.")
      )
    }
  }

  const selectedModelNames = ALL_MODELS.filter((m) => selectedModelIds.includes(m.id))
    .map((m) => m.name)
    .join(", ")

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
      {/* Magic UI Smooth Cursor */}
      <SmoothCursor />

      {/* First Run Interception Modal */}
      <FirstRunModal
        isOpen={isFirstRunModalOpen}
        onConfirmAndRun={handleConfirmAndRun}
        onExploreModels={handleExploreModels}
        language={language}
      />

      {/* Server Offline Alert Dialog */}
      <ServerOfflineModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onRetry={handleManualRetry}
        language={language}
      />

      {/* Sticky Clean Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Offline Warning Strip (Client Friendly) */}
        {!backendOnline && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {language === "th"
                  ? "ระบบเซิร์ฟเวอร์ออฟไลน์ — ไม่สามารถเชื่อมต่อระบบประมวลผลได้ในขณะนี้"
                  : "Server Offline — The audio inference service is currently unreachable."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOfflineModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-semibold transition-all shrink-0 cursor-pointer"
            >
              {language === "th" ? "ดูรายละเอียด" : "View Details"}
            </button>
          </div>
        )}

        {/* Global Error Strip */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs uppercase font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Hero Section */}
        <Hero language={language} />

        {/* 2. Asymmetrical Scrollytelling Detection Section */}
        <section id="detection" className="py-10 space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t.sectionDetectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t.sectionDetectionSubtitle}
            </p>
          </div>

          {/* 50/50 Asymmetrical Scrollytelling Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky Audio Ingestion & Waveform */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <FileDropzone
                files={files}
                onFilesAdded={handleFilesAdded}
                onFileRemoved={handleFileRemoved}
                onClearAll={handleClearAll}
                selectedPreviewFile={selectedPreviewFile}
                onSelectPreviewFile={setSelectedPreviewFile}
                isAnalyzing={isAnalyzing}
                onRunClick={handleRunClick}
                language={language}
              />
            </div>

            {/* Right Column: Model Registry & Results Stream */}
            <div className="lg:col-span-7 space-y-6">
              {/* Model Selection Registry */}
              <ModelSelector
                selectedModelIds={selectedModelIds}
                onToggleModel={handleToggleModel}
                onSelectAll={handleSelectAllModels}
                isHighlighted={isModelSelectorHighlighted}
                language={language}
              />

              {/* Faux Progress Bar */}
              <FauxProgressBar
                isAnalyzing={isAnalyzing}
                isComplete={isAnalysisComplete}
                modelNames={selectedModelNames}
                language={language}
              />

              {/* Results Stream */}
              {results.length > 0 && (
                <ResultsDisplay
                  results={results}
                  onSelectAudioForPlayback={(fname) => {
                    const match = files.find((f) => f.name === fname)
                    if (match) setSelectedPreviewFile(match)
                  }}
                  language={language}
                />
              )}
            </div>
          </div>
        </section>

        {/* 3. Historical Audit Ledger */}
        <div className="scroll-mt-24">
          <HistoryView language={language} />
        </div>

        {/* 4. Technical Architectures Guide */}
        <div className="scroll-mt-24">
          <ModelsGuide language={language} />
        </div>
      </main>

      {/* Footer */}
      <Footer language={language} />
    </div>
  )
}

export default App
