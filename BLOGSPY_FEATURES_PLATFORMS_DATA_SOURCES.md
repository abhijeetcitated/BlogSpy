# 🚀 BlogSpy SaaS - Complete Features, Platforms & Data Sources Report

> **Generated:** December 27, 2025  
> **Total Features:** 27  
> **Total External Platforms:** 15+  
> **Total Data Sources:** 10+

---

## 📊 EXECUTIVE SUMMARY

| Category | Count |
|----------|-------|
| **Total Features** | 27 |
| **Research Tools** | 8 |
| **Creation Tools** | 4 |
| **Tracking Tools** | 8 |
| **Strategy Tools** | 3 |
| **Monetization Tools** | 2 |
| **Utility Features** | 2 |
| **External APIs Used** | 8 |
| **Platforms Tracked** | 12+ |

---

## 🔌 ALL DATA SOURCES & APIs

### Primary Data Providers

| Provider | Purpose | API Used | Data Provided |
|----------|---------|----------|---------------|
| **DataForSEO** | SEO Data | Keywords API, SERP API, Labs API | Keywords, Rankings, SERP features, Competitors |
| **Google Search Console** | Website Data | GSC API | Clicks, Impressions, CTR, Position, Queries |
| **Google Analytics 4** | Traffic Data | GA4 API | Sessions, Users, Bounce rate, Engagement |
| **YouTube** | Video Data | YouTube Data API v3 | Videos, Channels, Views, Trends |
| **TikTok** | Video Data | TikTok API | Hashtags, Videos, Creators |
| **Stripe** | Payments | Stripe API | Subscriptions, Invoices, Customers |
| **Clerk** | Authentication | Clerk API | Users, Sessions, OAuth |
| **Supabase** | Database | Supabase SDK | All app data storage |

### AI Platforms Monitored (For AI Visibility)

| Platform | Type | Data Tracked |
|----------|------|--------------|
| **Google AI Overviews** | Search AI | Citations, Mentions, Position |
| **ChatGPT** | LLM | Brand mentions, Recommendations |
| **Gemini** | LLM | Brand mentions, Citations |
| **Perplexity** | AI Search | Citations, Sources |
| **Claude** | LLM | Brand mentions |
| **Microsoft Copilot** | AI Search | Citations, Mentions |

### Search/Social Platforms Tracked (Rank Tracker)

| Platform | Category | Metrics Tracked |
|----------|----------|-----------------|
| **Google** | Search Engine | Organic rank, SERP features, Pixel rank |
| **YouTube** | Video | Video rank, Views, Engagement |
| **Amazon** | E-commerce | Product rank, Reviews |
| **Bing** | Search Engine | Organic rank |
| **Reddit** | Community | Post visibility, Upvotes |
| **TikTok** | Video | Hashtag rank, Views |
| **LinkedIn** | Professional | Post visibility |
| **Pinterest** | Visual | Pin rank, Saves |
| **Twitter/X** | Social | Post visibility |
| **Instagram** | Social | Hashtag visibility |
| **Quora** | Q&A | Answer visibility |

---

## 📋 COMPLETE FEATURE BREAKDOWN

---

## 🔍 CATEGORY 1: RESEARCH TOOLS (8 Features)

### Feature 1: 🔮 Keyword Magic

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/keyword-magic/` |
| **Purpose** | Advanced keyword research with smart filters |
| **Page URL** | `/dashboard/research/keyword-magic` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | Keywords Data API | Search volume, KD, CPC, Intent |
| DataForSEO | Keywords For Site | Domain-based keywords |
| DataForSEO | Related Keywords | Semantic variations |

**Features Provided:**
- ✅ Search volume analysis
- ✅ Keyword difficulty (KD) scoring
- ✅ CPC data for monetization
- ✅ Search intent classification (Informational, Commercial, Transactional, Navigational)
- ✅ Trend data (12-month history)
- ✅ Bulk keyword analysis
- ✅ Advanced filters (volume, KD, CPC, intent)
- ✅ SERP feature detection

**Output Format:**
```typescript
{
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  intent: "informational" | "commercial" | "transactional" | "navigational"
  trend: number[] // 12 months
  competition: "low" | "medium" | "high"
  serpFeatures: string[]
}
```

---

### Feature 2: 📈 Keyword Overview

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/keyword-overview/`, `components/features/keyword-overview/` |
| **Purpose** | Deep analysis of single keyword |
| **Page URL** | `/dashboard/research/overview` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | SERP API | Top 100 results, SERP features |
| DataForSEO | Related Keywords | LSI keywords, questions |
| DataForSEO | Keyword Trends | Historical search data |

**Features Provided:**
- ✅ SERP analysis (top 100 results)
- ✅ Related keywords list
- ✅ People Also Ask questions
- ✅ Search trends visualization
- ✅ Competitor domains analysis
- ✅ Content type breakdown (blog, product, video)
- ✅ SERP features distribution

---

### Feature 3: 🎯 Competitor Gap Analysis

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/competitor-gap/` |
| **Purpose** | Find keyword gaps vs competitors |
| **Page URL** | `/dashboard/research/gap-analysis` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | DataForSEO Labs | Domain comparison, keyword intersections |
| DataForSEO | Keywords For Site | Competitor keywords |
| DataForSEO | SERP API | Ranking positions |

**Features Provided:**
- ✅ Venn diagram visualization
- ✅ Unique keywords (only you rank)
- ✅ Shared keywords (both rank)
- ✅ Missing keywords (only competitor ranks)
- ✅ Weak spots (you rank lower)
- ✅ Opportunity scoring
- ✅ Traffic potential estimation
- ✅ Multi-competitor comparison (up to 5)

**Gap Types:**
| Type | Description | Color |
|------|-------------|-------|
| Unique | Only your domain ranks | 🟢 Green |
| Shared | Both domains rank | 🔵 Blue |
| Missing | Only competitor ranks | 🔴 Red |
| Weak | You rank but lower | 🟡 Yellow |

---

### Feature 4: 📊 Trend Spotter

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/trend-spotter/`, `components/features/trend-spotter/` |
| **Purpose** | Discover viral & trending topics |
| **Page URL** | `/dashboard/research/trends` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | Google Trends API | Trending searches |
| YouTube | Data API v3 | Trending videos |
| TikTok | Hashtag API | Viral hashtags |
| Reddit | API | Hot posts |

**Features Provided:**
- ✅ Real-time trending topics
- ✅ Viral content detection
- ✅ Trend velocity scoring
- ✅ Seasonal pattern analysis
- ✅ Category filtering
- ✅ Geographic trends
- ✅ Trend prediction algorithm
- ✅ Early adopter alerts

---

### Feature 5: 🎬 Video Hijack Indicator

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/video-hijack/` |
| **Purpose** | Find video carousel opportunities in SERPs |
| **Page URL** | `/dashboard/research/video-hijack` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | SERP API | Video carousel presence |
| YouTube | Data API v3 | Video metadata, views, engagement |
| TikTok | API | Short-form video data |

**Features Provided:**
- ✅ Video carousel detection in SERPs
- ✅ Hijack opportunity score (0-100)
- ✅ Competitor video analysis
- ✅ Video presence level (dominant/significant/moderate/minimal/none)
- ✅ Viral potential assessment
- ✅ Optimal video length recommendation
- ✅ Platform-specific opportunities (YouTube vs TikTok)

**Video Presence Levels:**
| Level | % of SERP | Opportunity |
|-------|-----------|-------------|
| Dominant | >50% | Low (saturated) |
| Significant | 30-50% | Medium |
| Moderate | 15-30% | High |
| Minimal | 5-15% | Very High |
| None | <5% | Maximum |

---

### Feature 6: 📰 News Tracker

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/news-tracker/` |
| **Purpose** | Monitor news carousel rankings |
| **Page URL** | `/dashboard/tracking/news-tracker` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | SERP API | News carousel, Top Stories |
| Google News | Scraping/API | News articles |

**Features Provided:**
- ✅ News carousel detection
- ✅ Top Stories monitoring
- ✅ News publisher tracking
- ✅ Breaking news alerts
- ✅ Competitor news coverage
- ✅ News freshness scoring

---

### Feature 7: 🔍 Citation Checker ("Am I Cited?")

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/citation-checker/`, `lib/citation-analyzer.ts` |
| **Purpose** | Check if domain is cited in AI Overviews |
| **Page URL** | `/dashboard/research/citation-checker` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | SERP API | AI Overview presence |
| Custom Scraper | - | AI Overview citations |
| Google | Search API | AI Overview content |

**Features Provided:**
- ✅ Bulk keyword citation check
- ✅ Citation position tracking
- ✅ Competitor citation comparison
- ✅ Citation trend over time
- ✅ Cited content analysis
- ✅ Optimization recommendations

**Citation Statuses:**
| Status | Description |
|--------|-------------|
| ✅ Cited | Your domain is directly cited |
| ⚠️ Partial | Mentioned but not linked |
| ❌ Not Cited | Not in AI Overview |
| 🔵 No AI Overview | Query has no AI Overview |

---

### Feature 8: 🏪 Affiliate Finder

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/affiliate-finder/` |
| **Purpose** | Discover affiliate program opportunities |
| **Page URL** | `/dashboard/research/affiliate-finder` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| Affiliate Networks | Various APIs | Program details, commission rates |
| DataForSEO | SERP API | Affiliate-related keywords |
| Custom Database | Internal | Program database |

**Features Provided:**
- ✅ Affiliate program discovery
- ✅ Commission rate comparison
- ✅ Cookie duration info
- ✅ Niche-specific programs
- ✅ Keyword monetization potential
- ✅ Revenue estimation

---

## ✍️ CATEGORY 2: CREATION TOOLS (4 Features)

### Feature 9: ✍️ AI Writer

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/ai-writer/` |
| **Purpose** | AI-powered content creation with SEO optimization |
| **Page URL** | `/dashboard/creation/ai-writer` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| OpenAI | GPT-4 API | Content generation |
| DataForSEO | Keywords API | Target keyword data |
| DataForSEO | SERP API | Competitor content analysis |
| NLP API | Various | Readability scoring |

**Features Provided:**
- ✅ AI content generation
- ✅ TipTap rich text editor
- ✅ Real-time SEO scoring (0-100)
- ✅ NLP optimization suggestions
- ✅ Outline generation
- ✅ Competitor content analysis
- ✅ Keyword density checker
- ✅ Readability scoring (Flesch-Kincaid)
- ✅ Word count tracking
- ✅ Internal linking suggestions

**SEO Score Components:**
| Factor | Weight | Measurement |
|--------|--------|-------------|
| Title Optimization | 15% | Keyword presence, length |
| Meta Description | 10% | Length, keyword, CTR elements |
| Keyword Density | 20% | 1-3% optimal |
| Readability | 15% | Flesch score |
| Content Length | 15% | vs competitor average |
| Headings | 10% | H1-H6 structure |
| Internal Links | 10% | Quantity & relevance |
| Images | 5% | Alt tags, optimization |

---

### Feature 10: 🔍 On-Page Checker

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/on-page-checker/` |
| **Purpose** | Complete on-page SEO audit |
| **Page URL** | `/dashboard/creation/on-page` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | On-Page API | Page analysis |
| Custom Crawler | Internal | DOM analysis |
| Google PageSpeed | Insights API | Core Web Vitals |

**Features Provided:**
- ✅ Title tag analysis (length, keywords)
- ✅ Meta description audit
- ✅ Heading structure (H1-H6)
- ✅ Content analysis (word count, readability)
- ✅ Image optimization (alt tags, size)
- ✅ Internal link analysis
- ✅ External link analysis
- ✅ Broken link detection
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Mobile-friendliness
- ✅ Schema markup detection
- ✅ Page speed score

**Audit Categories:**
| Category | Checks |
|----------|--------|
| **Title** | Length (50-60 chars), keyword position, uniqueness |
| **Meta** | Length (150-160 chars), keyword, CTA |
| **Headings** | H1 presence, hierarchy, keyword usage |
| **Content** | Word count, readability, keyword density |
| **Images** | Alt tags, file size, format |
| **Links** | Internal count, external count, broken |
| **Technical** | Load time, mobile, CWV, HTTPS |

---

### Feature 11: 🥇 Snippet Stealer

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/snippet-stealer/` |
| **Purpose** | Analyze & steal featured snippets |
| **Page URL** | `/dashboard/creation/snippet-stealer` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | SERP API | Featured snippet data |
| Custom Analyzer | Internal | Snippet structure analysis |

**Features Provided:**
- ✅ Featured snippet detection
- ✅ Current snippet holder analysis
- ✅ Snippet type identification
- ✅ Optimal format recommendation
- ✅ Content template generation
- ✅ Competitor snippet comparison

**Snippet Types Supported:**
| Type | Format | Optimization |
|------|--------|--------------|
| 📝 Paragraph | 40-60 words | Direct answer format |
| 📋 List | Ordered/Unordered | Step-by-step or bullet points |
| 📊 Table | Rows/Columns | Comparison data |
| 🎬 Video | YouTube | Timestamp chapters |

---

### Feature 12: 📜 Schema Generator

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/schema-generator/` |
| **Purpose** | Generate structured data markup |
| **Page URL** | `/dashboard/creation/schema-generator` |

**Data Sources:**
| Source | Data |
|--------|------|
| Schema.org | Schema definitions |
| Google | Rich result requirements |

**Features Provided:**
- ✅ JSON-LD generation
- ✅ Multiple schema types
- ✅ Validation
- ✅ Copy-paste ready code
- ✅ Rich result preview

**Schema Types Supported:**
| Type | Use Case |
|------|----------|
| Article | Blog posts, news |
| Product | E-commerce |
| FAQ | Q&A pages |
| HowTo | Tutorial content |
| Recipe | Food content |
| LocalBusiness | Local SEO |
| Organization | Company info |
| Person | Author pages |
| Event | Events |
| Review | Product reviews |

---

## 📊 CATEGORY 3: TRACKING TOOLS (8 Features)

### Feature 13: 📍 Rank Tracker (Multi-Platform)

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/rank-tracker/`, `services/rank-tracker.service.ts` |
| **Purpose** | Track rankings across 8+ platforms |
| **Page URL** | `/dashboard/tracking/rank-tracker` |

**Data Sources:**
| Platform | API | Data Retrieved |
|----------|-----|----------------|
| **Google** | DataForSEO SERP API | Position, URL, SERP features |
| **YouTube** | YouTube Data API | Video rank, views, engagement |
| **Amazon** | DataForSEO Amazon API | Product rank, reviews |
| **Bing** | DataForSEO Bing API | Position, features |
| **Reddit** | Reddit API | Post visibility, karma |
| **TikTok** | TikTok API | Hashtag rank, views |
| **LinkedIn** | LinkedIn API | Post visibility |
| **Pinterest** | Pinterest API | Pin rank, saves |

**Features Provided:**
- ✅ Multi-platform rank tracking
- ✅ Daily/Weekly/Monthly tracking
- ✅ Position change alerts
- ✅ SERP feature detection (15+ types)
- ✅ AI Overview presence tracking
- ✅ Pixel rank (above-the-fold position)
- ✅ Historical trend charts
- ✅ Competitor rank comparison
- ✅ Bulk keyword import
- ✅ Custom tagging & grouping
- ✅ Ranking URL tracking
- ✅ Local rank tracking (by city/country)

**SERP Features Tracked:**
| Feature | Icon | Description |
|---------|------|-------------|
| Featured Snippet | 🎯 | Position zero |
| People Also Ask | ❓ | Question boxes |
| Local Pack | 📍 | Map results |
| Shopping | 🛒 | Product listings |
| Video | 🎬 | Video carousel |
| Images | 🖼️ | Image pack |
| Knowledge Panel | 📚 | Info box |
| Site Links | 🔗 | Sub-links |
| Top Stories | 📰 | News carousel |
| Reviews | ⭐ | Star ratings |
| Ads | 💰 | Paid results |
| AI Overview | 🤖 | Google SGE |

**Platforms Summary:**
```
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORMS TRACKED                         │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│   SEARCH    │    VIDEO    │  E-COMMERCE │     SOCIAL        │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│ Google      │ YouTube     │ Amazon      │ Reddit            │
│ Bing        │ TikTok      │             │ LinkedIn          │
│             │             │             │ Pinterest         │
│             │             │             │ Twitter/X         │
└─────────────┴─────────────┴─────────────┴───────────────────┘
```

---

### Feature 14: 🤖 AI Visibility Tracker

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/ai-visibility/`, `app/dashboard/tracking/ai-visibility/` |
| **Purpose** | Track brand visibility in AI platforms |
| **Page URL** | `/dashboard/tracking/ai-visibility` |

**Data Sources:**
| AI Platform | Method | Data Retrieved |
|-------------|--------|----------------|
| **Google AI Overviews** | DataForSEO + Custom | Citations, position, content |
| **ChatGPT** | API Queries | Brand mentions, recommendations |
| **Gemini** | API Queries | Citations, mentions |
| **Perplexity** | API Queries | Source citations |
| **Claude** | API Queries | Brand mentions |
| **Microsoft Copilot** | API Queries | Citations |

**Features Provided:**
- ✅ AI citation monitoring
- ✅ Brand mention tracking
- ✅ Recommendation tracking
- ✅ Competitor AI visibility comparison
- ✅ AI Share of Voice
- ✅ Citation position analysis
- ✅ Trend tracking over time
- ✅ Alert on visibility changes

**Tracked Metrics:**
| Metric | Description |
|--------|-------------|
| **Citation Count** | Times domain is cited |
| **Mention Count** | Brand name mentions |
| **Recommendation Score** | How often recommended |
| **AI Share of Voice** | vs competitors |
| **Position** | Where in AI response |
| **Sentiment** | Positive/Negative/Neutral |

---

### Feature 15: 📉 Content Decay Tracker

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/content-decay/`, `services/decay-detection.service.ts` |
| **Purpose** | Detect declining content performance |
| **Page URL** | `/dashboard/tracking/decay` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| **Google Search Console** | GSC API | Clicks, impressions, CTR, position |
| **Google Analytics 4** | GA4 API | Sessions, engagement, bounce rate |
| **Rank Tracker** | Internal | Position changes |

**Features Provided:**
- ✅ Automatic decay detection
- ✅ Multi-factor decay scoring
- ✅ Priority-based recommendations
- ✅ Historical performance charts
- ✅ Content refresh suggestions
- ✅ Competitor content comparison
- ✅ Decay prediction algorithm

**Decay Factors:**
| Factor | Weight | Measurement |
|--------|--------|-------------|
| Traffic Decay | 30% | % decline in clicks |
| Position Decay | 25% | Ranking drop |
| CTR Decay | 20% | Click-through decline |
| Engagement Decay | 15% | Time on page, bounce |
| Freshness | 10% | Days since update |

**Decay Severity Levels:**
| Level | Score | Action |
|-------|-------|--------|
| 🟢 NONE | 0-20 | Monitor |
| 🟡 LOW | 21-40 | Schedule review |
| 🟠 MEDIUM | 41-60 | Update soon |
| 🔴 HIGH | 61-80 | Priority update |
| ⚫ CRITICAL | 81-100 | Immediate action |

---

### Feature 16: 🔄 Cannibalization Detector

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/cannibalization/`, `lib/cannibalization-analyzer.ts` |
| **Purpose** | Find keyword cannibalization issues |
| **Page URL** | `/dashboard/tracking/cannibalization` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| Google Search Console | GSC API | Queries, pages, impressions |
| DataForSEO | SERP API | Ranking URLs per keyword |
| Internal | Rank Tracker | Multiple URL rankings |

**Features Provided:**
- ✅ Automatic cannibalization detection
- ✅ Page overlap analysis
- ✅ Primary page identification
- ✅ Consolidation recommendations
- ✅ Traffic impact estimation
- ✅ Fix priority scoring

**Cannibalization Types:**
| Type | Description | Severity |
|------|-------------|----------|
| **Exact** | Same keyword targeted | High |
| **Semantic** | Similar meaning keywords | Medium |
| **Partial** | Overlapping keyword phrases | Low |

---

### Feature 17: 📱 Social Tracker

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/social-tracker/`, `services/social-tracker.service.ts` |
| **Purpose** | Track social media visibility |
| **Page URL** | `/dashboard/tracking/social-tracker` |

**Data Sources:**
| Platform | API | Data Retrieved |
|----------|-----|----------------|
| Pinterest | Pinterest API | Pin visibility, saves, clicks |
| Twitter/X | X API | Post visibility, engagement |
| Instagram | Graph API | Hashtag visibility |
| LinkedIn | LinkedIn API | Post reach |

**Features Provided:**
- ✅ Multi-platform tracking
- ✅ Hashtag ranking
- ✅ Engagement metrics
- ✅ Competitor social comparison
- ✅ Best posting time analysis
- ✅ Viral content detection

---

### Feature 18: 🛒 Commerce Tracker

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/commerce-tracker/` |
| **Purpose** | Track e-commerce SERP visibility |
| **Page URL** | `/dashboard/tracking/commerce-tracker` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | Google Shopping API | Product listings |
| DataForSEO | SERP API | Shopping carousel |
| Amazon | Product Advertising API | Amazon listings |

**Features Provided:**
- ✅ Shopping carousel monitoring
- ✅ Product listing tracking
- ✅ Price comparison
- ✅ Competitor product analysis
- ✅ Buy Box tracking
- ✅ Review monitoring

---

### Feature 19: 💬 Community Tracker

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/community-tracker/` |
| **Purpose** | Track forum/community visibility |
| **Page URL** | `/dashboard/tracking/community-tracker` |

**Data Sources:**
| Platform | API | Data Retrieved |
|----------|-----|----------------|
| Reddit | Reddit API | Subreddit visibility, karma |
| Quora | Quora API | Answer visibility |
| Forums | Custom scraping | Thread visibility |

**Features Provided:**
- ✅ Reddit visibility tracking
- ✅ Quora answer tracking
- ✅ Forum mention monitoring
- ✅ Brand mention alerts
- ✅ Community sentiment analysis

---

### Feature 20: 🔔 Notifications/Alerts

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/notifications/`, `services/alerts.service.ts` |
| **Purpose** | Alert system for all tracking |
| **Page URL** | `/dashboard/settings/notifications` |

**Delivery Channels:**
| Channel | Integration | Use Case |
|---------|-------------|----------|
| Email | Resend/SendGrid | Daily digests, critical alerts |
| In-App | Internal | Real-time notifications |
| Slack | Slack API | Team notifications |
| Webhook | Custom | Integration with other tools |

**Alert Types:**
| Category | Alerts |
|----------|--------|
| **Rankings** | Position drop >5, New #1, Lost top 10 |
| **Content** | Decay detected, Cannibalization found |
| **Competitors** | New competitor ranking, Competitor drops |
| **Opportunities** | New featured snippet, AI Overview available |
| **AI Visibility** | Citation gained/lost, Mention changes |

---

## 🗺️ CATEGORY 4: STRATEGY TOOLS (3 Features)

### Feature 21: 🗂️ Topic Clusters

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/topic-clusters/` |
| **Purpose** | Organize content into semantic clusters |
| **Page URL** | `/dashboard/strategy/topic-clusters` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| DataForSEO | Related Keywords | Semantic relationships |
| NLP API | Various | Topic modeling |
| Internal | Clustering Algorithm | Keyword grouping |

**Features Provided:**
- ✅ Automatic keyword clustering
- ✅ Pillar page identification
- ✅ Supporting content mapping
- ✅ Network graph visualization
- ✅ Internal linking suggestions
- ✅ Content gap detection
- ✅ Cluster strength scoring

**Cluster Structure:**
```
┌─────────────────────────────────────────┐
│              PILLAR PAGE                │
│         (Main topic keyword)            │
└──────────────────┬──────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌───────┐    ┌───────┐    ┌───────┐
│Cluster│    │Cluster│    │Cluster│
│   A   │    │   B   │    │   C   │
└───────┘    └───────┘    └───────┘
```

---

### Feature 22: 📅 Content Calendar

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/content-calendar/` |
| **Purpose** | Plan and schedule content |
| **Page URL** | `/dashboard/research/content-calendar` |

**Data Sources:**
| Source | Data |
|--------|------|
| Internal | Keyword research data |
| Topic Clusters | Cluster priorities |
| Trend Spotter | Trending topics |

**Features Provided:**
- ✅ Drag-drop scheduling
- ✅ Content type assignment
- ✅ Priority tagging
- ✅ Team assignment
- ✅ Status tracking
- ✅ Calendar export (iCal)
- ✅ Deadline reminders

---

### Feature 23: 🛤️ Content Roadmap

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/content-roadmap/` |
| **Purpose** | Strategic content planning |
| **Page URL** | `/dashboard/strategy/roadmap` |

**Data Sources:**
| Source | Data |
|--------|------|
| Keyword Magic | Keyword opportunities |
| Competitor Gap | Missing content |
| Content Decay | Refresh priorities |
| Topic Clusters | Cluster gaps |

**Features Provided:**
- ✅ Priority scoring algorithm
- ✅ Timeline/Kanban view
- ✅ Traffic potential estimation
- ✅ Effort estimation
- ✅ ROI prediction
- ✅ Quarterly planning

---

## 💰 CATEGORY 5: MONETIZATION TOOLS (2 Features)

### Feature 24: 💵 Content ROI Calculator

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/content-roi/` |
| **Purpose** | Calculate content investment return |
| **Page URL** | `/dashboard/monetization/content-roi` |

**Data Sources:**
| Source | API | Data Retrieved |
|--------|-----|----------------|
| Google Analytics 4 | GA4 API | Traffic, conversions |
| Google Search Console | GSC API | Organic traffic |
| Internal | Cost data | Content production costs |

**Features Provided:**
- ✅ Traffic value calculation
- ✅ Conversion tracking
- ✅ Cost per acquisition
- ✅ Lifetime value estimation
- ✅ Content performance ranking
- ✅ ROI comparison charts

**ROI Metrics:**
| Metric | Formula |
|--------|---------|
| **Traffic Value** | Monthly Traffic × CPC |
| **Content ROI** | (Revenue - Cost) / Cost × 100 |
| **Payback Period** | Cost / Monthly Revenue |

---

### Feature 25: 🧮 Earnings Calculator

| Aspect | Details |
|--------|---------|
| **Location** | `app/dashboard/monetization/earnings-calculator/` |
| **Purpose** | Estimate potential blog earnings |
| **Page URL** | `/dashboard/monetization/earnings-calculator` |

**Data Sources:**
| Source | Data |
|--------|------|
| Industry Benchmarks | CPM rates, conversion rates |
| User Input | Traffic, niche, monetization method |

**Features Provided:**
- ✅ Ad revenue estimation
- ✅ Affiliate earnings prediction
- ✅ Product sales projection
- ✅ Sponsorship value calculation
- ✅ Multiple monetization model comparison

---

## ⚙️ CATEGORY 6: UTILITY FEATURES (2 Features)

### Feature 26: ⌨️ Command Palette

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/command-palette/` |
| **Purpose** | Quick navigation & actions (⌘K) |
| **Trigger** | `Cmd+K` or `Ctrl+K` |

**Features Provided:**
- ✅ Global search
- ✅ Quick navigation
- ✅ Keyboard shortcuts
- ✅ Recent searches
- ✅ Quick actions
- ✅ Fuzzy matching

---

### Feature 27: ⚙️ Settings

| Aspect | Details |
|--------|---------|
| **Location** | `src/features/settings/`, `components/features/settings/` |
| **Purpose** | User preferences & account management |
| **Page URL** | `/dashboard/settings` |

**Sections:**
| Section | Features |
|---------|----------|
| **Profile** | Name, email, avatar |
| **Billing** | Plan, invoices, payment method |
| **API Keys** | DataForSEO, Google OAuth |
| **Integrations** | GSC, GA4, Slack |
| **Notifications** | Email preferences, alerts |
| **Team** | Member management (Enterprise) |

---

## 🏗️ INFRASTRUCTURE & SERVICES

### Core Services Layer

| Service File | Purpose | External Dependencies |
|--------------|---------|----------------------|
| `keywords.service.ts` | Keyword research | DataForSEO |
| `rankings.service.ts` | Basic rankings | DataForSEO |
| `rank-tracker.service.ts` | Multi-platform tracking | DataForSEO, YouTube, TikTok |
| `content.service.ts` | Content analysis | DataForSEO, NLP |
| `trends.service.ts` | Trend detection | DataForSEO, Google Trends |
| `decay-detection.service.ts` | Decay analysis | GSC, GA4 |
| `gsc.service.ts` | Search Console | Google APIs |
| `ga4.service.ts` | Analytics | Google APIs |
| `alerts.service.ts` | Notifications | Resend, Slack |
| `social-tracker.service.ts` | Social tracking | Platform APIs |
| `video-hijack.service.ts` | Video analysis | YouTube, TikTok |
| `stripe.service.ts` | Payments | Stripe |
| `auth.service.ts` | Authentication | Clerk |
| `user.service.ts` | User management | Supabase |

---

## 📊 COMPLETE DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                 │
│                    (Next.js React Components)                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVICES LAYER                                   │
│              (keywords, rankings, content, trends, etc.)                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                      │
│                      (Next.js API Routes)                                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐    ┌───────────────────┐    ┌───────────────────────────┐
│   DATABASE    │    │  EXTERNAL APIS    │    │    AI PLATFORMS           │
│   (Supabase)  │    │                   │    │                           │
├───────────────┤    ├───────────────────┤    ├───────────────────────────┤
│ • Users       │    │ • DataForSEO      │    │ • Google AI Overviews     │
│ • Keywords    │    │ • Google GSC      │    │ • ChatGPT                 │
│ • Rankings    │    │ • Google GA4      │    │ • Gemini                  │
│ • Content     │    │ • YouTube API     │    │ • Perplexity              │
│ • Projects    │    │ • TikTok API      │    │ • Claude                  │
│ • Alerts      │    │ • Reddit API      │    │ • Copilot                 │
│ • Clusters    │    │ • Stripe          │    │                           │
│ • API Usage   │    │ • Clerk           │    │                           │
└───────────────┘    └───────────────────┘    └───────────────────────────┘
```

---

## 💰 PRICING & CREDIT SYSTEM

### Plan Comparison

| Feature | FREE | PRO ($49/mo) | ENTERPRISE ($149/mo) |
|---------|------|--------------|----------------------|
| Keyword Searches | 10/mo | 500/mo | Unlimited |
| Rank Tracking | 50 keywords | 1000 keywords | Unlimited |
| AI Credits | 100 | 1000 | 5000 |
| Competitors | 3 | 10 | 50 |
| Projects | 1 | 5 | Unlimited |
| Team Members | 1 | 3 | Unlimited |
| GSC Integration | ❌ | ✅ | ✅ |
| GA4 Integration | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

### Credit Usage

| Action | Credits |
|--------|---------|
| Keyword search | 1 |
| Rank check (per keyword) | 1 |
| AI content generation | 5 |
| On-page audit | 2 |
| Bulk analysis (per 10 keywords) | 10 |
| Competitor gap analysis | 5 |
| AI visibility check | 3 |

---

## 📈 PLATFORM SUMMARY

### Search Engines Supported
1. ✅ Google (Organic + AI Overviews)
2. ✅ Bing
3. ✅ Yahoo (via Bing)

### Video Platforms Supported
1. ✅ YouTube
2. ✅ TikTok

### E-Commerce Platforms Supported
1. ✅ Amazon
2. ✅ Google Shopping

### Social Platforms Supported
1. ✅ Reddit
2. ✅ LinkedIn
3. ✅ Pinterest
4. ✅ Twitter/X
5. ✅ Instagram
6. ✅ Quora

### AI Platforms Monitored
1. ✅ Google AI Overviews/SGE
2. ✅ ChatGPT (OpenAI)
3. ✅ Gemini (Google)
4. ✅ Perplexity
5. ✅ Claude (Anthropic)
6. ✅ Microsoft Copilot

---

## 🎯 FINAL SUMMARY

**BlogSpy is a comprehensive SEO SaaS platform with:**

| Metric | Count |
|--------|-------|
| **Total Features** | 27 |
| **Research Tools** | 8 |
| **Creation Tools** | 4 |
| **Tracking Tools** | 8 |
| **Strategy Tools** | 3 |
| **Monetization Tools** | 2 |
| **Utility Features** | 2 |
| **Search Platforms Tracked** | 3 |
| **Video Platforms Tracked** | 2 |
| **E-Commerce Platforms** | 2 |
| **Social Platforms** | 6 |
| **AI Platforms Monitored** | 6 |
| **External APIs Used** | 8+ |
| **Database Tables** | 10 |
| **Service Files** | 14 |
| **UI Components** | 100+ |

---

*Report generated on December 27, 2025 by analyzing the complete BlogSpy codebase.*
