/**
 * Dashboard Loading State
 * Used by Next.js for Suspense loading
 */

import { PageLoading } from "@/components/common/page-loading"

export default function Loading() {
  return <PageLoading message="Loading dashboard..." />
}
