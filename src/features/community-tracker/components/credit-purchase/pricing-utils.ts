/**
 * Pricing Utilities
 * Business logic for credit pricing calculations
 */

// Credit Packages with INR pricing
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 30,
    price: 1499,
    pricePerCredit: 50,
    popular: false,
    savings: 0,
    features: ["30 keyword tracks", "Reddit + Quora", "7-day data"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 100,
    price: 3999,
    pricePerCredit: 40,
    popular: true,
    savings: 20,
    features: ["100 keyword tracks", "Reddit + Quora", "30-day data", "Priority refresh"],
  },
  {
    id: "business",
    name: "Business",
    credits: 300,
    price: 7999,
    pricePerCredit: 27,
    popular: false,
    savings: 46,
    features: ["300 keyword tracks", "Reddit + Quora", "90-day data", "Priority refresh", "Export reports"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 800,
    price: 14999,
    pricePerCredit: 19,
    popular: false,
    savings: 62,
    features: ["800 keyword tracks", "Reddit + Quora", "Unlimited data", "Priority support", "API access"],
  },
]

// Custom slider configuration
export const CUSTOM_SLIDER = {
  min: 10,
  max: 500,
  step: 10,
  default: 50,
  pricePerCredit: 35, // ₹35 per credit for custom
}

// Format price in INR
export const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate custom price
export const calculateCustomPrice = (credits: number) => {
  return credits * CUSTOM_SLIDER.pricePerCredit
}
