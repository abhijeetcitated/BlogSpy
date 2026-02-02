import { Suspense } from "react"
import { KeywordResearchContent } from "@features/keyword-research"
import { MOCK_KEYWORDS } from "@features/keyword-research/__mocks__/keyword-data"
import { DemoWrapper } from "@/components/shared/common/demo-wrapper"

export const metadata = {
  title: "Keyword Explorer Demo - BlogSpy | Discover High-Value Keywords",
  description: "Try our keyword research tool. Find thousands of keyword ideas with search volume, difficulty, and CPC data. Sign up for full access.",
}

function KeywordResearchLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export default function KeywordResearchDemoPage() {
  const initialKeywords = MOCK_KEYWORDS.map(({ lastUpdated, ...rest }) => rest)

  return (
    <DemoWrapper
      featureName="Keyword Explorer"
      featureDescription="Access unlimited keyword research with real-time data, competitor analysis, and export features."
      dashboardPath="/dashboard/research/keyword-magic"
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Suspense fallback={<KeywordResearchLoading />}>
          <KeywordResearchContent initialKeywords={initialKeywords} />
        </Suspense>
      </div>
    </DemoWrapper>
  )
}

