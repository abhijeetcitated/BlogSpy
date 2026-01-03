// Shared Components - Header for Marketing Pages

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MarketingHeaderProps {
  transparent?: boolean;
}

export function MarketingHeader({ transparent = false }: MarketingHeaderProps) {
  return (
    <header className={`border-b ${transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'}`}>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            BlogSpy
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
