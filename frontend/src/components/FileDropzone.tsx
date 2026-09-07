import React, { useRef, useState } from "react"
import { UploadCloud, FileAudio, Trash2, PlayCircle, Waves, CheckCircle2, Sparkles } from "lucide-react"
import { AudioWaveform } from "./AudioWaveform"

interface FileDropzoneProps {
  files: File[]
  onFilesAdded: (newFiles: File[]) => void
  onFileRemoved: (index: number) => void
  onClearAll: () => void
  selectedPreviewFile: File | null
  onSelectPreviewFile: (file: File) => void
  isAnalyzing: boolean
  onRunClick: () => void
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
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? "shadow-neu-inset dark:shadow-neu-inset-dark ring-2 ring-cyan-500 scale-[0.99]"
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

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-5 rounded-2xl bg-background shadow-neu-flat dark:shadow-neu-flat-dark group-hover:shadow-neu-inset dark:group-hover:shadow-neu-inset-dark text-cyan-600 dark:text-cyan-400 transition-all duration-300">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-bold text-foreground">
              Drop audio files here, or <span className="text-cyan-600 dark:text-cyan-400 underline underline-offset-4">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 font-mono">
              Supports .WAV, .MP3, .FLAC (16kHz recommended for AASIST)
            </p>
          </div>
        </div>
      </div>

      {/* Selected Audio Files & Waveform Monitor */}
      {files.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Waveform Inspection Card */}
          <div className="bg-background rounded-3xl p-6 shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h4 className="text-sm font-bold text-foreground">
                  Interactive Waveform Visualizer
                </h4>
              </div>
              {selectedPreviewFile && (
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 truncate max-w-[220px]">
                  {selectedPreviewFile.name}
                </span>
              )}
            </div>

            {selectedPreviewFile ? (
              <AudioWaveform file={selectedPreviewFile} height={75} />
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Select a file from below to monitor waveform
              </div>
            )}
          </div>

          {/* Files List Card */}
          <div className="bg-background rounded-3xl p-6 shadow-neu-flat dark:shadow-neu-flat-dark space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm font-bold text-foreground">
                  Selected Audio Queue ({files.length})
                </span>
              </div>
              <button
                onClick={onClearAll}
                disabled={isAnalyzing}
                className="text-xs font-medium text-muted-foreground hover:text-rose-500 transition-colors"
              >
                Clear Queue
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {files.map((file, idx) => {
                const isSelected = selectedPreviewFile === file
                return (
                  <div
                    key={`${file.name}-${idx}`}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all select-none ${
                      isSelected
                        ? "shadow-neu-inset dark:shadow-neu-inset-dark bg-secondary/30 ring-1 ring-cyan-500/40"
                        : "shadow-neu-sm dark:shadow-neu-sm-dark hover:shadow-neu-inset dark:hover:shadow-neu-inset-dark bg-background"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                      onClick={() => onSelectPreviewFile(file)}
                    >
                      <PlayCircle
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? "text-cyan-500" : "text-muted-foreground"
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
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileRemoved(idx)
                      }}
                      disabled={isAnalyzing}
                      className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:shadow-neu-sm dark:hover:shadow-neu-sm-dark transition-all ml-2"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Run Analysis Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onRunClick}
                disabled={isAnalyzing || files.length === 0}
                className="w-full py-4 px-6 rounded-2xl bg-background text-foreground font-extrabold text-sm sm:text-base shadow-neu-lg dark:shadow-neu-lg-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 border border-border/40"
              >
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {isAnalyzing ? "Processing Asynchronous Inference..." : `Run Analysis on ${files.length} File${files.length > 1 ? "s" : ""}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
