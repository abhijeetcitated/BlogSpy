// ============================================
// AI WRITER - Image Placeholder Component
// ============================================

"use client"

import { useState, useCallback } from "react"
import { Loader2, Upload, XCircle } from "lucide-react"

interface ImagePlaceholderProps {
  onUpload: (url: string) => void
}

export function ImagePlaceholder({ onUpload }: ImagePlaceholderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleClick = useCallback(() => {
    // Create a hidden file input
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsUploading(true)
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        // Create object URL for preview
        const url = URL.createObjectURL(file)
        setImageUrl(url)
        setIsUploading(false)
        onUpload(url)
      }
    }
    input.click()
  }, [onUpload])

  if (imageUrl) {
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
        <img src={imageUrl} alt="Featured" className="w-full h-full object-cover" />
        <button
          onClick={() => setImageUrl(null)}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-64 bg-slate-800 rounded-lg mb-8 flex items-center justify-center border border-border cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group"
    >
      {isUploading ? (
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-slate-700 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
            Click to upload Featured Image
          </p>
        </div>
      )}
    </div>
  )
}
