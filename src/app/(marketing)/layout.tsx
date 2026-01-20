import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PAGE_PADDING, STACK_SPACING, GRID_COLS, GAP_PATTERNS } from "@/src/styles"

export const metadata: Metadata = {
  title: "Marketing - BlogSpy",
  description: "Discover BlogSpy SEO tools and grow your organic traffic",
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <nav className={`container mx-auto flex h-14 sm:h-16 items-center justify-between ${PAGE_PADDING.horizontal}`}>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BlogSpy</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm text-slate-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                Start Free
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 sm:py-10 md:py-12">
        <div className={`container mx-auto ${PAGE_PADDING.horizontal}`}>
          <div className={`grid grid-cols-2 md:grid-cols-4 ${GAP_PATTERNS.wide}`}>
            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><Link href="/features" className="text-sm text-slate-400 hover:text-emerald-400">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-emerald-400">Pricing</Link></li>
                <li><Link href="/changelog" className="text-sm text-slate-400 hover:text-emerald-400">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4">Resources</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><Link href="/blog" className="text-sm text-slate-400 hover:text-emerald-400">Blog</Link></li>
                <li><Link href="/docs" className="text-sm text-slate-400 hover:text-emerald-400">Documentation</Link></li>
                <li><Link href="/api" className="text-sm text-slate-400 hover:text-emerald-400">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><Link href="/about" className="text-sm text-slate-400 hover:text-emerald-400">About</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-400 hover:text-emerald-400">Contact</Link></li>
                <li><Link href="/careers" className="text-sm text-slate-400 hover:text-emerald-400">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-emerald-400">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-400 hover:text-emerald-400">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-linear-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-slate-400">© 2025 BlogSpy. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
