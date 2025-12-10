"use client"

import Link from "next/link"
import { 
  Search, 
  TrendingUp, 
  FileText, 
  Target, 
  BarChart3, 
  Zap,
  ArrowRight,
  Check,
  Sparkles,
  LineChart,
  Brain,
  Globe,
  Shield,
  Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: Search,
    title: "Keyword Magic Tool",
    description: "Discover thousands of keyword opportunities with search volume, difficulty, and intent data.",
    highlights: ["10M+ keyword database", "Intent classification", "Competitor gaps"],
    color: "emerald",
  },
  {
    icon: TrendingUp,
    title: "Trend Spotter",
    description: "Catch trending topics before they peak. Get real-time trend velocity and growth predictions.",
    highlights: ["Real-time monitoring", "Velocity scoring", "Geographic insights"],
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Rank Tracker",
    description: "Track your rankings across all search engines with daily updates and historical data.",
    highlights: ["Daily tracking", "SERP features", "Competitor comparison"],
    color: "purple",
  },
  {
    icon: FileText,
    title: "Content Decay Detection",
    description: "Identify content losing rankings before it's too late. Get optimization recommendations.",
    highlights: ["Auto-detection", "Priority scoring", "Action items"],
    color: "orange",
  },
  {
    icon: Target,
    title: "Topic Clusters",
    description: "Build topical authority with AI-powered content clusters and internal linking strategies.",
    highlights: ["Visual mapping", "Gap analysis", "Link suggestions"],
    color: "pink",
  },
  {
    icon: Brain,
    title: "AI Writer",
    description: "Generate SEO-optimized content with AI. Outlines, articles, and meta descriptions.",
    highlights: ["SEO-optimized", "Brand voice", "One-click drafts"],
    color: "blue",
  },
]

const benefits = [
  {
    icon: Rocket,
    title: "10x Faster Research",
    description: "What used to take hours now takes minutes with our AI-powered tools.",
  },
  {
    icon: Globe,
    title: "Global Database",
    description: "Access keyword data from 200+ countries and all major search engines.",
  },
  {
    icon: Shield,
    title: "Accurate Data",
    description: "Powered by DataForSEO with 99.9% accuracy on search volumes.",
  },
  {
    icon: LineChart,
    title: "Actionable Insights",
    description: "Not just data - get clear recommendations on what to do next.",
  },
]

export default function FeaturesPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              All Features
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Everything you need for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                SEO success
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              From keyword research to content optimization, BlogSpy gives you all the tools 
              you need to grow your organic traffic and outrank competitors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className={`h-12 w-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why teams choose BlogSpy
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Join thousands of marketers who&apos;ve switched to BlogSpy for better SEO results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-slate-800">
            <Sparkles className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to grow your organic traffic?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Start your free trial today. No credit card required.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
