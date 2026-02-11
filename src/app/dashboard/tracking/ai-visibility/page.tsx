import { redirect } from "next/navigation"

/**
 * Tracking route redirect → canonical AI Visibility page.
 * All sidebar/command-palette links point here; the real wired page
 * lives at /dashboard/ai-visibility with full auth + scan + config flows.
 */
export default function AIVisibilityTrackingPage() {
  redirect("/dashboard/ai-visibility")
}
