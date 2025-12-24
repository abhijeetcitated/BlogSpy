import { KeywordOverviewContent } from "@/components/features"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{
    keyword: string
  }>
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { keyword } = await params
  const decodedKeyword = decodeURIComponent(keyword).replace(/-/g, ' ')
  
  return {
    title: `${decodedKeyword} - Keyword Overview | BlogSpy`,
    description: `Comprehensive SEO analysis for "${decodedKeyword}". View search volume, keyword difficulty, SERP analysis, AI overview insights, and content opportunities.`,
    openGraph: {
      title: `${decodedKeyword} - Keyword Analysis`,
      description: `Deep dive into ${decodedKeyword} keyword metrics and competition.`,
    }
  }
}

export default async function KeywordOverviewPage({ params }: PageProps) {
  // Await params in Next.js 15+
  const { keyword } = await params
  
  // Decode the keyword from URL (e.g., "ai-tools" -> "AI Tools")
  const decodedKeyword = decodeURIComponent(keyword).replace(/-/g, ' ')
  
  return (
    <ErrorBoundary>
      <KeywordOverviewContent keyword={decodedKeyword} />
    </ErrorBoundary>
  )
}

