# 🔍 BlogSpy - Modern SEO SaaS Platform

> Enterprise-grade SEO dashboard for keyword research, rank tracking, and content optimization.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)

## ✨ Features

### 🔑 Keyword Research
- **Keyword Magic** - Discover thousands of keyword ideas with volume, difficulty, CPC
- **Keyword Overview** - Deep dive into any keyword with SERP analysis
- **Trend Spotter** - Find emerging topics before they peak

### 📊 Rank Tracking
- **Rank Tracker** - Monitor keyword positions across search engines
- **Competitor Gap** - Find untapped keyword opportunities
- **Content Decay** - Identify declining content for updates

### ✍️ Content Tools
- **AI Writer** - Generate SEO-optimized content with AI
- **On-Page Checker** - Analyze pages for SEO issues
- **Snippet Stealer** - Optimize for featured snippets

### 🗺️ Content Strategy
- **Topic Clusters** - Build semantic content clusters
- **Content Roadmap** - Plan your content calendar

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui |
| State | Zustand |
| Database | PostgreSQL (Prisma ORM) |
| Auth | Clerk |
| Payments | Stripe |
| SEO Data | DataForSEO API |
| Deployment | Vercel |

## 📁 Project Structure

```
blogspy-saas/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (marketing)/       # Marketing pages (blog, features)
│   ├── api/               # API routes
│   └── dashboard/         # Protected dashboard routes
│
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── features/          # Feature components (organized by domain)
│   ├── layout/            # Layout components (sidebar, nav)
│   ├── charts/            # Chart components
│   ├── common/            # Shared components
│   └── forms/             # Form components
│
├── lib/                   # Utilities & helpers
├── services/              # API service layer
├── types/                 # TypeScript types
├── config/                # App configuration
├── store/                 # Zustand stores
├── hooks/                 # Custom React hooks
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/blogspy-saas.git
cd blogspy-saas

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Setup database
pnpm db:push
pnpm db:generate

# Start development server
pnpm dev
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# SEO Data
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm type-check` | Run TypeScript check |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |

## 🔒 Security

- Middleware-based route protection
- Security headers (HSTS, XSS, etc.)
- Rate limiting on API routes
- Input validation with Zod

## 📈 Performance

- React Server Components
- Optimized images with next/image
- Code splitting & lazy loading
- Turbopack for fast builds

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

Private - All rights reserved.

---

Built with ❤️ by BlogSpy Team
