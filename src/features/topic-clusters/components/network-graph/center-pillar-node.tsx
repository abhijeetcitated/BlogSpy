// ============================================
// NETWORK GRAPH - Center Pillar Node
// ============================================

interface CenterPillarNodeProps {
  centerX: number
  centerY: number
}

export function CenterPillarNode({ centerX, centerY }: CenterPillarNodeProps) {
  return (
    <g className="cursor-default">
      {/* Outer pulsing rings */}
      <circle cx={centerX} cy={centerY} r="85" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.2">
        <animate attributeName="r" values="85;95;85" dur="3s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={centerX} cy={centerY} r="75" fill="none" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.15">
        <animate attributeName="r" values="75;82;75" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.15;0.05;0.15" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Glow background */}
      <circle cx={centerX} cy={centerY} r="60" fill="url(#pulseGradient)" />

      {/* Main center node */}
      <circle
        cx={centerX}
        cy={centerY}
        r="52"
        fill="url(#centerGradient)"
        stroke="#c4b5fd"
        strokeWidth="3"
        filter="url(#glowPurple)"
      />

      {/* Inner highlight */}
      <circle cx={centerX - 12} cy={centerY - 12} r="20" fill="white" fillOpacity="0.1" />

      {/* Label */}
      <text
        x={centerX}
        y={centerY - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        className="pointer-events-none select-none"
      >
        Digital
      </text>
      <text
        x={centerX}
        y={centerY + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        className="pointer-events-none select-none"
      >
        Marketing
      </text>
    </g>
  )
}
