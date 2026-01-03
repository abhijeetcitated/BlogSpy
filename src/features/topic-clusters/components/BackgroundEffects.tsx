"use client"

export function BackgroundEffects() {
  return (
    <>
      {/* Premium background with subtle grid pattern */}
      <div
        className="absolute inset-0 bg-linear-to-br from-background via-background to-muted/20"
      />
      
      {/* Grid overlay - theme aware */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow effects - premium and subtle */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/[0.03] dark:bg-violet-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-blue-500/[0.02] dark:bg-blue-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
    </>
  )
}
