import React, { useRef, useState } from "react"
import { UploadCloud, FileAudio, Trash2, PlayCircle, Waves, ArrowRight } from "lucide-react"
import { AudioWaveform } from "./AudioWaveform"
import { type Language, translations } from "../lib/i18n"

interface FileDropzoneProps {
  files: File[]
  onFilesAdded: (newFiles: File[]) => void
  onFileRemoved: (index: number) => void
  onClearAll: () => void
  selectedPreviewFile: File | null
  onSelectPreviewFile: (file: File) => void
  isAnalyzing: boolean
  onRunClick: () => void
  language: Language
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  files,
  onFilesAdded,
  onFileRemoved,
  onClearAll,
  selectedPreviewFile,
  onSelectPreviewFile,
  isAnalyzing,
  onRunClick,
  language,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = translations[language]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("audio/") || /\.(wav|mp3|flac|m4a|ogg|aac|wma)$/i.test(f.name)
      )
      if (validFiles.length > 0) {
        onFilesAdded(validFiles)
        if (!selectedPreviewFile) {
          onSelectPreviewFile(validFiles[0])
        }
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files)
      onFilesAdded(validFiles)
      if (!selectedPreviewFile) {
        onSelectPreviewFile(validFiles[0])
      }
      e.target.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Neumorphic Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? "shadow-neu-inset dark:shadow-neu-inset-dark ring-2 ring-primary scale-[0.99]"
            : "bg-background shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-sm dark:hover:shadow-neu-sm-dark"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.wav,.mp3,.flac,.m4a,.ogg,.aac"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark group-hover:shadow-neu-inset dark:group-hover:shadow-neu-inset-dark text-primary transition-all duration-200">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {t.dropzoneTitle}
            </p>
            <p className="text-xs text-primary font-medium mt-1 underline underline-offset-4">
              {t.dropzoneBrowse}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2 font-mono">
              {t.dropzoneFormats}
            </p>
          </div>
        </div>
      </div>

      {/* Waveform Inspection Monitor */}
      <div className="rounded-3xl p-6 bg-background shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">
              {t.waveformTitle}
            </h4>
          </div>
          {selectedPreviewFile && (
            <span className="text-xs font-mono text-primary truncate max-w-[200px]">
              {selectedPreviewFile.name}
            </span>
          )}
        </div>

        <div>
          {selectedPreviewFile ? (
            <AudioWaveform file={selectedPreviewFile} height={75} />
          ) : (
            <div className="py-10 text-center text-xs text-muted-foreground bg-background rounded-2xl shadow-neu-inset dark:shadow-neu-inset-dark p-6">
              {t.noFileSelected}
            </div>
          )}
        </div>
      </div>

      {/* Ingestion Queue Card */}
      {files.length > 0 && (
        <div className="rounded-3xl p-6 bg-background shadow-neu-flat dark:shadow-neu-flat-dark space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {t.queueTitle} ({files.length})
              </span>
            </div>
            <button
              type="button"
              onClick={onClearAll}
              disabled={isAnalyzing}
              className="text-xs text-muted-foreground hover:text-rose-500 font-medium transition-colors"
            >
              {t.clearQueue}
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {files.map((file, idx) => {
              const isSelected = selectedPreviewFile === file
              return (
                <div
                  key={`${file.name}-${idx}`}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all select-none ${
                    isSelected
                      ? "shadow-neu-inset dark:shadow-neu-inset-dark ring-1 ring-primary/40 bg-secondary/20"
                      : "shadow-neu-sm dark:shadow-neu-sm-dark hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark bg-background"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                    onClick={() => onSelectPreviewFile(file)}
                  >
                    <PlayCircle
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemoved(idx)
                    }}
                    disabled={isAnalyzing}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 shadow-neu-sm dark:shadow-neu-sm-dark hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark transition-all ml-2"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onRunClick}
              disabled={isAnalyzing || files.length === 0}
              className="w-full py-4 px-6 rounded-2xl bg-background text-primary font-bold text-sm sm:text-base shadow-neu-lg dark:shadow-neu-lg-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 border border-border/40"
            >
              <span>{isAnalyzing ? t.runningButton : `${t.runButton} (${files.length})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
