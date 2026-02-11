import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================
  // PERFORMANCE OPTIMIZATION
  // ============================================

  // Enable React Strict Mode for better debugging
  reactStrictMode: true,

  // React Compiler (React 19) - automatic memoization
  reactCompiler: true,



  // ============================================
  // TURBOPACK (Next.js 16 default)
  // ============================================
  // turbopack: {
  //   // Turbopack configuration (empty = use defaults)
  // },

  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  images: {
    // Remote image domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Amazon product images
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-eu.ssl-images-amazon.com",
      },
      // Placeholder images
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    // Image formats
    formats: ["image/avif", "image/webp"],
  },

  // ============================================
  // SECURITY HEADERS
  // ============================================
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co https://api.dataforseo.com https://vercel.live https://cdn.jsdelivr.net; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },

  // ============================================
  // REDIRECTS (SEO & Legacy URLs)
  // ============================================
  async redirects() {
    return [
      // Example: Redirect old URLs to new
      // {
      //   source: "/old-path",
      //   destination: "/new-path",
      //   permanent: true,
      // },
    ];
  },

  // ============================================
  // EXPERIMENTAL FEATURES (2026 Enterprise Security)
  // ============================================
  experimental: {
    // Partial Prerendering (Instant Shell) - Disabled (Unstable in 16.1.1)
    // cacheComponents: true,
    // Enable optimized package imports - reduces bundle size significantly
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-popover",
      "recharts",
      "date-fns",
      "lodash",
      "clsx",
      "tailwind-merge",
      "@tanstack/react-query",
      "@tanstack/react-table",
      "zod",
      "sonner",
    ],
    // Enable React Taint API to prevent sensitive data leaks
    taint: true,
    // Server Actions CSRF Protection
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "citated.com",
        "www.citated.com",
        // Vercel preview deployments (set VERCEL_PROJECT_PRODUCTION_URL in env)
        ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
        ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? [process.env.VERCEL_PROJECT_PRODUCTION_URL]
          : []),
      ],
    },
  },

  // ============================================
  // TURBOPACK DEV OPTIMIZATION
  // ============================================
  turbopack: {
    // Resolve aliases for faster imports
    resolveAlias: {
      "@": "./src",
      "@ui": "./src/components/ui",
      "@features": "./src/features",
    },
  },

  // NOTE: PPR is enabled; ensure cron routes avoid `dynamic = "force-dynamic"`
  // where an instant shell is not desired.

  // ============================================
  // LOGGING (Development)
  // ============================================
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // ============================================
  // POWERED BY HEADER
  // ============================================
  poweredByHeader: false, // Remove X-Powered-By header
};

export default nextConfig;
