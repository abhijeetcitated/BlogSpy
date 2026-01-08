# System Patterns - BlogSpy SEO SaaS

> Last Updated: 2026-01-05

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App                          │
├─────────────────────────────────────────────────────────────────┤
│  App Router │ Server Actions │ React 19 │ TypeScript Strict     │
├─────────────────────────────────────────────────────────────────┤
│                      Feature Modules (27)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ keyword  │ │    ai    │ │ content  │ │  social  │           │
│  │ research │ │visibility│ │  decay   │ │ tracker  │  ...      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                            │
│  DataForSEO │ Google APIs │ OpenRouter │ Supabase │ Upstash    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | Full-stack React framework |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety (strict mode) |

### Database & Auth
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | 2.89.0 | PostgreSQL + Auth + Storage |
| Prisma | 6.19.1 | Type-safe ORM |
| Upstash Redis | 1.36.0 | Rate limiting, caching |

### UI Layer
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.1.17 | Utility-first styling |
| Radix UI | 1.x-2.x | Headless accessible components |
| shadcn/ui | new-york | Component library |
| Lucide React | 0.454.0 | Icons |
| Recharts | 2.15.4 | Data visualization |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.9 | Client state |
| TanStack Query | 5.90.16 | Server state / caching |
| React Hook Form | 7.60.0 | Form handling |
| Zod | 4.3.4 | Runtime validation |

### AI Integration
| Technology | Purpose |
|------------|---------|
| OpenAI SDK | 6.15.0 | Direct OpenAI access |
| OpenRouter | Multi-model routing (GPT-4, Claude, Gemini, Perplexity) |

### Editor
| Technology | Version | Purpose |
|------------|---------|---------|
| TipTap | 3.13.0 | Rich text editor for AI Writer |

---

## Design Patterns

### 1. Feature-Based Architecture
```
src/features/[feature-name]/
├── actions/        # Server Actions (next-safe-action)
├── components/     # Feature-specific UI
├── services/       # Business logic & API calls
├── types/          # TypeScript interfaces
├── hooks/          # React hooks
├── constants/      # Configuration
├── utils/          # Helper functions
└── index.ts        # Public exports
```

### 2. Server Actions Pattern
```typescript
// Using next-safe-action v8 with Zod validation
export const runTechAudit = authAction
  .schema(domainSchema)
  .action(async ({ parsedInput }) => {
    // Authenticated, rate-limited, validated
  })
```

### 3. State Management Pattern
```typescript
// Zustand for UI state
const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

// TanStack Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['keywords', projectId],
  queryFn: () => keywordsApi.getKeywords(projectId),
})
```

### 4. API Client Pattern
```typescript
// Singleton pattern for external APIs
class DataForSEOClient {
  private static instance: DataForSEOClient
  static getInstance(): DataForSEOClient { ... }
}
```

### 5. Credit System Pattern
```typescript
// Centralized credit service
const result = await creditService.useFeatureCredits(userId, 'ai_visibility')
if (!result.success) {
  return { error: result.message }
}
```

---

## External API Integrations

### DataForSEO (SEO Data Provider)
```
Base URL: https://api.dataforseo.com/v3
Auth: Basic Auth (login:password)

Endpoints Used:
- /serp/google/organic/live/advanced
- /keywords_data/google/search_volume/live
- /keywords_data/google/keyword_suggestions/live
- /backlinks/summary/live
```

### Google APIs (OAuth 2.0)
```
- Search Console: Performance data, sitemaps
- Analytics 4: Traffic, engagement metrics
```

### OpenRouter (AI Gateway)
```
Models:
- chatgpt: openai/gpt-4o-mini
- claude: anthropic/claude-3-haiku
- gemini: google/gemini-flash-1.5
- perplexity: perplexity/sonar
```

---

## Security Patterns

### 1. Security Headers (next.config.ts)
- HSTS (63072000 seconds)
- CSP with strict directives
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff

### 2. Rate Limiting
```typescript
// Multi-layer approach
1. Upstash Redis (distributed)
2. In-memory fallback (per-instance)
3. Per-user limits for authenticated routes
```

### 3. Input Sanitization
```typescript
// lib/security.ts
sanitizeString()   // XSS prevention
sanitizeEmail()    // Email validation
sanitizeDomain()   // Domain validation
sanitizeUrl()      // URL validation
```

### 4. Authentication Flow
```
Request → Supabase Auth → authAction wrapper → Rate limit check → Handler
```

---

## Database Schema (Key Models)

```prisma
model User {
  id            String @id @default(cuid())
  email         String @unique
  plan          Plan   @default(FREE)
  credits       Int    @default(50)
  projects      Project[]
  keywords      Keyword[]
}

model Keyword {
  id          String @id @default(cuid())
  keyword     String
  volume      Int?
  difficulty  Int?
  cpc         Float?
  intent      String?
  rankings    Ranking[]
}

model TopicCluster {
  id          String @id @default(cuid())
  name        String
  pillarTopic String
  topics      Json?
}
```

---

## Key File Locations

| Purpose | Path |
|---------|------|
| App Routes | `app/` |
| Features | `src/features/` |
| Core Utils | `lib/` |
| API Clients | `services/` |
| UI Components | `components/` |
| Global State | `store/` |
| Config | `config/` |
| DB Schema | `prisma/schema.prisma` |

---

## Performance Optimizations

1. **Turbopack** - Fast dev builds
2. **React Compiler** - Auto-memoization
3. **Package Optimization** - lucide, recharts, date-fns
4. **Image Optimization** - AVIF/WebP formats
5. **Server Components** - Default rendering mode
