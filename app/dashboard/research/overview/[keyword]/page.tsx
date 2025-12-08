import { KeywordOverviewContent } from "@/components/keyword-overview-content"

interface PageProps {
  params: Promise<{
    keyword: string
  }>
}

export default async function KeywordOverviewPage({ params }: PageProps) {
  // Await params in Next.js 15+
  const { keyword } = await params
  
  // Decode the keyword from URL (e.g., "ai-tools" -> "AI Tools")
  const decodedKeyword = decodeURIComponent(keyword)
  
  return <KeywordOverviewContent />
}

