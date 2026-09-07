import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { apiService } from "./services/api"
import type { PredictionResult } from "./types"
import { type Language, translations } from "./lib/i18n"
import { AlertCircle } from "lucide-react"

export function App() {
  // Light mode is default (false), Dark mode is OLED black (true)
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

  // Backend Health Ping
  const [backendOnline, setBackendOnline] = useState(false)

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Backend Health Check
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const health = await apiService.checkHealth()
        if (health.ok) {
          setBackendOnline(true)
        }
      } catch (err) {
        setBackendOnline(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 15000)
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
      setErrorMessage(
        err.response?.data?.detail ||
          err.message ||
          "Failed to execute audio inference. Please ensure the backend server is running."
      )
    }
  }

  const selectedModelNames = ALL_MODELS.filter((m) => selectedModelIds.includes(m.id))
    .map((m) => m.name)
    .join(", ")

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-foreground selection:text-background">
      {/* First Run Interception Modal */}
      <FirstRunModal
        isOpen={isFirstRunModalOpen}
        onConfirmAndRun={handleConfirmAndRun}
        onExploreModels={handleExploreModels}
        language={language}
      />

      {/* Sticky Razor-thin Minimal Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        backendOnline={backendOnline}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Offline Warning Strip */}
        {!backendOnline && (
          <div className="mt-4 p-3 border border-border bg-surface font-mono text-xs flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500" />
              <span>
                [BACKEND_OFFLINE] FastAPI server not detected at http://127.0.0.1:8000. Start backend using `python main.py`.
              </span>
            </div>
          </div>
        )}

        {/* Global Error Strip */}
        {errorMessage && (
          <div className="mt-4 p-3 border border-rose-500 bg-rose-500/10 font-mono text-xs flex items-center justify-between text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs uppercase font-bold hover:underline"
            >
              [DISMISS]
            </button>
          </div>
        )}

        {/* 1. Hero Section */}
        <Hero language={language} />

        {/* 2. Asymmetrical Scrollytelling Detection Section */}
        <section id="detection" className="py-12 space-y-10 scroll-mt-20">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
              [INFERENCE_SECTION]
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">
              {t.sectionDetectionTitle}
            </h2>
            <p className="text-xs text-muted-foreground font-sans max-w-2xl">
              {t.sectionDetectionSubtitle}
            </p>
          </div>

          {/* 50/50 Asymmetrical Scrollytelling Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky Audio Ingestion & Waveform */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
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
              {/* Model Selection Registry Table */}
              <ModelSelector
                selectedModelIds={selectedModelIds}
                onToggleModel={handleToggleModel}
                onSelectAll={handleSelectAllModels}
                isHighlighted={isModelSelectorHighlighted}
                language={language}
              />

              {/* Faux Geometric Progress Bar */}
              <FauxProgressBar
                isAnalyzing={isAnalyzing}
                isComplete={isAnalysisComplete}
                modelNames={selectedModelNames}
                language={language}
              />

              {/* Results Ledger Stream */}
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
        <div className="scroll-mt-20">
          <HistoryView language={language} />
        </div>

        {/* 4. Technical Architectures Guide */}
        <div className="scroll-mt-20">
          <ModelsGuide language={language} />
        </div>
      </main>

      {/* Footer */}
      <Footer language={language} />
    </div>
  )
}

export default App
