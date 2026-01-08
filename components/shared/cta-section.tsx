// Shared Components - CTA Section

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PAGE_PADDING, GAP_PATTERNS } from '@/src/styles';

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryCTA?: string;
  primaryHref?: string;
  secondaryCTA?: string;
  secondaryHref?: string;
}

export function CTASection({
  title = "Ready to dominate search rankings?",
  description = "Start your 14-day free trial today. No credit card required.",
  primaryCTA = "Start Free Trial",
  primaryHref = "/login",
  secondaryCTA = "View Pricing",
  secondaryHref = "/pricing",
}: CTASectionProps) {
  return (
    <section className={`py-12 sm:py-16 md:py-20 ${PAGE_PADDING.horizontal} bg-linear-to-br from-blue-600 to-cyan-500 text-white`}>
      <div className="container text-center max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          {title}
        </h2>
        <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">
          {description}
        </p>
        <div className={`flex flex-col sm:flex-row ${GAP_PATTERNS.tight} justify-center`}>
          <Link href={primaryHref}>
            <Button size="lg" variant="secondary" className="gap-2">
              {primaryCTA} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={secondaryHref}>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              {secondaryCTA}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
