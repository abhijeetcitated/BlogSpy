/**
 * MASTER RESPONSIVE CONFIGURATION
 * ================================
 * BlogSpy SaaS - Device Breakpoints & Spacing System
 * 
 * Last Updated: 2026-01-05
 * 
 * This is the SINGLE SOURCE OF TRUTH for all responsive design.
 * Import from here instead of hardcoding values.
 */

// =============================================================================
// 1. DEVICE CATALOG (Reference Only - For Documentation)
// =============================================================================

export const DEVICE_CATALOG = {
  // 🍎 iOS - The Apple Premium Suite
  iOS: {
    iPhoneStandard: { width: 393, height: 852, name: 'iPhone 15/16/17 Base' },
    iPhoneProMax: { width: 440, height: 956, name: 'iPhone Pro Max/Titan' },
    iPadMini: { width: 744, height: 1133, name: 'iPad Mini' },
  },
  
  // 🤖 Android - The Global Reach
  android: {
    budget: { width: 360, height: 800, name: 'Redmi/Samsung A-series (CRITICAL)' },
    flagship: { width: 412, height: 915, name: 'Samsung S24-26/Pixel 9-10' },
    foldable: { width: 760, height: 940, name: 'Z Fold/Pixel Fold Unfolded' },
  },
  
  // 📑 Tablet - The Productivity Suite
  tablet: {
    standard: { width: 834, height: 1194, name: 'iPad Pro 11"/Tab S10' },
    proHybrid: { width: 1024, height: 1366, name: 'iPad Pro 12.9"/Surface Pro' },
  },
  
  // 💻 Desktop - The Workspace
  desktop: {
    laptop: { width: 1440, height: 900, name: 'MacBook/Ultrabooks' },
    corporate: { width: 1536, height: 864, name: 'Office Windows Laptops' },
    fullHD: { width: 1920, height: 1080, name: 'Full HD Monitor (Global King)' },
  },
} as const;

// =============================================================================
// 2. BREAKPOINTS (Tailwind-Compatible)
// =============================================================================

/**
 * Custom breakpoints designed around our device catalog
 * 
 * Usage in Tailwind classes:
 * - xs: Extra small phones (Android Budget)
 * - sm: Standard phones (iPhone Standard, Android Flagship)  
 * - md: Large phones & iPad Mini (Foldables, iPad Mini)
 * - lg: Tablets (iPad Pro 11", Standard Tablets)
 * - xl: Pro Tablets & Small Laptops
 * - 2xl: Full Desktop Experience
 */
export const BREAKPOINTS = {
  xs: 360,   // Android Budget - सबसे छोटा (CRITICAL)
  sm: 412,   // Android Flagship / iPhone Standard
  md: 768,   // iPad Mini / Foldables (Layout Change Point)
  lg: 1024,  // Tablets / Pro Hybrid (Desktop Mode Starts)
  xl: 1440,  // Laptops
  '2xl': 1920, // Full HD Monitors
} as const;

/**
 * Tailwind-ready breakpoint strings
 */
export const BREAKPOINT_CLASSES = {
  xs: 'min-w-[360px]',
  sm: 'sm:',      // 640px default, but we target 412px
  md: 'md:',      // 768px
  lg: 'lg:',      // 1024px
  xl: 'xl:',      // 1280px (close to 1440)
  '2xl': '2xl:',  // 1536px (close to 1920)
} as const;

// =============================================================================
// 3. CONTAINER MAX-WIDTHS
// =============================================================================

/**
 * Container constraints to prevent content from stretching on large screens
 */
export const CONTAINERS = {
  /** For full-width content areas */
  full: 'max-w-full',
  
  /** For 4K monitors - prevent extreme stretch */
  '8xl': 'max-w-[1920px]',
  
  /** For Full HD - main dashboard container */
  '7xl': 'max-w-7xl',  // 1280px - Use this for main content
  
  /** For laptop screens */
  '6xl': 'max-w-6xl',  // 1152px
  
  /** For tablet pro/hybrid */
  '5xl': 'max-w-5xl',  // 1024px
  
  /** For standard tablets */
  '4xl': 'max-w-4xl',  // 896px
  
  /** For content-heavy areas (articles, forms) */
  prose: 'max-w-prose', // 65ch (~700px)
} as const;

// =============================================================================
// 4. SPACING PATTERNS
// =============================================================================

/**
 * Page-level padding patterns
 * Mobile-first: Start small, increase with screen size
 */
export const PAGE_PADDING = {
  /** Standard dashboard page padding */
  default: 'p-3 sm:p-4 md:p-6 lg:p-8',
  
  /** Horizontal only (for full-height layouts) */
  horizontal: 'px-3 sm:px-4 md:px-6 lg:px-8',
  
  /** Vertical only */
  vertical: 'py-3 sm:py-4 md:py-6 lg:py-8',
  
  /** Compact padding for dense UIs */
  compact: 'p-2 sm:p-3 md:p-4',
  
  /** Spacious padding for landing pages */
  spacious: 'p-4 sm:p-6 md:p-8 lg:p-12',
} as const;

/**
 * Card/Section padding patterns
 */
export const CARD_PADDING = {
  /** Standard card padding */
  default: 'p-3 sm:p-4 md:p-5 lg:p-6',
  
  /** Compact cards (for data-dense views) */
  compact: 'p-2 sm:p-3 md:p-4',
  
  /** Large cards (feature highlights) */
  large: 'p-4 sm:p-6 md:p-8',
} as const;

/**
 * Gap patterns for flex/grid layouts
 */
export const GAP_PATTERNS = {
  /** Standard gap between items */
  default: 'gap-3 sm:gap-4 md:gap-6',
  
  /** Tight gap for lists */
  tight: 'gap-2 sm:gap-3 md:gap-4',
  
  /** Wide gap for card grids */
  wide: 'gap-4 sm:gap-6 md:gap-8',
} as const;

/**
 * Vertical spacing (space-y) patterns
 */
export const STACK_SPACING = {
  /** Standard vertical stack */
  default: 'space-y-4 sm:space-y-5 md:space-y-6',
  
  /** Tight stack for forms */
  tight: 'space-y-2 sm:space-y-3 md:space-y-4',
  
  /** Wide stack for sections */
  wide: 'space-y-6 sm:space-y-8 md:space-y-10',
} as const;

// =============================================================================
// 5. GRID PATTERNS
// =============================================================================

/**
 * Responsive grid column patterns
 */
export const GRID_COLS = {
  /** Stats/KPI cards - 1 → 2 → 3 → 4 */
  stats: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  
  /** Feature cards - 1 → 2 → 3 */
  features: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  
  /** Two column layout - 1 → 2 */
  twoCol: 'grid-cols-1 md:grid-cols-2',
  
  /** Dashboard main + sidebar - Full → 2:1 ratio */
  dashboard: 'grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_350px]',
  
  /** Content + sidebar - Full → 3:1 ratio */
  contentSidebar: 'grid-cols-1 lg:grid-cols-[1fr_280px]',
} as const;

// =============================================================================
// 6. TYPOGRAPHY SCALE
// =============================================================================

/**
 * Responsive text sizes
 */
export const TEXT_SIZES = {
  /** Page titles */
  pageTitle: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  
  /** Section titles */
  sectionTitle: 'text-lg sm:text-xl md:text-2xl',
  
  /** Card titles */
  cardTitle: 'text-base sm:text-lg md:text-xl',
  
  /** Body text */
  body: 'text-sm sm:text-base',
  
  /** Small/caption text */
  caption: 'text-xs sm:text-sm',
} as const;

// =============================================================================
// 7. SIDEBAR PATTERNS
// =============================================================================

/**
 * Sidebar width patterns
 */
export const SIDEBAR = {
  /** Collapsed sidebar width */
  collapsed: 'w-16',
  
  /** Expanded sidebar width */
  expanded: 'w-64',
  
  /** Responsive sidebar - hidden on mobile, collapsed on tablet, expanded on desktop */
  responsive: 'hidden md:block md:w-16 lg:w-64',
  
  /** Mobile drawer width */
  drawer: 'w-[280px] sm:w-[320px]',
} as const;

// =============================================================================
// 8. COMPONENT RESPONSIVE CLASSES (Ready to use)
// =============================================================================

/**
 * Pre-built responsive class combinations
 * Copy-paste directly into components
 */
export const RESPONSIVE_CLASSES = {
  /** Dashboard page wrapper */
  dashboardPage: 'p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto',
  
  /** Dashboard content area */
  dashboardContent: 'space-y-4 sm:space-y-5 md:space-y-6',
  
  /** Stats grid */
  statsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6',
  
  /** Feature cards grid */
  featureGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  
  /** Card component */
  card: 'p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg border bg-card',
  
  /** Page header */
  pageHeader: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4',
  
  /** Page title */
  pageTitle: 'text-xl sm:text-2xl md:text-3xl font-bold tracking-tight',
  
  /** Table wrapper (horizontal scroll on mobile) */
  tableWrapper: 'overflow-x-auto -mx-3 sm:-mx-4 md:mx-0',
  
  /** Table inner padding compensation */
  tableInner: 'px-3 sm:px-4 md:px-0 min-w-[600px] md:min-w-0',
  
  /** Form layout */
  formLayout: 'space-y-4 sm:space-y-5 md:space-y-6 max-w-2xl',
  
  /** Two column form on desktop */
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
  
  /** Button group */
  buttonGroup: 'flex flex-col sm:flex-row gap-2 sm:gap-3',
  
  /** Search/filter bar */
  filterBar: 'flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center',
  
  /** Modal/Dialog */
  modal: 'w-[calc(100vw-24px)] sm:w-[480px] md:w-[560px] lg:w-[640px] max-h-[85vh]',
  
  /** Drawer */
  drawer: 'w-full sm:w-[400px] md:w-[480px]',
} as const;

// =============================================================================
// 9. DEVICE-SPECIFIC VISIBILITY
// =============================================================================

/**
 * Show/hide elements based on device
 */
export const VISIBILITY = {
  /** Mobile only (< 768px) */
  mobileOnly: 'block md:hidden',
  
  /** Tablet and up (≥ 768px) */
  tabletUp: 'hidden md:block',
  
  /** Desktop only (≥ 1024px) */
  desktopOnly: 'hidden lg:block',
  
  /** Hide on mobile, show inline on tablet+ */
  hideMobile: 'hidden sm:inline',
  
  /** Show on mobile, hide on tablet+ */
  showMobile: 'sm:hidden',
} as const;

// =============================================================================
// 10. CSS CUSTOM PROPERTIES (For advanced usage)
// =============================================================================

/**
 * CSS variable definitions for runtime responsive behavior
 * Add these to your global CSS
 */
export const CSS_VARIABLES = `
:root {
  /* Breakpoint values for JS access */
  --breakpoint-xs: 360px;
  --breakpoint-sm: 412px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1440px;
  --breakpoint-2xl: 1920px;
  
  /* Page padding */
  --page-padding: 12px;
  
  /* Card padding */
  --card-padding: 12px;
  
  /* Gap */
  --gap: 12px;
}

@media (min-width: 640px) {
  :root {
    --page-padding: 16px;
    --card-padding: 16px;
    --gap: 16px;
  }
}

@media (min-width: 768px) {
  :root {
    --page-padding: 24px;
    --card-padding: 20px;
    --gap: 24px;
  }
}

@media (min-width: 1024px) {
  :root {
    --page-padding: 32px;
    --card-padding: 24px;
    --gap: 24px;
  }
}
`;

// =============================================================================
// 11. MARKETING / LANDING PAGE PATTERNS
// =============================================================================

/**
 * Marketing page section spacing
 */
export const MARKETING_SPACING = {
  /** Hero section padding */
  hero: 'py-16 px-4 sm:py-20 md:py-32',
  
  /** Content section padding */
  section: 'py-12 px-4 sm:py-16 md:py-24',
  
  /** Compact section */
  sectionCompact: 'py-8 px-4 sm:py-12 md:py-16',
} as const;

/**
 * Marketing typography
 */
export const MARKETING_TEXT = {
  /** Main hero headline */
  headline: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  
  /** Section title */
  title: 'text-2xl sm:text-3xl md:text-4xl',
  
  /** Subtitle */
  subtitle: 'text-xl sm:text-2xl md:text-3xl',
} as const;

/**
 * Marketing grid layouts
 */
export const MARKETING_GRID = {
  /** 4-column stats grid */
  stats: 'grid-cols-2 md:grid-cols-4',
  
  /** Feature cards */
  features: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  
  /** Team/testimonials */
  team: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  
  /** Two column layout */
  twoCol: 'grid-cols-1 md:grid-cols-2',
} as const;

// =============================================================================
// 12. HELPER FUNCTIONS
// =============================================================================

/**
 * Get container class based on content type
 */
export function getContainerClass(type: 'dashboard' | 'content' | 'form' | 'full' = 'dashboard'): string {
  switch (type) {
    case 'dashboard':
      return 'max-w-[1920px] mx-auto';
    case 'content':
      return 'max-w-7xl mx-auto';
    case 'form':
      return 'max-w-2xl mx-auto';
    case 'full':
      return 'w-full';
    default:
      return 'max-w-7xl mx-auto';
  }
}

/**
 * Combine responsive classes safely
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type DeviceCatalog = typeof DEVICE_CATALOG;
export type Breakpoint = keyof typeof BREAKPOINTS;
export type Container = keyof typeof CONTAINERS;
export type PagePadding = keyof typeof PAGE_PADDING;
export type CardPadding = keyof typeof CARD_PADDING;
export type GapPattern = keyof typeof GAP_PATTERNS;
export type GridCol = keyof typeof GRID_COLS;
export type TextSize = keyof typeof TEXT_SIZES;
