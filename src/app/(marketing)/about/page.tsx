import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Target, Users, Lightbulb, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MARKETING_SPACING, MARKETING_TEXT, MARKETING_GRID } from '@/src/styles';

export const metadata: Metadata = {
  title: 'About Us - BlogSpy',
  description: 'Learn about BlogSpy - the AI-powered SEO intelligence platform helping content creators dominate search rankings.',
};

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We believe every content creator deserves access to enterprise-level SEO tools without the enterprise price tag.',
  },
  {
    icon: Users,
    title: 'User-Centric',
    description: 'Every feature we build starts with our users. We listen, iterate, and deliver what actually matters.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We leverage cutting-edge AI to solve real SEO problems, not just add buzzwords to our marketing.',
  },
  {
    icon: Trophy,
    title: 'Results Focused',
    description: 'Our success is measured by your success. When you rank higher, we know we\'re doing our job.',
  },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '10M+', label: 'Keywords Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

const team = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former SEO lead at major tech companies. 10+ years in search optimization.',
  },
  {
    name: 'Sarah Johnson',
    role: 'CTO & Co-Founder',
    bio: 'AI/ML expert with a passion for making complex technology accessible.',
  },
  {
    name: 'Mike Rodriguez',
    role: 'Head of Product',
    bio: 'Product leader focused on building tools that content creators love.',
  },
  {
    name: 'Emily Zhang',
    role: 'Head of Customer Success',
    bio: 'Dedicated to helping every user achieve their SEO goals.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              BlogSpy
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={MARKETING_SPACING.hero}>
        <div className="container text-center max-w-4xl">
          <Badge className="mb-4" variant="secondary">About Us</Badge>
          <h1 className={`${MARKETING_TEXT.headline} font-bold tracking-tight mb-6`}>
            Empowering Content Creators to{' '}
            <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Dominate Search
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            BlogSpy was born from a simple frustration: why do enterprise SEO tools cost thousands 
            of dollars when most bloggers just need the essentials done right?
          </p>
        </div>
      </section>

      {/* Story */}
      <section className={`${MARKETING_SPACING.section} bg-muted/50`}>
        <div className="container max-w-4xl">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              In 2023, our founders were running a content agency and spending over $500/month on 
              various SEO tools. They noticed something: most of these tools were bloated with 
              features they never used, while missing simple functionality they needed daily.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              So they built BlogSpy – an AI-powered SEO platform that focuses on what actually 
              matters for content creators: finding the right keywords, tracking your rankings, 
              understanding your competition, and creating content that ranks.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Today, BlogSpy helps over 50,000 bloggers, content marketers, and SEO professionals 
              grow their organic traffic without breaking the bank.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={MARKETING_SPACING.section}>
        <div className="container">
          <div className={`grid ${MARKETING_GRID.stats} gap-8 max-w-4xl mx-auto`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`${MARKETING_SPACING.section} bg-muted/50`}>
        <div className="container">
          <h2 className={`${MARKETING_TEXT.title} font-bold text-center mb-12`}>Our Values</h2>
          <div className={`grid ${MARKETING_GRID.team} gap-6 max-w-6xl mx-auto`}>
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={MARKETING_SPACING.section}>
        <div className="container">
          <h2 className={`${MARKETING_TEXT.title} font-bold text-center mb-12`}>Meet Our Team</h2>
          <div className={`grid ${MARKETING_GRID.team} gap-6 max-w-6xl mx-auto`}>
            {team.map((member, index) => (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-blue-500 mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`${MARKETING_SPACING.hero} bg-muted/50`}>
        <div className="container text-center max-w-2xl">
          <h2 className={`${MARKETING_TEXT.title} font-bold mb-4`}>Join 50,000+ Content Creators</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your SEO journey with BlogSpy today. No credit card required.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 BlogSpy. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
