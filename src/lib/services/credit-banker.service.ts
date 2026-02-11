import "server-only"

import { createAdminClient } from "@/lib/supabase/server"

export type CreditBalance = {
  total: number
  used: number
  remaining: number
}

export type CreditDeductResult =
  | { success: true; remaining: number; idempotencyKey: string }
  | { success: false; error: string; remaining?: number; idempotencyKey?: string }

export type CreditRefundResult =
  | { success: true; remaining: number }
  | { success: false; error: string; remaining?: number }

class CreditBanker {
  private static instance: CreditBanker

  private constructor() {}

  static getInstance(): CreditBanker {
    if (!CreditBanker.instance) {
      CreditBanker.instance = new CreditBanker()
    }
    return CreditBanker.instance
  }

  private getAdmin() {
    return createAdminClient()
  }

  async getBalance(userId: string): Promise<CreditBalance | null> {
    const admin = this.getAdmin()

    const { data: row, error } = await admin
      .from("bill_credits")
      .select("credits_total, credits_used")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      return null
    }

    if (!row) {
      const { data: inserted, error: insertError } = await admin
        .from("bill_credits")
        .insert({ user_id: userId, credits_total: 0, credits_used: 0 })
        .select("credits_total, credits_used")
        .single()

      if (insertError || !inserted) return null

      return {
        total: inserted.credits_total,
        used: inserted.credits_used,
        remaining: Math.max(inserted.credits_total - inserted.credits_used, 0),
      }
    }

    return {
      total: row.credits_total,
      used: row.credits_used,
      remaining: Math.max(row.credits_total - row.credits_used, 0),
    }
  }

  async deduct(
    userId: string,
    amount: number,
    feature: string,
    description: string,
    metadata: Record<string, unknown> = {},
    idempotencyKey?: string
  ): Promise<CreditDeductResult> {
    const admin = this.getAdmin()
    const resolvedIdempotencyKey = idempotencyKey ?? crypto.randomUUID()

    const { data, error } = await admin.rpc("consume_credits_atomic", {
      p_user_id: userId,
      p_amount: amount,
      p_feature_name: feature,
      p_description: description,
      p_metadata: metadata,
      p_idempotency_key: resolvedIdempotencyKey,
    })

    if (error) {
      return { success: false, error: error.message, idempotencyKey: resolvedIdempotencyKey }
    }

    const result = Array.isArray(data) ? data[0] : data
    if (!result || result.success !== true) {
      return {
        success: false,
        error: "INSUFFICIENT_CREDITS",
        remaining: result?.balance,
        idempotencyKey: resolvedIdempotencyKey,
      }
    }

    return {
      success: true,
      remaining: typeof result.balance === "number" ? result.balance : 0,
      idempotencyKey: resolvedIdempotencyKey,
    }
  }

  async refund(
    userId: string,
    amount: number,
    idempotencyKeyOrTxId: string,
    reason: string
  ): Promise<CreditRefundResult> {
    const admin = this.getAdmin()
    let idempotencyKey = idempotencyKeyOrTxId

    // If the caller passed a transaction UUID (legacy path), look up its idempotency_key
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (isUuid.test(idempotencyKeyOrTxId)) {
      const { data: txRow } = await admin
        .from("bill_transactions")
        .select("idempotency_key")
        .eq("id", idempotencyKeyOrTxId)
        .maybeSingle()

      if (txRow?.idempotency_key) {
        idempotencyKey = txRow.idempotency_key
      }
    }

    const { data, error } = await admin.rpc("refund_credits_atomic", {
      p_user_id: userId,
      p_amount: amount,
      p_idempotency_key: idempotencyKey,
    })

    if (error) {
      console.error("[CreditBanker.refund] Refund failed:", {
        userId,
        amount,
        reason,
        idempotencyKey,
        error: error.message,
      })
      return { success: false, error: error.message }
    }

    const result = Array.isArray(data) ? data[0] : data
    if (!result || result.success !== true) {
      return { success: false, error: "REFUND_FAILED", remaining: result?.balance }
    }

    return {
      success: true,
      remaining: typeof result.balance === "number" ? result.balance : 0,
    }
  }
}

export const creditBanker = CreditBanker.getInstance()
export { CreditBanker }
