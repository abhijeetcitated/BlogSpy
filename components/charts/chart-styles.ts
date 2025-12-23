// ============================================
// Chart Tooltip Styles - Shared Configuration
// ============================================
// Use these styles for consistent theming across all charts
// Supports light/dark mode via CSS variables

import type { CSSProperties } from "react"

/**
 * Standard tooltip styles for recharts
 * Uses CSS variables for proper theme support
 */
export const chartTooltipStyles = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--card-foreground))',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '8px 12px',
  } as CSSProperties,
  
  itemStyle: {
    color: 'hsl(var(--card-foreground))',
  } as CSSProperties,
  
  labelStyle: {
    color: 'hsl(var(--muted-foreground))',
    fontWeight: 600,
    marginBottom: '4px',
  } as CSSProperties,
}

/**
 * Axis styles for recharts
 */
export const chartAxisStyles = {
  tick: { 
    fill: 'var(--color-muted-foreground)', 
    fontSize: 10 
  },
  axisLine: { 
    stroke: 'var(--color-border)' 
  },
}

/**
 * Common chart colors using CSS variables
 */
export const chartColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b', 
  error: '#ef4444',
  info: '#3b82f6',
  
  // Chart-specific colors
  chart1: 'var(--color-chart-1)',
  chart2: 'var(--color-chart-2)',
  chart3: 'var(--color-chart-3)',
  chart4: 'var(--color-chart-4)',
  chart5: 'var(--color-chart-5)',
}

/**
 * Intent colors for keyword/affiliate analysis
 */
export const intentColors = {
  transactional: '#10b981',
  commercial: '#06b6d4',
  informational: '#f59e0b',
  navigational: '#a855f7',
}

/**
 * Difficulty tier colors
 */
export const difficultyColors = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
}
