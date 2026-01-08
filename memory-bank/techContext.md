# Tech Context - BlogSpy SEO SaaS

> Last Updated: 2026-01-05

---

## Technology Decisions

### Why Next.js 16?

| Decision | Rationale |
|----------|-----------|
| App Router | Server Components by default, better performance |
| React Compiler | Auto-memoization, no manual useMemo/useCallback |
| Turbopack | Faster dev builds than Webpack |
| Server Actions | Type-safe mutations without API routes |

### Why Supabase over Firebase?

| Factor | Supabase | Firebase |
|--------|----------|----------|
| Database | PostgreSQL (relational) | NoSQL |
| Pricing | Predictable | Variable |
| Auth | Built-in, OAuth | Built-in |
| Edge | Edge Functions | Cloud Functions |
| Vendor Lock | Low (standard SQL) | High |

### Why Prisma over Drizzle?

| Factor | Prisma | Drizzle |
|--------|--------|---------|
| Type Safety | Excellent | Excellent |
| Migrations | Built-in | Manual |
| Ecosystem | Mature | Growing |
| Studio | Yes | No |
| Edge Support | Yes (6.x) | Yes |

### Why OpenRouter over Direct APIs?

| Factor | OpenRouter | Direct APIs |
|--------|------------|-------------|
| Multi-model | Single endpoint | Multiple SDKs |
| Cost | Pay-per-use | Various billing |
| Fallback | Automatic | Manual |
| New Models | Quick access | SDK updates |

### Why TipTap over Lexical/Slate?

| Factor | TipTap | Lexical | Slate |
|--------|--------|---------|-------|
| React Support | Excellent | Good | Fair |
| Extensions | 50+ official | Limited | DIY |
| Documentation | Great | Good | Fair |
| Collaboration | Built-in | Plugin | Plugin |

---

## Architecture Decisions

### Feature-Based Structure

**Decision:** Group by feature, not by type

**Rationale:**
- Each feature is self-contained
- Easy to add/remove features
- Clear ownership and boundaries
- Scales with team size

```
✅ src/features/keyword-research/
   ├── actions/
   ├── components/
   └── services/

❌ src/
   ├── actions/keyword-research.ts
   ├── components/KeywordTable.tsx
   └── services/keyword.service.ts
```

### Server Actions over API Routes

**Decision:** Use next-safe-action for mutations

**Rationale:**
- Type-safe end-to-end
- Built-in validation (Zod)
- Automatic rate limiting
- No boilerplate fetch code

```typescript
// ✅ Server Action
export const runAudit = authAction
  .schema(schema)
  .action(async ({ parsedInput }) => { ... })

// ❌ API Route
export async function POST(req: Request) {
  const body = await req.json()
  // Manual validation, auth, etc.
}
```

### Zustand + TanStack Query

**Decision:** Split state responsibility

**Rationale:**
- Zustand: UI state (modals, sidebar, preferences)
- TanStack Query: Server state (API data, caching)
- Clear separation of concerns
- Optimal caching strategies

---

## External Service Choices

### DataForSEO

**Why:**
- Comprehensive SEO data
- Competitive pricing
- Real-time data
- Good API design

**Alternatives Considered:**
- Ahrefs API (expensive, limited)
- SEMrush API (complex pricing)
- Moz API (limited features)

### Upstash Redis

**Why:**
- Serverless-native
- Per-request pricing
- Global edge
- Simple SDK

**Alternatives Considered:**
- Redis Cloud (always-on cost)
- Vercel KV (Upstash rebrand)

---

## Security Decisions

### Rate Limiting Strategy

```
Layer 1: Upstash (distributed, persistent)
Layer 2: In-memory (fast, per-instance)
Layer 3: Per-user (authenticated routes)
```

### Authentication Flow

```
1. Supabase Auth handles OAuth/Magic Link
2. Server Actions validate session
3. authAction wrapper enforces auth
4. Rate limiting applies
5. Handler executes
```

---

## Performance Optimizations

### Enabled Features

| Feature | Config |
|---------|--------|
| React Compiler | `reactCompiler: true` |
| Turbopack | `turbopack: {}` |
| Image Optimization | AVIF, WebP |
| Package Optimization | lucide, recharts, date-fns |

### Disabled Features

| Feature | Reason |
|---------|--------|
| PPR (Partial Pre-rendering) | Incompatible with force-dynamic routes |

---

## Dependencies Philosophy

### Core Principle

> "Choose boring technology" - except where innovation provides clear value

### Versioning Strategy

- **Major:** Careful evaluation, wait for ecosystem
- **Minor:** Update regularly
- **Patch:** Auto-update (Dependabot)

### Dependency Categories

| Category | Policy |
|----------|--------|
| Framework (Next, React) | Track latest stable |
| UI (Tailwind, Radix) | Track latest |
| Database (Prisma) | Track latest stable |
| Utils (date-fns, zod) | Pin to minor |
