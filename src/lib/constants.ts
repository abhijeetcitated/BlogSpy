// App Constants

// Pricing Plans
export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out BlogSpy',
    price: { monthly: 0, yearly: 0 },
    credits: 50,
    features: [
      '50 keyword searches/month',
      '1 project',
      '10 keyword tracking',
      'Basic analytics',
      'Community support',
    ],
    limitations: [
      'No AI writer',
      'No competitor analysis',
      'No API access',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individual bloggers and creators',
    price: { monthly: 29, yearly: 290 },
    credits: 500,
    features: [
      '500 keyword searches/month',
      '5 projects',
      '100 keyword tracking',
      'AI Writer (basic)',
      'Content decay alerts',
      'Email support',
    ],
    limitations: [
      'Limited competitor analysis',
      'No API access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams and agencies',
    price: { monthly: 79, yearly: 790 },
    credits: 2000,
    features: [
      '2000 keyword searches/month',
      '25 projects',
      '500 keyword tracking',
      'AI Writer (advanced)',
      'Full competitor analysis',
      'Content roadmap',
      'Topic clusters',
      'Priority support',
      'API access',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: 199, yearly: 1990 },
    credits: 10000,
    features: [
      'Unlimited keyword searches',
      'Unlimited projects',
      'Unlimited keyword tracking',
      'AI Writer (unlimited)',
      'White-label reports',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom API limits',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
  },
] as const;

// Search Intent Labels
export const SEARCH_INTENT_LABELS = {
  informational: { label: 'Informational', color: 'blue', description: 'Looking for information' },
  navigational: { label: 'Navigational', color: 'purple', description: 'Looking for a specific site' },
  commercial: { label: 'Commercial', color: 'orange', description: 'Researching before purchase' },
  transactional: { label: 'Transactional', color: 'green', description: 'Ready to buy' },
} as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  easy: { min: 0, max: 29, label: 'Easy', color: 'green' },
  medium: { min: 30, max: 49, label: 'Medium', color: 'yellow' },
  hard: { min: 50, max: 69, label: 'Hard', color: 'orange' },
  veryHard: { min: 70, max: 100, label: 'Very Hard', color: 'red' },
} as const;

// SERP Features
export const SERP_FEATURES = [
  { id: 'featured_snippet', label: 'Featured Snippet', icon: '📋' },
  { id: 'people_also_ask', label: 'People Also Ask', icon: '❓' },
  { id: 'local_pack', label: 'Local Pack', icon: '📍' },
  { id: 'knowledge_panel', label: 'Knowledge Panel', icon: '🧠' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'image', label: 'Image', icon: '🖼️' },
  { id: 'shopping', label: 'Shopping', icon: '🛒' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'sitelinks', label: 'Sitelinks', icon: '🔗' },
] as const;

// Countries for Tracking
export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
] as const;

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
] as const;

// AI Writer Tones
export const AI_WRITER_TONES = [
  { id: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { id: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { id: 'educational', label: 'Educational', description: 'Informative and teaching' },
  { id: 'persuasive', label: 'Persuasive', description: 'Convincing and compelling' },
  { id: 'entertaining', label: 'Entertaining', description: 'Fun and engaging' },
] as const;

// Content Statuses
export const CONTENT_STATUSES = [
  { id: 'idea', label: 'Idea', color: 'gray' },
  { id: 'planned', label: 'Planned', color: 'blue' },
  { id: 'in_progress', label: 'In Progress', color: 'yellow' },
  { id: 'review', label: 'Review', color: 'purple' },
  { id: 'published', label: 'Published', color: 'green' },
] as const;

// Date Ranges
export const DATE_RANGES = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90 },
  { id: '6m', label: 'Last 6 months', days: 180 },
  { id: '1y', label: 'Last year', days: 365 },
] as const;

// API Rate Limits (per plan)
export const RATE_LIMITS = {
  free: { requests: 100, window: 3600 }, // 100 req/hour
  starter: { requests: 500, window: 3600 },
  pro: { requests: 2000, window: 3600 },
  enterprise: { requests: 10000, window: 3600 },
} as const;
