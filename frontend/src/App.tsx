import React, { useState, useEffect } from "react"
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
import type { PredictionResult, ModelInfo } from "./types"
import { AlertCircle } from "lucide-react"

export function App() {
  // Light mode is default (false)
  const [darkMode, setDarkMode] = useState(false)
  
  // Model selection: Default is ONLY LFCC_VAJA
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

  // Apply dark mode class to HTML document
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
        // Keep at least one model selected
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

    // If first run hasn't been acknowledged yet
    if (!hasConfirmedFirstRun) {
      setIsFirstRunModalOpen(true)
      setIsModelSelectorHighlighted(true)
      const el = document.getElementById("model-selector-widget")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    // Otherwise proceed to execute inference directly
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

      // Run inference for each selected model
      for (const model of selectedModels) {
        const batchRes = await apiService.predictBatch(model.endpoint, files)
        combinedResults.push(...batchRes)
      }

      // Snap faux progress to 100%
      setIsAnalysisComplete(true)
      setTimeout(() => {
        setResults(combinedResults)
        setIsAnalyzing(false)
      }, 500)
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
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-300">
      {/* First Run Interception Modal */}
      <FirstRunModal
        isOpen={isFirstRunModalOpen}
        onConfirmAndRun={handleConfirmAndRun}
        onExploreModels={handleExploreModels}
      />

      {/* Sticky Neumorphic Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        backendOnline={backendOnline}
      />

      {/* Main Content Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Offline Banner */}
        {!backendOnline && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
              <span>
                Backend server is currently offline at <code className="font-mono font-bold">http://127.0.0.1:8000</code>. Please start the backend with <code className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded">python main.py</code>.
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-600 dark:text-rose-300 underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Detection Section */}
        <section id="detection" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Audio Deepfake Analysis & Waveform Inspection
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Upload single or batch audio files to evaluate spectro-temporal bonafide vs. spoof probabilities
            </p>
          </div>

          {/* Audio Upload Dropzone & Queue */}
          <FileDropzone
            files={files}
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
            onClearAll={handleClearAll}
            selectedPreviewFile={selectedPreviewFile}
            onSelectPreviewFile={setSelectedPreviewFile}
            isAnalyzing={isAnalyzing}
            onRunClick={handleRunClick}
          />

          {/* Model Selection Widget */}
          <ModelSelector
            selectedModelIds={selectedModelIds}
            onToggleModel={handleToggleModel}
            onSelectAll={handleSelectAllModels}
            isHighlighted={isModelSelectorHighlighted}
          />

          {/* Faux Progress Bar with Stalling Simulation */}
          <FauxProgressBar
            isAnalyzing={isAnalyzing}
            isComplete={isAnalysisComplete}
            modelNames={selectedModelNames}
          />

          {/* Prediction Results Display */}
          {results.length > 0 && (
            <ResultsDisplay
              results={results}
              onSelectAudioForPlayback={(fname) => {
                const match = files.find((f) => f.name === fname)
                if (match) setSelectedPreviewFile(match)
              }}
            />
          )}
        </section>

        {/* 3. History Section */}
        <div className="scroll-mt-24">
          <HistoryView />
        </div>

        {/* 4. Models Guide Section */}
        <div className="scroll-mt-24">
          <ModelsGuide />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
