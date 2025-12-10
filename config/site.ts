/**
 * Site Configuration
 * Site-wide metadata and configuration
 */

export const siteConfig = {
  name: "BlogSpy",
  tagline: "AI-Powered SEO Intelligence",
  description:
    "BlogSpy is the ultimate SEO toolkit for bloggers and content creators. Discover keywords, track rankings, analyze competitors, and create optimized content with AI.",
  url: "https://blogspy.io",
  ogImage: "/og-image.png",
  
  // Contact
  email: {
    support: "support@blogspy.io",
    sales: "sales@blogspy.io",
  },
  
  // Social links
  social: {
    twitter: "https://twitter.com/blogspy",
    github: "https://github.com/blogspy",
    linkedin: "https://linkedin.com/company/blogspy",
    youtube: "https://youtube.com/@blogspy",
  },

  // Creator info
  creator: {
    name: "BlogSpy Team",
    twitter: "@blogspy",
  },

  // SEO keywords
  keywords: [
    "SEO tool",
    "keyword research",
    "rank tracking",
    "content optimization",
    "AI content writer",
    "competitor analysis",
    "blog SEO",
    "content strategy",
    "SERP analysis",
    "backlink analysis",
  ],

  // Navigation links
  nav: {
    main: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
    ],
    dashboard: [
      {
        label: "Research",
        items: [
          { label: "Keyword Overview", href: "/dashboard/research/overview" },
          { label: "Keyword Magic", href: "/dashboard/research/keyword-magic" },
          { label: "Gap Analysis", href: "/dashboard/research/gap-analysis" },
          { label: "Trends", href: "/dashboard/research/trends" },
        ],
      },
      {
        label: "Creation",
        items: [
          { label: "AI Writer", href: "/dashboard/creation/ai-writer" },
          { label: "On-Page Checker", href: "/dashboard/creation/on-page" },
          { label: "Snippet Stealer", href: "/dashboard/creation/snippet-stealer" },
        ],
      },
      {
        label: "Strategy",
        items: [
          { label: "Content Roadmap", href: "/dashboard/strategy/roadmap" },
          { label: "Topic Clusters", href: "/dashboard/strategy/topic-clusters" },
        ],
      },
      {
        label: "Tracking",
        items: [
          { label: "Rank Tracker", href: "/dashboard/tracking/rank-tracker" },
          { label: "Content Decay", href: "/dashboard/tracking/decay" },
        ],
      },
    ],
    footer: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Changelog", href: "/changelog" },
          { label: "Roadmap", href: "/roadmap" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Documentation", href: "/docs" },
          { label: "API Reference", href: "/docs/api" },
          { label: "Status", href: "/status" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
          { label: "Press Kit", href: "/press" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Cookie Policy", href: "/cookies" },
          { label: "GDPR", href: "/gdpr" },
        ],
      },
    ],
  },

  // Feature highlights
  features: [
    {
      title: "Keyword Magic",
      description:
        "Discover thousands of keyword opportunities with search volume, difficulty, and trend data.",
      icon: "Wand2",
      href: "/dashboard/research/keyword-magic",
    },
    {
      title: "AI Content Writer",
      description:
        "Generate SEO-optimized content with AI that ranks. Outline, write, and optimize in minutes.",
      icon: "PenTool",
      href: "/dashboard/creation/ai-writer",
    },
    {
      title: "Rank Tracker",
      description:
        "Monitor your keyword rankings daily. Get alerts when positions change.",
      icon: "LineChart",
      href: "/dashboard/tracking/rank-tracker",
    },
    {
      title: "Content Decay",
      description:
        "Identify content losing traffic and get AI-powered refresh suggestions.",
      icon: "Activity",
      href: "/dashboard/tracking/decay",
    },
    {
      title: "Topic Clusters",
      description:
        "Build topical authority with intelligent content clusters and internal linking.",
      icon: "Network",
      href: "/dashboard/strategy/topic-clusters",
    },
    {
      title: "Competitor Analysis",
      description:
        "Spy on competitor keywords and find content gaps to exploit.",
      icon: "Target",
      href: "/dashboard/research/gap-analysis",
    },
  ],

  // Testimonials
  testimonials: [
    {
      quote:
        "BlogSpy helped us increase organic traffic by 312% in 6 months. The AI writer alone is worth the subscription.",
      author: "Sarah Chen",
      role: "Content Director",
      company: "TechCrunch",
      avatar: "/testimonials/sarah.jpg",
    },
    {
      quote:
        "Finally, an SEO tool that understands content creators. The topic clusters feature is a game-changer.",
      author: "Mike Johnson",
      role: "Founder",
      company: "BloggerPro",
      avatar: "/testimonials/mike.jpg",
    },
    {
      quote:
        "We've tried every SEO tool out there. BlogSpy is the only one that gives us actionable insights quickly.",
      author: "Emily Rodriguez",
      role: "SEO Manager",
      company: "HubSpot",
      avatar: "/testimonials/emily.jpg",
    },
  ],

  // FAQ
  faq: [
    {
      question: "How is BlogSpy different from other SEO tools?",
      answer:
        "BlogSpy is built specifically for content creators and bloggers. We focus on actionable insights, AI-powered content creation, and a user-friendly interface that doesn't require SEO expertise.",
    },
    {
      question: "Where does the SEO data come from?",
      answer:
        "We aggregate data from multiple sources including Google's APIs, our proprietary crawlers, and third-party data providers to give you the most accurate and up-to-date information.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! Our Free plan gives you 50 keyword searches per month to try out the platform. No credit card required.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use bank-level encryption, never share your data with third parties, and are fully GDPR compliant.",
    },
  ],
} as const

export type SiteConfig = typeof siteConfig

export default siteConfig
