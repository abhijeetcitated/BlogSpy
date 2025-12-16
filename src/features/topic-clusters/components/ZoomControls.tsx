"use client"

interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const zoomPercent = Math.round(zoom * 100)
  const canZoomIn = zoom < 2
  const canZoomOut = zoom > 0.5
  const isReset = zoom === 1

  return (
    <div className="hidden sm:block absolute bottom-16 sm:bottom-20 left-2 sm:left-4 md:left-6 z-20">
      <div className="flex items-center gap-0.5 sm:gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl p-1 sm:p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-zinc-950/50">
        <button
          onClick={onZoomIn}
          disabled={!canZoomIn}
          className={`p-2 sm:p-2.5 rounded-lg transition-all ${
            canZoomIn 
              ? "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800" 
              : "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
          }`}
          title="Zoom In (+20%)"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z"/>
          </svg>
        </button>
        
        <button
          onClick={onZoomOut}
          disabled={!canZoomOut}
          className={`p-2.5 rounded-lg transition-all ${
            canZoomOut 
              ? "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800" 
              : "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
          }`}
          title="Zoom Out (-20%)"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
          </svg>
        </button>
        
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        
        <button
          onClick={onReset}
          className={`p-2.5 rounded-lg transition-all ${
            isReset 
              ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed" 
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
          disabled={isReset}
          title="Reset to 100%"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        
        <div className="px-3 min-w-[52px] text-center">
          <span className={`text-xs font-mono font-semibold ${
            zoomPercent === 100 
              ? "text-zinc-500 dark:text-zinc-400" 
              : zoomPercent > 100 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-amber-600 dark:text-amber-400"
          }`}>
            {zoomPercent}%
          </span>
        </div>
      </div>
    </div>
  )
}
