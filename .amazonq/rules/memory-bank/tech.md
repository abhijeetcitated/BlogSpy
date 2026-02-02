# Technology Stack

## Core Framework
- **Next.js 16.1.1** - React framework with App Router, Server Components, and Turbopack
- **React 19.2.3** - UI library with React Compiler for automatic memoization
- **TypeScript 5** - Static type checking with strict mode enabled
- **Node.js 18+** - Runtime environment

## Styling & UI
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **@tailwindcss/postcss** - PostCSS integration
- **tailwindcss-animate** - Animation utilities
- **Radix UI** - Headless UI component primitives:
  - Dialog, Dropdown Menu, Select, Tabs, Tooltip
  - Accordion, Alert Dialog, Checkbox, Switch
  - Popover, Progress, Radio Group, Slider
  - Avatar, Label, Separator, Scroll Area
- **shadcn/ui** - Pre-built accessible components
- **Lucide React 0.454.0** - Icon library
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class utilities

## State Management
- **Zustand 5.0.9** - Lightweight state management
- **@tanstack/react-query 5.90.16** - Server state management and caching
- **@tanstack/react-query-devtools** - Query debugging tools
- **React Hook Form 7.60.0** - Form state management
- **@hookform/resolvers** - Form validation resolvers

## Database & ORM
- **PostgreSQL** - Primary database (hosted on Supabase)
- **Prisma 6.19.1** - Type-safe ORM and query builder
- **@prisma/client** - Prisma client for database access
- **Supabase** - Backend-as-a-Service:
  - `@supabase/supabase-js 2.89.0` - JavaScript client
  - `@supabase/ssr 0.8.0` - Server-side rendering support

## Authentication & Security
- **Supabase Auth** - Authentication provider
- **Arcjet 1.0.0-beta.15** - Bot protection and security:
  - `@arcjet/next` - Next.js integration
  - `@arcjet/inspect` - Security inspection tools
- **Upstash Redis** - Distributed caching and rate limiting:
  - `@upstash/redis 1.36.1` - Redis client
  - `@upstash/ratelimit 2.0.8` - Rate limiting library
- **Zod 4.3.4** - Schema validation and type safety
- **next-safe-action 8.0.11** - Type-safe Server Actions with validation

## External APIs & Integrations
- **DataForSEO API** - SEO data provider (keyword research, SERP analysis, rank tracking)
- **OpenAI 6.15.0** - AI content generation
- **Stripe** - Payment processing (via custom integration)
- **Lemon Squeezy 4.0.0** - Alternative payment provider
- **YouTube API** - Video data integration
- **RapidAPI** - TikTok data integration

## Data Visualization
- **Recharts 2.15.4** - Chart library built on D3
- **@tanstack/react-table 8.21.3** - Headless table library
- **d3-scale 4.0.2** - D3 scaling utilities
- **react-simple-maps 3.0.0** - Geographic map visualization

## Rich Text Editing
- **Tiptap 3.13.0** - Headless rich text editor:
  - `@tiptap/react` - React integration
  - `@tiptap/starter-kit` - Essential extensions
  - `@tiptap/extension-placeholder` - Placeholder support
  - `@tiptap/extension-image` - Image handling
  - `@tiptap/extension-bubble-menu` - Floating menu
  - `@tiptap/pm` - ProseMirror core

## Utilities & Helpers
- **Axios 1.13.2** - HTTP client
- **date-fns 4.1.0** - Date manipulation library
- **Cheerio 1.1.2** - HTML parsing and scraping
- **robots-parser 3.0.1** - robots.txt parsing
- **server-only 0.0.1** - Server-only code enforcement
- **Sonner 1.7.4** - Toast notifications
- **react-resizable-panels 2.1.7** - Resizable panel layouts
- **next-themes 0.4.6** - Theme management (dark/light mode)

## Development Tools
- **ESLint 9.39.2** - Code linting
- **eslint-config-next** - Next.js ESLint configuration
- **Playwright 1.57.0** - E2E testing framework
- **@vercel/analytics 1.6.1** - Analytics integration
- **babel-plugin-react-compiler 1.0.0** - React 19 compiler plugin

## Build & Deployment
- **Turbopack** - Next.js 16 default bundler (faster than Webpack)
- **PostCSS 8.5** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixing
- **Vercel** - Deployment platform (configured via vercel.json)

## Package Manager
- **npm** - Default package manager (with package-lock.json)
- **pnpm** - Recommended alternative (faster, more efficient)

## Development Scripts

### Core Commands
```bash
npm run dev              # Start development server (Turbopack)
npm run dev:fresh        # Clean .next and start dev server
npm run build            # Production build with Prisma generation
npm run start            # Start production server
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint errors
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Database
```bash
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client
npm run db:seed          # Seed database
```

### Testing
```bash
npm run test             # Run unit tests (placeholder)
npm run test:watch       # Watch mode (placeholder)
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode
```

### Utilities
```bash
npm run clean            # Clean .next and cache
npm run clean:all        # Clean all build artifacts
npm run analyze          # Bundle analysis
npm run tree:generate    # Generate project tree
```

## Environment Variables
Required environment variables (see `.env.local`):
- `NEXT_PUBLIC_APP_URL` - Application URL
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (non-pooled)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `DATAFORSEO_LOGIN` - DataForSEO API username
- `DATAFORSEO_PASSWORD` - DataForSEO API password
- `NEXT_PUBLIC_ARCJET_KEY` - Arcjet security key
- `NEXT_PUBLIC_USE_MOCK_DATA` - Mock mode toggle (true/false)
- `BYPASS_CREDITS` - Bypass credit checks (development)

## Performance Optimizations
- **React Compiler** - Automatic memoization (React 19)
- **Turbopack** - Fast bundler with HMR
- **Optimized Package Imports** - Tree-shaking for large libraries
- **Image Optimization** - next/image with AVIF/WebP support
- **Code Splitting** - Automatic route-based splitting
- **Server Components** - Reduced client-side JavaScript
- **React Taint API** - Prevent sensitive data leaks

## Security Features
- **CSRF Protection** - Server Actions with origin validation
- **Security Headers** - HSTS, XSS, CSP, X-Frame-Options
- **Rate Limiting** - Upstash Redis + Arcjet
- **Bot Protection** - Arcjet integration
- **Input Validation** - Zod schemas on all inputs
- **Type Safety** - TypeScript strict mode
