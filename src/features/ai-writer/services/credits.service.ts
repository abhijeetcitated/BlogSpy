// ============================================
// CREDITS SERVICE - Production Ready
// ============================================
// Handles AI usage credits, limits, and tracking
// Ready for API/payment integration

// ============================================
// TYPES
// ============================================

export interface CreditPlan {
  id: string
  name: string
  credits: number
  price: number
  features: string[]
  isPopular?: boolean
}

export interface CreditBalance {
  total: number
  used: number
  remaining: number
  resetDate: string
  plan: CreditPlan
}

export interface CreditTransaction {
  id: string
  operation: string
  creditsUsed: number
  timestamp: string
  details?: string
}

export interface CreditUsageStats {
  today: number
  thisWeek: number
  thisMonth: number
  byOperation: Record<string, number>
  history: CreditTransaction[]
}

export interface OperationCost {
  operation: string
  baseCost: number
  perTokenCost: number
  description: string
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  BALANCE: 'blogspy_credits_balance',
  TRANSACTIONS: 'blogspy_credits_transactions',
  USAGE_STATS: 'blogspy_credits_usage_stats'
}

// ============================================
// CREDIT PLANS
// ============================================

export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: 'free',
    name: 'Free',
    credits: 50,
    price: 0,
    features: [
      '50 AI credits/month',
      'Basic AI writing',
      '5 drafts storage',
      'Standard export'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    credits: 500,
    price: 19,
    features: [
      '500 AI credits/month',
      'All AI features',
      'Unlimited drafts',
      'Version history',
      'Priority support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 2000,
    price: 49,
    isPopular: true,
    features: [
      '2,000 AI credits/month',
      'All AI features',
      'Unlimited everything',
      'Team collaboration',
      'API access',
      'Custom templates'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 10000,
    price: 199,
    features: [
      '10,000 AI credits/month',
      'Unlimited everything',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ]
  }
]

// ============================================
// OPERATION COSTS
// ============================================

export const OPERATION_COSTS: OperationCost[] = [
  { operation: 'generate-faq', baseCost: 3, perTokenCost: 0.001, description: 'Generate FAQ section' },
  { operation: 'generate-conclusion', baseCost: 2, perTokenCost: 0.001, description: 'Generate conclusion' },
  { operation: 'generate-intro', baseCost: 2, perTokenCost: 0.001, description: 'Generate introduction' },
  { operation: 'generate-outline', baseCost: 2, perTokenCost: 0.0005, description: 'Generate article outline' },
  { operation: 'generate-full-article', baseCost: 10, perTokenCost: 0.002, description: 'Generate full article' },
  { operation: 'expand-text', baseCost: 2, perTokenCost: 0.001, description: 'Expand selected text' },
  { operation: 'rewrite-text', baseCost: 2, perTokenCost: 0.001, description: 'Rewrite selected text' },
  { operation: 'shorten-text', baseCost: 1, perTokenCost: 0.0005, description: 'Shorten selected text' },
  { operation: 'fix-grammar', baseCost: 1, perTokenCost: 0.0005, description: 'Fix grammar issues' },
  { operation: 'draft-definition', baseCost: 1, perTokenCost: 0.0005, description: 'Draft a definition' },
  { operation: 'serp-analysis', baseCost: 5, perTokenCost: 0, description: 'Analyze SERP competitors' },
  { operation: 'content-analysis', baseCost: 3, perTokenCost: 0, description: 'Analyze competitor content' }
]

// ============================================
// CREDITS SERVICE CLASS
// ============================================

class CreditsService {
  private balance: CreditBalance | null = null
  private transactions: CreditTransaction[] = []

  constructor() {
    this.loadBalance()
    this.loadTransactions()
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private loadBalance(): void {
    if (typeof window === 'undefined') return

    try {
      const data = localStorage.getItem(STORAGE_KEYS.BALANCE)
      if (data) {
        this.balance = JSON.parse(data)
      } else {
        // Initialize with free plan
        this.initializeBalance('free')
      }
    } catch (error) {
      console.warn('Failed to load credit balance:', error)
      this.initializeBalance('free')
    }
  }

  private loadTransactions(): void {
    if (typeof window === 'undefined') return

    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      if (data) {
        this.transactions = JSON.parse(data)
      }
    } catch (error) {
      console.warn('Failed to load transactions:', error)
    }
  }

  private initializeBalance(planId: string): void {
    const plan = CREDIT_PLANS.find(p => p.id === planId) || CREDIT_PLANS[0]
    
    this.balance = {
      total: plan.credits,
      used: 0,
      remaining: plan.credits,
      resetDate: this.getNextResetDate(),
      plan
    }
    
    this.saveBalance()
  }

  private getNextResetDate(): string {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toISOString()
  }

  // ============================================
  // BALANCE OPERATIONS
  // ============================================

  /**
   * Get current credit balance
   */
  getBalance(): CreditBalance {
    // Check if reset is needed
    this.checkAndResetIfNeeded()
    
    return this.balance || {
      total: 50,
      used: 0,
      remaining: 50,
      resetDate: this.getNextResetDate(),
      plan: CREDIT_PLANS[0]
    }
  }

  /**
   * Check if user has enough credits for an operation
   */
  hasEnoughCredits(operation: string, estimatedTokens = 0): boolean {
    const cost = this.calculateCost(operation, estimatedTokens)
    const balance = this.getBalance()
    return balance.remaining >= cost
  }

  /**
   * Calculate cost for an operation
   */
  calculateCost(operation: string, tokens = 0): number {
    const opCost = OPERATION_COSTS.find(o => o.operation === operation)
    if (!opCost) return 1 // Default cost
    
    return Math.ceil(opCost.baseCost + (tokens * opCost.perTokenCost))
  }

  /**
   * Deduct credits for an operation
   */
  async deductCredits(
    operation: string,
    tokens = 0,
    details?: string
  ): Promise<{ success: boolean; remaining: number; error?: string }> {
    const cost = this.calculateCost(operation, tokens)
    const balance = this.getBalance()

    if (balance.remaining < cost) {
      return {
        success: false,
        remaining: balance.remaining,
        error: `Insufficient credits. Need ${cost}, have ${balance.remaining}`
      }
    }

    // Deduct
    balance.used += cost
    balance.remaining -= cost
    this.balance = balance
    this.saveBalance()

    // Record transaction
    const transaction: CreditTransaction = {
      id: this.generateId(),
      operation,
      creditsUsed: cost,
      timestamp: new Date().toISOString(),
      details
    }
    this.transactions.push(transaction)
    this.saveTransactions()

    return {
      success: true,
      remaining: balance.remaining
    }
  }

  /**
   * Add credits (for purchases, bonuses, etc.)
   */
  async addCredits(
    amount: number,
    reason: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const balance = this.getBalance()
    
    balance.total += amount
    balance.remaining += amount
    this.balance = balance
    this.saveBalance()

    // Record transaction
    const transaction: CreditTransaction = {
      id: this.generateId(),
      operation: 'credit-addition',
      creditsUsed: -amount, // Negative for additions
      timestamp: new Date().toISOString(),
      details: reason
    }
    this.transactions.push(transaction)
    this.saveTransactions()

    return {
      success: true,
      newBalance: balance.remaining
    }
  }

  // ============================================
  // PLAN MANAGEMENT
  // ============================================

  /**
   * Upgrade to a new plan
   */
  async upgradePlan(planId: string): Promise<{ success: boolean; error?: string }> {
    const plan = CREDIT_PLANS.find(p => p.id === planId)
    if (!plan) {
      return { success: false, error: 'Invalid plan' }
    }

    // In production: Process payment via Stripe
    // const paymentResult = await stripeService.createSubscription(planId)
    // if (!paymentResult.success) return { success: false, error: paymentResult.error }

    const balance = this.getBalance()
    const currentCredits = balance.remaining
    
    // Set new plan with carried over credits
    this.balance = {
      total: plan.credits,
      used: 0,
      remaining: plan.credits + currentCredits, // Carry over unused
      resetDate: this.getNextResetDate(),
      plan
    }
    this.saveBalance()

    return { success: true }
  }

  /**
   * Get all available plans
   */
  getPlans(): CreditPlan[] {
    return CREDIT_PLANS
  }

  /**
   * Get current plan
   */
  getCurrentPlan(): CreditPlan {
    const balance = this.getBalance()
    return balance.plan
  }

  // ============================================
  // USAGE STATISTICS
  // ============================================

  /**
   * Get usage statistics
   */
  getUsageStats(): CreditUsageStats {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekStart = todayStart - (now.getDay() * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    let today = 0
    let thisWeek = 0
    let thisMonth = 0
    const byOperation: Record<string, number> = {}

    this.transactions.forEach(t => {
      if (t.creditsUsed < 0) return // Skip additions
      
      const timestamp = new Date(t.timestamp).getTime()
      
      if (timestamp >= todayStart) today += t.creditsUsed
      if (timestamp >= weekStart) thisWeek += t.creditsUsed
      if (timestamp >= monthStart) thisMonth += t.creditsUsed
      
      byOperation[t.operation] = (byOperation[t.operation] || 0) + t.creditsUsed
    })

    return {
      today,
      thisWeek,
      thisMonth,
      byOperation,
      history: this.transactions.slice(-50) // Last 50 transactions
    }
  }

  /**
   * Get operation costs
   */
  getOperationCosts(): OperationCost[] {
    return OPERATION_COSTS
  }

  // ============================================
  // RESET & MAINTENANCE
  // ============================================

  private checkAndResetIfNeeded(): void {
    if (!this.balance) return
    
    const resetDate = new Date(this.balance.resetDate)
    if (new Date() >= resetDate) {
      // Reset credits for new billing period
      this.balance = {
        ...this.balance,
        used: 0,
        remaining: this.balance.plan.credits,
        resetDate: this.getNextResetDate()
      }
      this.saveBalance()
      
      // Clear old transactions
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - 3) // Keep 3 months
      this.transactions = this.transactions.filter(
        t => new Date(t.timestamp) >= cutoff
      )
      this.saveTransactions()
    }
  }

  // ============================================
  // STORAGE
  // ============================================

  private saveBalance(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(this.balance))
  }

  private saveTransactions(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions))
  }

  private generateId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Reset all credit data (for testing)
   */
  resetAll(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.BALANCE)
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS)
    this.balance = null
    this.transactions = []
    this.loadBalance()
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const creditsService = new CreditsService()

// Export class for testing
export { CreditsService }
