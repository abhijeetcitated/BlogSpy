# Project Structure

## Architecture Overview
BlogSpy follows Next.js 16 App Router architecture with a feature-based organization pattern. The codebase uses TypeScript, React Server Components, and a modular design for scalability.

## Root Directory Structure

```
blogspy-saas/
├── src/                    # Application source code
├── prisma/                 # Database schema and migrations
├── supabase/              # Supabase migrations and configuration
├── public/                # Static assets (images, icons, fonts)
├── docs/                  # Technical documentation and audit reports
├── plans/                 # Feature planning and implementation guides
├── scripts/               # Build and utility scripts
├── tests/                 # E2E tests (Playwright)
└── .amazonq/              # Amazon Q rules and memory bank
```

## Source Code Organization (`src/`)

### Application Routes (`src/app/`)
Next.js App Router with route groups for logical separation:

- **(auth)/** - Authentication routes (login, register, password reset)
- **(marketing)/** - Public marketing pages (landing, features, pricing, blog)
- **dashboard/** - Main dashboard and overview
- **api/** - API routes and server endpoints
- **Feature Routes** - Individual feature pages:
  - `keyword-magic/` - Keyword research interface
  - `keyword-overview/` - Individual keyword analysis
  - `rank-tracker/` - Rank tracking dashboard
  - `competitor-gap/` - Competitor analysis
  - `content-decay/` - Content decay monitoring
  - `ai-writer/` - AI content generation
  - `on-page-checker/` - SEO audit tool
  - `snippet-stealer/` - Featured snippet optimizer
  - `topic-clusters/` - Content cluster builder
  - `trend-spotter/` - Trending keyword discovery
  - `content-roadmap/` - Content planning calendar
  - `settings/` - User settings and preferences

### Feature Modules (`src/features/`)
Domain-driven feature organization with self-contained modules:

```
features/
├── keyword-research/      # Keyword discovery and analysis
├── rank-tracker/          # Position tracking
├── competitor-gap/        # Competitor analysis
├── content-decay/         # Content performance monitoring
├── ai-writer/            # AI content generation
├── on-page-checker/      # SEO auditing
├── snippet-stealer/      # Featured snippet optimization
├── topic-clusters/       # Content clustering
├── trend-spotter/        # Trend detection
├── video-hijack/         # Video keyword opportunities
├── citation-checker/     # Brand mention tracking
├── schema-generator/     # Structured data creation
├── dashboard/            # Dashboard widgets
├── settings/             # Settings components
└── [30+ feature modules]
```

Each feature module typically contains:
- `components/` - React components specific to the feature
- `hooks/` - Custom React hooks
- `utils/` - Utility functions and helpers
- `types/` - TypeScript type definitions
- `constants/` - Feature-specific constants
- `services/` - API service layer

### Components (`src/components/`)
Shared UI components organized by purpose:

- **ui/** - shadcn/ui base components (Button, Dialog, Input, etc.)
- **charts/** - Recharts visualization components
- **shared/** - Reusable business components
- **icons/** - Custom icon components
- **security/** - Security-related components

### Core Infrastructure

#### Libraries (`src/lib/`)
Core utilities and integrations:
- **auth/** - Authentication utilities (Supabase Auth)
- **supabase/** - Supabase client configuration
- **dataforseo/** - DataForSEO API integration
- **payments/** - Stripe payment processing
- **credits/** - Credit system management
- **ai/** - OpenAI integration
- **seo/** - SEO utilities and helpers
- **api/** - API client and utilities
- **dal/** - Data Access Layer
- **alerts/** - Alert system

#### Services (`src/services/`)
API service layer for external integrations:
- `dataforseo/` - SEO data provider services
- `auth.service.ts` - Authentication services
- `stripe.service.ts` - Payment services
- `supabase.service.ts` - Database services
- `alerts.service.ts` - Notification services

#### State Management (`src/store/`)
Zustand stores for global state:
- `keyword-store.ts` - Keyword research state
- `user-store.ts` - User session state
- `ui-store.ts` - UI state (modals, drawers)

#### Types (`src/types/`)
TypeScript type definitions:
- `api.ts` - API response types
- `user.ts` - User and profile types
- `db.types.ts` - Database schema types
- `alerts.types.ts` - Alert system types
- `shared/` - Shared type definitions

#### Hooks (`src/hooks/`)
Custom React hooks:
- `use-auth.ts` - Authentication hook
- `use-user.ts` - User data hook
- `use-api.ts` - API request hook
- `use-debounce.ts` - Debounce utility
- `use-mobile.ts` - Responsive design hook

#### Configuration (`src/config/`)
Application configuration:
- `site.config.ts` - Site metadata and settings
- `routes.ts` - Route definitions
- `constants.ts` - Global constants
- `feature-flags.ts` - Feature flag configuration
- `locations.ts` - Geographic location data
- `env.ts` - Environment variable validation

## Database Layer

### Prisma (`prisma/`)
- `schema.prisma` - Database schema definition with models for users, keywords, ranks, credits

### Supabase (`supabase/migrations/`)
SQL migrations for:
- Core security and bot defense
- User profiles and authentication
- Billing and credits system
- Keyword cache system
- Refund logic
- Keyword filter presets
- SERP task management

## Architectural Patterns

### Feature-Based Organization
Each feature is self-contained with its own components, hooks, types, and utilities. This promotes:
- Code colocation
- Easy feature removal/addition
- Clear boundaries
- Independent testing

### Server/Client Component Split
- Server Components for data fetching and SEO
- Client Components for interactivity
- "use client" directive for client-side features

### API Route Structure
- RESTful API routes in `app/api/`
- Server Actions for mutations
- Rate limiting and security middleware

### Data Flow
1. UI Components → Hooks → Services → API Routes
2. API Routes → DataForSEO/Supabase → Response
3. Response → Store/Cache → UI Update

### Security Layers
- Middleware for route protection
- Arcjet for bot protection and rate limiting
- Upstash Redis for distributed rate limiting
- CSRF protection on Server Actions
- Input validation with Zod

## Build Configuration
- **Next.js 16** - App Router with Turbopack
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **ESLint** - Code quality enforcement
- **Playwright** - E2E testing framework
