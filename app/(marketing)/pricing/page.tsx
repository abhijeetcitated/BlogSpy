import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Pricing - BlogSpy',
  description: 'Simple, transparent pricing. Choose the plan that fits your needs.',
};

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out BlogSpy',
    price: { monthly: 0, yearly: 0 },
    credits: 50,
    features: [
      { text: '50 keyword searches/month', included: true },
      { text: '1 project', included: true },
      { text: '10 keyword tracking', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Community support', included: true },
      { text: 'AI Writer', included: false },
      { text: 'Competitor analysis', included: false },
      { text: 'API access', included: false },
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
      { text: '500 keyword searches/month', included: true },
      { text: '5 projects', included: true },
      { text: '100 keyword tracking', included: true },
      { text: 'AI Writer (basic)', included: true },
      { text: 'Content decay alerts', included: true },
      { text: 'Email support', included: true },
      { text: 'Limited competitor analysis', included: true },
      { text: 'API access', included: false },
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
      { text: '2000 keyword searches/month', included: true },
      { text: '25 projects', included: true },
      { text: '500 keyword tracking', included: true },
      { text: 'AI Writer (advanced)', included: true },
      { text: 'Full competitor analysis', included: true },
      { text: 'Content roadmap', included: true },
      { text: 'Topic clusters', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
    ],
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
      { text: 'Unlimited keyword searches', included: true },
      { text: 'Unlimited projects', included: true },
      { text: 'Unlimited keyword tracking', included: true },
      { text: 'AI Writer (unlimited)', included: true },
      { text: 'White-label reports', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Custom API limits', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated to your billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required.',
  },
  {
    question: 'What happens when I run out of credits?',
    answer: 'You can purchase additional credits or wait for your monthly reset. We\'ll notify you when you\'re running low.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. Cancel anytime with no hidden fees. Your access continues until the end of your billing period.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              BlogSpy
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container text-center">
          <Badge className="mb-4" variant="secondary">Pricing</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 hover:bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price.monthly}</span>
                    <span className="text-muted-foreground">/month</span>
                    {plan.price.yearly > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${plan.price.yearly}/year (save 2 months)
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="w-full">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your 14-day free trial. No credit card required.
          </p>
          <Link href="/login">
            <Button size="lg" className="px-8">
              Start Free Trial
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
          </div>
        </div>
      </footer>
    </div>
  );
}
