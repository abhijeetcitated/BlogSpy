import "server-only"

import { createAdminClient as createServerAdminClient } from "@/lib/supabase/server"

export function createAdminClient() {
  return createServerAdminClient()
}
