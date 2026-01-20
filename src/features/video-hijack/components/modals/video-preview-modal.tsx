// Video Preview Modal Component

"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { extractYouTubeVideoId } from "../../utils/common.utils"

interface VideoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
}

export function VideoPreviewModal({ isOpen, onClose, videoUrl, title }: VideoPreviewModalProps) {
  const videoId = extractYouTubeVideoId(videoUrl)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
              Preview unavailable for this video.
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <a href={videoUrl} target="_blank" rel="noreferrer">
              Open on YouTube
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
