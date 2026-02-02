# Development Guidelines

## Code Quality Standards

### File Organization
- **Comprehensive header comments** - Files begin with descriptive multi-line comments explaining purpose and functionality
- **Section dividers** - Use visual separators with `// ============` for major sections
- **Logical grouping** - Related functions grouped together with clear section headers
- **Export organization** - Named exports at bottom of file for testing/reusability

### TypeScript Conventions
- **Strict typing** - All function parameters and return types explicitly typed
- **Type imports** - Use `import type` for type-only imports to optimize bundle size
- **Interface over type** - Prefer interfaces for object shapes, types for unions/intersections
- **Const assertions** - Use `as const` for literal type inference on configuration objects
- **Type safety** - No `any` types; use `unknown` or proper generics when type is uncertain

### Naming Conventions
- **camelCase** - Functions, variables, parameters: `calculatePillarScore`, `isGenerating`
- **PascalCase** - Types, interfaces, React components: `SourceKeyword`, `GeneratedPillar`, `GeneralTab`
- **SCREAMING_SNAKE_CASE** - Constants and configuration: `DEFAULT_OPTIONS`, `MOCK_SESSIONS`, `TIMEZONES`
- **Descriptive names** - Function names describe action: `extractRootTopic`, `generateLinkingMatrix`, `handlePasswordChange`
- **Boolean prefixes** - Use `is`, `has`, `should` for booleans: `isLoading`, `hasUppercase`, `shouldValidate`

### Code Structure Patterns
- **Single Responsibility** - Each function has one clear purpose
- **Pure functions** - Utility functions avoid side effects and return new values
- **Early returns** - Guard clauses at function start for validation
- **Minimal nesting** - Extract complex logic into helper functions
- **DRY principle** - Reusable logic extracted into utility functions

## React & Next.js Patterns

### Component Structure
```typescript
// 1. Imports (grouped by category)
"use client" // Client directive first if needed
import { useState } from "react" // React imports
import { Button } from "@/components/ui/button" // UI components
import { useProfile } from "@/hooks/use-user" // Custom hooks

// 2. Constants (outside component)
const TIMEZONES = [...]
const MOCK_DATA = [...]

// 3. Component definition
export function ComponentName() {
  // 3a. Hooks (in order: state, refs, context, custom hooks)
  const [state, setState] = useState()
  const ref = useRef()
  const { data } = useCustomHook()
  
  // 3b. Derived state and computations
  const computed = useMemo(() => calculate(data), [data])
  
  // 3c. Event handlers
  const handleClick = useCallback(() => {}, [])
  
  // 3d. Effects
  useEffect(() => {}, [])
  
  // 3e. Early returns (loading, error states)
  if (isLoading) return <Skeleton />
  
  // 3f. Render
  return <div>...</div>
}
```

### Hook Patterns
- **Custom hooks** - Prefix with `use`: `useAIGeneration`, `useProfile`
- **Return objects** - Return object with named properties, not arrays
- **Ref for abort** - Use `useRef` for values that shouldn't trigger re-renders (abort flags, timers)
- **Callback optimization** - Wrap handlers in `useCallback` with proper dependencies
- **State colocation** - Keep state close to where it's used

### Client vs Server Components
- **"use client" directive** - Required for interactivity, hooks, browser APIs
- **Server components default** - Use server components unless client features needed
- **Minimal client boundaries** - Push "use client" as deep as possible in component tree

## State Management

### Local State (useState)
- **Form data** - `const [formData, setFormData] = useState({ name: "", email: "" })`
- **UI state** - Loading, modals, dialogs: `const [isOpen, setIsOpen] = useState(false)`
- **Derived state** - Compute from props/state rather than storing separately

### Zustand Store Pattern
```typescript
// store/feature-store.ts
import { create } from "zustand"

interface FeatureState {
  data: Data[]
  isLoading: boolean
  setData: (data: Data[]) => void
  fetchData: () => Promise<void>
}

export const useFeatureStore = create<FeatureState>((set) => ({
  data: [],
  isLoading: false,
  setData: (data) => set({ data }),
  fetchData: async () => {
    set({ isLoading: true })
    // fetch logic
    set({ isLoading: false })
  }
}))
```

### React Query Pattern
- **Server state** - Use `@tanstack/react-query` for API data
- **Query keys** - Array format: `["keywords", { filters }]`
- **Mutations** - Use `useMutation` for POST/PUT/DELETE operations
- **Optimistic updates** - Update UI before server response for better UX

## API & Data Fetching

### API Route Structure
```typescript
// app/api/feature/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // 1. Extract params
    const { searchParams } = new URL(request.url)
    
    // 2. Validate input
    const validated = schema.parse(data)
    
    // 3. Business logic
    const result = await processData(validated)
    
    // 4. Return response
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ error: "Message" }, { status: 500 })
  }
}
```

### Error Handling
- **Try-catch blocks** - Wrap async operations
- **Typed errors** - Use custom error classes or Zod validation errors
- **User-friendly messages** - Show actionable error messages to users
- **Logging** - Log errors for debugging (use logger utility)

## UI/UX Patterns

### Tailwind CSS Conventions
- **Utility-first** - Use Tailwind utilities directly in JSX
- **Consistent spacing** - Use spacing scale: `gap-2`, `p-4`, `space-y-6`
- **Responsive design** - Mobile-first with breakpoints: `sm:`, `md:`, `lg:`
- **Dark mode** - Use `dark:` prefix for dark mode variants
- **Custom colors** - Use semantic colors: `bg-card`, `text-foreground`, `border-border`
- **Component variants** - Use `class-variance-authority` for component variants

### Component Composition
- **Radix UI primitives** - Use headless components for accessibility
- **shadcn/ui pattern** - Compose UI from primitives with Tailwind styling
- **Compound components** - Related components grouped: `Dialog`, `DialogContent`, `DialogHeader`

### Loading States
```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
```

### Form Handling
- **React Hook Form** - Use for complex forms with validation
- **Zod schemas** - Define validation schemas with Zod
- **Controlled inputs** - Use controlled components with state
- **Optimistic UI** - Update UI immediately, revert on error

## Algorithm & Business Logic

### Mathematical Functions
- **Pure functions** - No side effects, deterministic output
- **Clear algorithms** - Document complex calculations with comments
- **Scoring systems** - Use weighted scoring with configurable weights
- **Normalization** - Normalize scores to 0-100 range for consistency

### Data Processing Patterns
```typescript
// 1. Filter → Map → Reduce pattern
const result = data
  .filter(item => item.isValid)
  .map(item => transform(item))
  .reduce((acc, item) => acc + item.value, 0)

// 2. Grouping with reduce
const grouped = items.reduce((acc, item) => {
  const key = item.category
  acc[key] = acc[key] || []
  acc[key].push(item)
  return acc
}, {} as Record<string, Item[]>)

// 3. Set operations for uniqueness
const uniqueWords = new Set(words)
const intersection = new Set([...set1].filter(x => set2.has(x)))
```

### Similarity & Matching Algorithms
- **Jaccard similarity** - For keyword matching: `intersection.size / union.size`
- **Word overlap** - Count matching words between strings
- **Threshold-based matching** - Use configurable thresholds for fuzzy matching
- **Parent-child relationships** - Check containment and word count for hierarchy

## Performance Optimization

### React Performance
- **Memoization** - Use `useMemo` for expensive computations
- **Callback stability** - Use `useCallback` for event handlers passed to children
- **Component splitting** - Split large components into smaller, focused ones
- **Lazy loading** - Use `React.lazy()` for code splitting
- **Virtual scrolling** - Use for large lists (react-window, @tanstack/react-virtual)

### Bundle Optimization
- **Tree shaking** - Use named imports: `import { Button } from "lucide-react"`
- **Dynamic imports** - Load heavy components on demand
- **Package optimization** - Configure `optimizePackageImports` in next.config.ts
- **Image optimization** - Use `next/image` with proper sizing

## Testing & Quality

### Code Documentation
- **JSDoc comments** - Document complex functions with parameters and return types
- **Inline comments** - Explain "why" not "what" for complex logic
- **Section headers** - Use visual separators for file organization
- **Type documentation** - Document type properties with descriptions

### Validation
- **Zod schemas** - Define schemas for all external data
- **Input validation** - Validate user input before processing
- **Type guards** - Use type predicates for runtime type checking
- **Error boundaries** - Wrap components in error boundaries for graceful failures

## Security Best Practices

### Input Sanitization
- **Validate all inputs** - Use Zod schemas for validation
- **Escape HTML** - Sanitize user-generated content before rendering
- **SQL injection prevention** - Use Prisma ORM with parameterized queries
- **XSS prevention** - Never use `dangerouslySetInnerHTML` without sanitization

### Authentication & Authorization
- **Server-side checks** - Validate auth on server, not just client
- **Middleware protection** - Use Next.js middleware for route protection
- **Session management** - Use Supabase Auth for secure session handling
- **CSRF protection** - Enable CSRF protection on Server Actions

## Common Code Idioms

### Conditional Rendering
```typescript
// Ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// Logical AND for optional rendering
{error && <ErrorMessage />}

// Nullish coalescing for defaults
{title ?? "Default Title"}

// Optional chaining for nested properties
{user?.profile?.avatar}
```

### Array Operations
```typescript
// Filter and map
const active = items.filter(i => i.active).map(i => i.name)

// Find first match
const found = items.find(i => i.id === targetId)

// Check existence
const exists = items.some(i => i.isValid)

// All match condition
const allValid = items.every(i => i.isValid)

// Slice for pagination
const page = items.slice(offset, offset + limit)
```

### Object Manipulation
```typescript
// Spread for immutable updates
const updated = { ...original, name: "New" }

// Destructuring with rename
const { name: userName, email } = user

// Dynamic keys
const obj = { [key]: value }

// Object.entries for iteration
Object.entries(obj).forEach(([key, value]) => {})
```

### Async Patterns
```typescript
// Async/await with error handling
try {
  const result = await fetchData()
  return result
} catch (error) {
  console.error(error)
  throw error
}

// Promise.all for parallel requests
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
])

// Timeout wrapper
const withTimeout = (promise, ms) => 
  Promise.race([promise, new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Timeout")), ms)
  )])
```

## Feature-Specific Patterns

### AI Content Generation
- **Chunked streaming** - Break content into small chunks for typing animation
- **Progress tracking** - Update progress state during generation
- **Abort functionality** - Use ref-based abort flag for cancellation
- **Word counting** - Strip HTML and count words for metrics

### Keyword Analysis
- **Root topic extraction** - Remove modifiers to find core topic
- **Intent detection** - Use regex patterns for keyword intent classification
- **Similarity scoring** - Jaccard similarity for keyword matching
- **Hierarchical relationships** - Parent-child detection based on containment

### Form Validation
- **Real-time validation** - Show validation state as user types
- **Visual feedback** - Use icons (Check/X) for validation status
- **Password strength** - Multiple criteria with individual indicators
- **Confirmation matching** - Validate password/email confirmation matches

## Configuration Management

### Environment Variables
- **Type-safe env** - Validate env vars with Zod in `config/env.ts`
- **Public prefix** - Use `NEXT_PUBLIC_` for client-side variables
- **Defaults** - Provide sensible defaults for optional variables
- **Documentation** - Document all env vars in `.env.example`

### Feature Flags
```typescript
// config/feature-flags.ts
export const FEATURES = {
  AI_WRITER: true,
  BETA_FEATURES: process.env.NODE_ENV === "development",
  MOCK_MODE: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
} as const
```

### Constants Organization
- **Centralized constants** - Keep constants in dedicated files
- **Typed constants** - Use `as const` for literal type inference
- **Grouped by domain** - Organize constants by feature/domain
- **Reusable options** - Extract common options (currencies, timezones) for reuse
