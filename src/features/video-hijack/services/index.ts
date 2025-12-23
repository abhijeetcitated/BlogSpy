// ============================================
// VIDEO HIJACK - Services Barrel Export
// ============================================

// YouTube Service
export { 
  youtubeService, 
  YouTubeService,
  calculateYouTubeHijackScore,
  calculateYouTubeViralPotential,
  getYouTubeContentAge,
  parseYouTubeDuration,
  formatNumber as formatYouTubeNumber,
} from "./youtube.service"

// TikTok Service
export { 
  tiktokService, 
  TikTokService,
  calculateTikTokHijackScore,
  calculateTikTokViralPotential,
  formatTikTokNumber,
  formatTikTokDuration,
} from "./tiktok.service"
