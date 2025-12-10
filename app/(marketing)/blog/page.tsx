"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Clock, User, Tag, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Mock blog posts
const featuredPost = {
  slug: "seo-trends-2025",
  title: "The Complete Guide to SEO in 2025: Trends, Strategies, and Predictions",
  excerpt: "Discover the latest SEO trends and strategies that will dominate in 2025. From AI-powered search to voice optimization, learn what you need to know to stay ahead.",
  author: "Sarah Chen",
  date: "December 8, 2025",
  readTime: "15 min read",
  category: "SEO Strategy",
  image: "/blog/seo-2025.jpg",
}

const blogPosts = [
  {
    slug: "keyword-research-guide",
    title: "Keyword Research: The Ultimate Guide for 2025",
    excerpt: "Master keyword research with our comprehensive guide. Learn how to find profitable keywords, analyze competition, and create content that ranks.",
    author: "Mike Johnson",
    date: "December 5, 2025",
    readTime: "12 min read",
    category: "Keyword Research",
  },
  {
    slug: "content-decay-fix",
    title: "How to Identify and Fix Content Decay Before It Hurts Your Rankings",
    excerpt: "Learn the warning signs of content decay and proven strategies to refresh your content for better search visibility.",
    author: "Emily Watson",
    date: "December 3, 2025",
    readTime: "8 min read",
    category: "Content Strategy",
  },
  {
    slug: "topic-clusters-guide",
    title: "Topic Clusters: Building Topical Authority in 2025",
    excerpt: "Discover how to use topic clusters to establish topical authority and improve your site's overall SEO performance.",
    author: "David Park",
    date: "December 1, 2025",
    readTime: "10 min read",
    category: "Content Strategy",
  },
  {
    slug: "rank-tracking-best-practices",
    title: "Rank Tracking Best Practices: What Metrics Actually Matter",
    excerpt: "Stop tracking vanity metrics. Learn which ranking metrics truly impact your business and how to measure SEO success.",
    author: "Lisa Chen",
    date: "November 28, 2025",
    readTime: "7 min read",
    category: "Analytics",
  },
  {
    slug: "ai-content-seo",
    title: "AI Content and SEO: What Google Really Thinks",
    excerpt: "Everything you need to know about using AI for content creation while staying on the right side of Google's guidelines.",
    author: "James Wilson",
    date: "November 25, 2025",
    readTime: "9 min read",
    category: "AI & SEO",
  },
  {
    slug: "local-seo-guide",
    title: "Local SEO in 2025: Complete Guide for Small Businesses",
    excerpt: "Dominate local search results with our proven local SEO strategies. From Google Business Profile to local citations.",
    author: "Maria Garcia",
    date: "November 22, 2025",
    readTime: "11 min read",
    category: "Local SEO",
  },
]

const categories = [
  "All Posts",
  "SEO Strategy",
  "Keyword Research",
  "Content Strategy",
  "Technical SEO",
  "AI & SEO",
  "Analytics",
  "Local SEO",
]

export default function BlogPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              BlogSpy Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              SEO insights for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                modern marketers
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-8">
              Expert tips, guides, and strategies to help you dominate search rankings.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                type="search"
                placeholder="Search articles..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "ghost"}
                size="sm"
                className={index === 0 
                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <span className="text-6xl">📊</span>
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 hover:text-emerald-400 transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="text-slate-400 mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Button className="w-fit bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Latest Articles</h2>
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-white group-hover:text-emerald-400 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-slate-400 line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">
              Get SEO tips in your inbox
            </h2>
            <p className="text-slate-400 mb-6">
              Join 10,000+ marketers getting weekly SEO insights. No spam, unsubscribe anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
