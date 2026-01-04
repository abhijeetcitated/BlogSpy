"use server"

// ============================================
// 🛡️ FETCH DRAWER DATA - Robust Server Action
// ============================================
// Fetches Amazon/Commerce data for Keyword Details Drawer
// Features:
// - Zod input validation
// - Mock mode for development
// - Comprehensive error handling (never crashes UI)
// - Retry support
// ============================================

import { z } from "zod"
import { action } from "@/lib/safe-action"  // Public action for dev, switch to authAction for prod
import type { AmazonProduct, AmazonData, DrawerDataResponse } from "../types"

// ============================================
// ZOD VALIDATION SCHEMA
// ============================================

const FetchAmazonDataSchema = z.object({
  keyword: z.string().min(1, "Keyword is required").max(200, "Keyword too long"),
  country: z.string().length(2).default("US"),
})

// ============================================
// MOCK DATA GENERATOR
// ============================================

function generateMockAmazonData(keyword: string): AmazonData {
  const hash = keyword.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const categories = [
    "Electronics",
    "Home & Kitchen", 
    "Sports & Outdoors",
    "Office Products",
    "Health & Personal Care",
    "Tools & Home Improvement",
    "Clothing & Accessories",
  ]
  
  const products: AmazonProduct[] = Array.from({ length: 5 }, (_, i) => {
    const basePrice = 19.99 + (hash % 100) + i * 15
    const rating = Math.round((3.5 + ((hash + i) % 15) / 10) * 10) / 10
    const reviews = Math.floor(100 + (hash * (i + 1)) % 10000)
    
    return {
      asin: `B0${hash.toString().slice(0, 2)}${String(i).padStart(6, "0")}`,
      title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - ${
        ["Premium Edition", "Professional Grade", "Best Seller", "Top Rated", "Budget Friendly"][i]
      }`,
      price: Math.round(basePrice * 100) / 100,
      currency: "USD",
      rating: Math.min(5, rating),
      reviews,
      category: categories[(hash + i) % categories.length],
      imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(keyword.slice(0, 10))}`,
      productUrl: `https://amazon.com/dp/B0${hash.toString().slice(0, 2)}${String(i).padStart(6, "0")}`,
      affiliatePotential: i < 2 ? "high" : i < 4 ? "medium" : "low",
      isPrime: i < 3,
      inStock: i !== 4, // Last one out of stock for variety
    }
  })

  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length
  const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / products.length

  return {
    products,
    avgPrice: Math.round(avgPrice * 100) / 100,
    avgRating: Math.round(avgRating * 10) / 10,
    totalProducts: Math.floor(50 + (hash % 500)),
    competitionLevel: hash % 3 === 0 ? "low" : hash % 3 === 1 ? "medium" : "high",
    fetchedAt: new Date().toISOString(),
  }
}

// ============================================
// 🛡️ SECURED SERVER ACTION
// ============================================

export const fetchAmazonData = action
  .schema(FetchAmazonDataSchema)
  .action(async ({ parsedInput }): Promise<DrawerDataResponse<AmazonData>> => {
    const { keyword, country } = parsedInput

    console.log(`[fetchAmazonData] Fetching for: "${keyword}" in ${country}`)

    // ─────────────────────────────────────────
    // MOCK MODE (for development/testing)
    // ─────────────────────────────────────────
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("[fetchAmazonData] Using MOCK data mode")

      try {
        // Simulate network delay (0.8-1.5 seconds)
        const delay = 800 + Math.random() * 700
        await new Promise((resolve) => setTimeout(resolve, delay))

        // Simulate random failures (10% chance) for testing error handling
        if (Math.random() < 0.1) {
          console.log("[fetchAmazonData] Simulating random failure for testing")
          return {
            success: false,
            error: "Simulated API failure for testing error handling",
            isRetryable: true,
            source: "mock",
          }
        }

        const mockData = generateMockAmazonData(keyword)

        return {
          success: true,
          data: mockData,
          source: "mock",
        }
      } catch (error) {
        console.error("[fetchAmazonData] Mock generation error:", error)
        return {
          success: false,
          error: "Failed to generate mock data",
          isRetryable: true,
          source: "mock",
        }
      }
    }

    // ─────────────────────────────────────────
    // REAL API MODE (Amazon PA-API)
    // ─────────────────────────────────────────
    console.log("[fetchAmazonData] Real API mode - Amazon PA-API")

    try {
      // Check for API credentials
      const accessKey = process.env.AMAZON_ACCESS_KEY
      const secretKey = process.env.AMAZON_SECRET_KEY
      const partnerTag = process.env.AMAZON_PARTNER_TAG

      if (!accessKey || !secretKey || !partnerTag) {
        console.warn("[fetchAmazonData] Amazon API credentials not configured")
        return {
          success: false,
          error: "Amazon API not configured. Please set up API credentials.",
          isRetryable: false,
          source: "amazon",
        }
      }

      // TODO: Implement actual Amazon PA-API call
      // For now, return mock data with a warning
      console.log("[fetchAmazonData] PA-API integration pending, returning mock")
      
      const mockData = generateMockAmazonData(keyword)
      return {
        success: true,
        data: mockData,
        source: "mock", // Will change to "amazon" when real API is implemented
      }

    } catch (error) {
      // ─────────────────────────────────────────
      // COMPREHENSIVE ERROR HANDLING
      // ─────────────────────────────────────────
      console.error("[fetchAmazonData] API Error:", error)

      // Determine if error is retryable
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const isNetworkError = errorMessage.includes("fetch") || 
                            errorMessage.includes("network") ||
                            errorMessage.includes("timeout") ||
                            errorMessage.includes("ECONNREFUSED")
      
      const isRateLimited = errorMessage.includes("429") || 
                           errorMessage.includes("rate limit") ||
                           errorMessage.includes("too many requests")

      // Never throw - always return structured error
      return {
        success: false,
        error: isRateLimited 
          ? "Rate limit exceeded. Please wait a moment and try again."
          : isNetworkError
          ? "Unable to reach Amazon API. Please check your connection."
          : "Failed to fetch Amazon data. Please try again.",
        isRetryable: isNetworkError || isRateLimited,
        source: "amazon",
      }
    }
  })

// ============================================
// EXPORT TYPE FOR CLIENT USE
// ============================================

export type FetchAmazonDataAction = typeof fetchAmazonData
