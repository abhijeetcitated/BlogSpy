import "server-only"

// ============================================
// SOCIAL OPPORTUNITY CALCULATOR
// ============================================
// Combines platform signals into a single 0-100 score.
// Formula:
// (YouTube_Win_Prob * 0.4) + (Reddit_Heat * 0.3)
// + (Pinterest_Virality * 0.2) + (Quora_Presence * 0.1)
// ============================================

export interface SocialOpportunityInputs {
  youtubeWinProb: number
  redditHeat: number
  pinterestVirality: number
  quoraPresence: number
}

export interface SocialOpportunityResult {
  score: number
  breakdown: SocialOpportunityInputs
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function calculateSocialOpportunityScore(
  inputs: SocialOpportunityInputs
): SocialOpportunityResult {
  const score =
    inputs.youtubeWinProb * 0.4 +
    inputs.redditHeat * 0.3 +
    inputs.pinterestVirality * 0.2 +
    inputs.quoraPresence * 0.1

  return {
    score: clampScore(score),
    breakdown: {
      youtubeWinProb: clampScore(inputs.youtubeWinProb),
      redditHeat: clampScore(inputs.redditHeat),
      pinterestVirality: clampScore(inputs.pinterestVirality),
      quoraPresence: clampScore(inputs.quoraPresence),
    },
  }
}
