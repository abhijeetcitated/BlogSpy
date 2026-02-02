"use client"

import { useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordModal } from "@/features/settings/components/ChangePasswordModal"

interface AccountSecurityCardProps {
  lastPasswordChange?: Date | string | null
  canChangePassword: boolean
}

export function AccountSecurityCard({
  lastPasswordChange,
  canChangePassword,
}: AccountSecurityCardProps) {
  const lastChangedLabel = useMemo(() => {
    const date = lastPasswordChange ? new Date(lastPasswordChange) : new Date()
    return formatDistanceToNow(date, { addSuffix: true })
  }, [lastPasswordChange])

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          Account Security
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Manage your password and account access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-foreground font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Last changed {lastChangedLabel}
              </p>
            </div>
          </div>
          {canChangePassword ? (
            <ChangePasswordModal />
          ) : (
            <p className="text-sm text-muted-foreground">Managed by Google</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
