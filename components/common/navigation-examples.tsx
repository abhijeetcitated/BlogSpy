/**
 * Navigation Examples Component
 * Is file mein different tarike se button navigation ke examples hain
 */

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/navigation-helpers"
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react"

export function NavigationExamples() {
  const router = useRouter()

  // Method 1: Using router.push (programmatic navigation)
  const handleNavigateWithRouter = () => {
    router.push(routes.creation.aiWriter)
  }

  // Method 2: Navigate with router and show loading state
  const handleNavigateWithLoading = async () => {
    console.log("Loading...")
    router.push(routes.research.keywordMagic)
  }

  // Method 3: Dynamic route navigation
  const handleNavigateToKeyword = (keyword: string) => {
    router.push(routes.research.overview(keyword))
  }

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Navigation Examples</h2>
        <p className="text-muted-foreground">
          Yahan different tarike se button se page navigate karne ke examples hain
        </p>
      </div>

      {/* Example 1: Simple Link Button */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">1. Simple Link Button (Best for SEO)</h3>
        <p className="text-sm text-muted-foreground">
          Next.js Link component use karo - Best method for most cases
        </p>
        <Button asChild>
          <Link href={routes.creation.aiWriter}>
            <Sparkles className="mr-2 h-4 w-4" />
            Go to AI Writer
          </Link>
        </Button>
      </div>

      {/* Example 2: Programmatic Navigation */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">2. Programmatic Navigation (onClick events)</h3>
        <p className="text-sm text-muted-foreground">
          Jab tumhe click par kuch logic run karna ho pehle, tab useRouter use karo
        </p>
        <Button onClick={handleNavigateWithRouter} variant="secondary">
          <ArrowRight className="mr-2 h-4 w-4" />
          Navigate with Router
        </Button>
      </div>

      {/* Example 3: Navigation with Logic */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">3. Navigation with Loading State</h3>
        <p className="text-sm text-muted-foreground">
          Jab navigation se pehle API call ya loading dikhaana ho
        </p>
        <Button onClick={handleNavigateWithLoading} variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          Navigate with Loading
        </Button>
      </div>

      {/* Example 4: Dynamic Route */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">4. Dynamic Route Navigation</h3>
        <p className="text-sm text-muted-foreground">
          Dynamic parameters ke saath navigate karna (jaise keyword search)
        </p>
        <div className="flex gap-2">
          <Button onClick={() => handleNavigateToKeyword("seo")} size="sm">
            Search SEO
          </Button>
          <Button onClick={() => handleNavigateToKeyword("content-marketing")} size="sm">
            Search Content Marketing
          </Button>
        </div>
      </div>

      {/* Example 5: Multiple Buttons in a Grid */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">5. Feature Card Navigation</h3>
        <p className="text-sm text-muted-foreground">
          Cards ya feature buttons se navigation
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href={routes.research.keywordMagic}>
              <span className="font-semibold">Keyword Magic</span>
              <span className="text-xs text-muted-foreground mt-1">
                Find best keywords
              </span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href={routes.strategy.topicClusters}>
              <span className="font-semibold">Topic Clusters</span>
              <span className="text-xs text-muted-foreground mt-1">
                Organize your content
              </span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href={routes.tracking.rankTracker}>
              <span className="font-semibold">Rank Tracker</span>
              <span className="text-xs text-muted-foreground mt-1">
                Monitor rankings
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Example 6: Back Navigation */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">6. Back Navigation</h3>
        <p className="text-sm text-muted-foreground">
          Pichle page par jaane ke liye
        </p>
        <Button onClick={() => router.back()} variant="ghost">
          ← Go Back
        </Button>
      </div>
    </div>
  )
}

// ============================================
// QUICK REFERENCE - Copy paste these examples
// ============================================

/*
// METHOD 1: Link Button (RECOMMENDED)
<Button asChild>
  <Link href="/dashboard/creation/ai-writer">Go to AI Writer</Link>
</Button>

// METHOD 2: Router Navigation with onClick
"use client"
import { useRouter } from "next/navigation"

const router = useRouter()
<Button onClick={() => router.push("/dashboard/creation/ai-writer")}>
  Go to AI Writer
</Button>

// METHOD 3: With Routes Helper
import { routes } from "@/lib/navigation-helpers"

<Button asChild>
  <Link href={routes.creation.aiWriter}>Go to AI Writer</Link>
</Button>

// METHOD 4: Dynamic Route
<Button onClick={() => router.push(routes.research.overview("seo"))}>
  View SEO Overview
</Button>

// METHOD 5: External Link (new tab)
<Button asChild>
  <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
    Visit External Site
  </Link>
</Button>
*/


