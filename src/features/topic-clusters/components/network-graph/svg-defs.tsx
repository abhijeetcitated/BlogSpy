// ============================================
// NETWORK GRAPH - SVG Definitions (Filters & Gradients)
// ============================================

export function SvgDefs() {
  return (
    <defs>
      {/* Glow filters for each color */}
      <filter id="glowGreen" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
        <feFlood floodColor="#10b981" floodOpacity="0.6" result="glowColor" />
        <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
        <feMerge>
          <feMergeNode in="softGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowYellow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
        <feFlood floodColor="#f59e0b" floodOpacity="0.6" result="glowColor" />
        <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
        <feMerge>
          <feMergeNode in="softGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowRed" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
        <feFlood floodColor="#ef4444" floodOpacity="0.6" result="glowColor" />
        <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
        <feMerge>
          <feMergeNode in="softGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowPurple" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="12" result="coloredBlur" />
        <feFlood floodColor="#8b5cf6" floodOpacity="0.8" result="glowColor" />
        <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
        <feMerge>
          <feMergeNode in="softGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowSelected" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="15" result="coloredBlur" />
        <feFlood floodColor="#a78bfa" floodOpacity="1" result="glowColor" />
        <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
        <feMerge>
          <feMergeNode in="softGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gradient for center node */}
      <radialGradient id="centerGradient" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6366f1" />
      </radialGradient>

      {/* Animated pulse gradient */}
      <radialGradient id="pulseGradient">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4">
          <animate attributeName="stopOpacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}
