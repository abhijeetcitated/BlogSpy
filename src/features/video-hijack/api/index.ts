// ============================================
// VIDEO HIJACK - API Routes Index
// ============================================
// Re-exports API route handlers
// ============================================

// Note: In Next.js App Router, each route.ts file is auto-discovered.
// This index is for organizational reference only.

export const API_ROUTES = {
  YOUTUBE: "/api/video-hijack/youtube",
  TIKTOK_SEARCH: "/api/video-hijack/tiktok/search",
  TIKTOK_VIDEO: "/api/video-hijack/tiktok/video",
  TIKTOK_HASHTAG: "/api/video-hijack/tiktok/hashtag",
  TIKTOK_TRENDING: "/api/video-hijack/tiktok/trending",
} as const
