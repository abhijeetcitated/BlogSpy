# 🚀 Navigation Guide - BlogSpy SaaS

Is guide mein tumhe button se page navigation ke saare tarike milenge.

## 📋 Quick Reference

### Method 1: Link Button (BEST ✅ - Use karo most of the time)

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

<Button asChild>
  <Link href="/dashboard/creation/ai-writer">
    Go to AI Writer
  </Link>
</Button>
```

**Kab use karo:** 
- Jab simple page navigation chahiye
- Best for SEO
- No JavaScript needed

---

### Method 2: Router Navigation (For onClick logic)

```tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MyComponent() {
  const router = useRouter()
  
  const handleClick = () => {
    // Pehle kuch logic run karo
    console.log("Button clicked!")
    
    // Then navigate
    router.push("/dashboard/creation/ai-writer")
  }
  
  return (
    <Button onClick={handleClick}>
      Go to AI Writer
    </Button>
  )
}
```

**Kab use karo:**
- Jab navigation se pehle kuch logic run karna ho
- API call ke baad navigate karna ho
- Conditional navigation chahiye

---

### Method 3: With Routes Helper (RECOMMENDED ✅)

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/navigation-helpers"

<Button asChild>
  <Link href={routes.creation.aiWriter}>
    Go to AI Writer
  </Link>
</Button>
```

**Benefits:**
- Typo nahi hoga
- Autocomplete milega
- Easy to refactor

---

### Method 4: Dynamic Routes

```tsx
"use client"

import { useRouter } from "next/navigation"
import { routes } from "@/lib/navigation-helpers"

const router = useRouter()
const keyword = "seo"

// Navigate to dynamic route
router.push(routes.research.overview(keyword))
// Goes to: /dashboard/research/overview/seo
```

---

## 📍 All Available Routes

```typescript
routes.home                        // "/"
routes.dashboard                   // "/dashboard"

// Research
routes.research.keywordMagic       // "/dashboard/research/keyword-magic"
routes.research.trends             // "/dashboard/research/trends"
routes.research.gapAnalysis        // "/dashboard/research/gap-analysis"
routes.research.overview(keyword)  // "/dashboard/research/overview/:keyword"

// Strategy
routes.strategy.topicClusters      // "/dashboard/strategy/topic-clusters"
routes.strategy.roadmap            // "/dashboard/strategy/roadmap"

// Creation
routes.creation.aiWriter           // "/dashboard/creation/ai-writer"
routes.creation.snippetStealer     // "/dashboard/creation/snippet-stealer"
routes.creation.onPage             // "/dashboard/creation/on-page"

// Tracking
routes.tracking.rankTracker        // "/dashboard/tracking/rank-tracker"
routes.tracking.decay              // "/dashboard/tracking/decay"
```

---

## 💡 Common Use Cases

### Card with Navigation

```tsx
<Button asChild variant="outline" className="h-auto flex-col items-start p-4">
  <Link href={routes.creation.aiWriter}>
    <span className="font-semibold">AI Writer</span>
    <span className="text-xs text-muted-foreground mt-1">
      Create content with AI
    </span>
  </Link>
</Button>
```

### Button with Icon

```tsx
import { Sparkles } from "lucide-react"

<Button asChild>
  <Link href={routes.creation.aiWriter}>
    <Sparkles className="mr-2 h-4 w-4" />
    AI Writer
  </Link>
</Button>
```

### Back Button

```tsx
"use client"

import { useRouter } from "next/navigation"

const router = useRouter()

<Button onClick={() => router.back()}>
  ← Go Back
</Button>
```

### External Link (New Tab)

```tsx
<Button asChild>
  <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
    Visit External Site
  </Link>
</Button>
```

---

## 🎯 Best Practices

1. ✅ **Most cases:** Use `<Button asChild>` with `<Link>`
2. ✅ **With logic:** Use `useRouter()` and `router.push()`
3. ✅ **Routes helper:** Always use `routes` from `navigation-helpers.ts`
4. ✅ **Client components:** Add `"use client"` jab `useRouter` use karo
5. ❌ **Avoid:** Regular `<a>` tags for internal navigation

---

## 📝 Example Component

Complete working example:

```tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/navigation-helpers"
import { Sparkles, TrendingUp } from "lucide-react"

export function FeatureButtons() {
  const router = useRouter()
  
  const handleNavigateWithLogic = async () => {
    // Your logic here
    console.log("Navigating...")
    router.push(routes.creation.aiWriter)
  }
  
  return (
    <div className="flex gap-4">
      {/* Simple Link */}
      <Button asChild>
        <Link href={routes.creation.aiWriter}>
          <Sparkles className="mr-2 h-4 w-4" />
          AI Writer
        </Link>
      </Button>
      
      {/* With onClick Logic */}
      <Button onClick={handleNavigateWithLogic}>
        <TrendingUp className="mr-2 h-4 w-4" />
        Trends
      </Button>
    </div>
  )
}
```

---

## 🔥 Quick Copy-Paste Templates

### Basic Button
```tsx
<Button asChild>
  <Link href="/your-route">Button Text</Link>
</Button>
```

### Button with Icon
```tsx
<Button asChild>
  <Link href="/your-route">
    <Icon className="mr-2 h-4 w-4" />
    Button Text
  </Link>
</Button>
```

### Programmatic Navigation
```tsx
const router = useRouter()
<Button onClick={() => router.push("/your-route")}>Button Text</Button>
```

---

## ✅ Updated Files

1. ✅ `components/app-sidebar.tsx` - Sidebar navigation fixed
2. ✅ `lib/navigation-helpers.ts` - Centralized routes
3. ✅ `components/navigation-examples.tsx` - Working examples

---

Need help? Koi problem ho to mujhe batao! 🚀

