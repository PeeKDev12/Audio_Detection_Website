import React, { useRef, useState } from "react"
import { UploadCloud, FileAudio, Trash2, PlayCircle, ArrowRight } from "lucide-react"
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
      {/* Strict Minimal Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed p-8 sm:p-10 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-foreground bg-surface"
            : "border-border hover:border-foreground hover:bg-surface/40 bg-background"
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

        <div className="flex flex-col items-center justify-center space-y-3 font-mono">
          <UploadCloud className="w-8 h-8 text-foreground" />
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
              {t.dropzoneTitle}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 underline underline-offset-4">
              {t.dropzoneBrowse}
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">
              {t.dropzoneFormats}
            </p>
          </div>
        </div>
      </div>

      {/* Waveform Inspection Monitor */}
      <div className="border border-border space-y-3">
        <div className="p-3 bg-surface border-b border-border flex items-center justify-between font-mono text-xs">
          <span className="font-bold tracking-wider uppercase text-foreground">
            {t.waveformTitle}
          </span>
          {selectedPreviewFile && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
              [{selectedPreviewFile.name}]
            </span>
          )}
        </div>

        <div className="p-4">
          {selectedPreviewFile ? (
            <AudioWaveform file={selectedPreviewFile} height={70} />
          ) : (
            <div className="py-10 text-center font-mono text-xs text-muted-foreground uppercase tracking-wider border border-dashed border-border/70">
              {t.noFileSelected}
            </div>
          )}
        </div>
      </div>

      {/* Ingestion Queue Table */}
      {files.length > 0 && (
        <div className="border border-border space-y-3 animate-in fade-in duration-200">
          <div className="p-3 bg-surface border-b border-border flex items-center justify-between font-mono text-xs">
            <span className="font-bold tracking-wider text-foreground uppercase">
              {t.queueTitle} [{files.length}]
            </span>
            <button
              onClick={onClearAll}
              disabled={isAnalyzing}
              className="text-[11px] text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              [{t.clearQueue}]
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-border">
            {files.map((file, idx) => {
              const isSelected = selectedPreviewFile === file
              return (
                <div
                  key={`${file.name}-${idx}`}
                  className={`flex items-center justify-between p-3 font-mono text-xs transition-colors ${
                    isSelected
                      ? "bg-surface font-bold text-foreground"
                      : "text-muted-foreground hover:bg-surface/50 hover:text-foreground"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                    onClick={() => onSelectPreviewFile(file)}
                  >
                    <PlayCircle
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    />
                    <div className="truncate">
                      <span className="truncate">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        [{formatFileSize(file.size)}]
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemoved(idx)
                    }}
                    disabled={isAnalyzing}
                    className="p-1 text-muted-foreground hover:text-foreground ml-2"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Stark Action Button */}
          <div className="p-3 bg-surface border-t border-border">
            <button
              type="button"
              onClick={onRunClick}
              disabled={isAnalyzing || files.length === 0}
              className="w-full py-3.5 px-4 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-3"
            >
              <span>{isAnalyzing ? t.runningButton : `${t.runButton} [${files.length}]`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
