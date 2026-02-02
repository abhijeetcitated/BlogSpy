"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { useAuth } from "@/contexts/auth-context"
import { deleteAccountAction } from "@/features/settings/actions/delete-account"

export function DangerZone() {
  const { user, logout } = useAuth()
  const { executeAsync } = useAction(deleteAccountAction)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user || !("id" in user)) {
      toast.error("You must be logged in to delete your account.")
      return
    }

    setIsDeleting(true)
    try {
      const result = await executeAsync({ userId: user.id })
      const serverError =
        typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) {
        toast.error(serverError)
        return
      }

      if (!result?.data?.success) {
        toast.error("Failed to delete account.")
        return
      }

      toast.success("Account deleted successfully. Redirecting...")
      void logout()
      const redirectTo = result?.data?.redirectTo || "/"
      window.location.href = redirectTo
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="bg-card/50 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-red-500">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <div>
            <p className="font-medium text-foreground">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Delete account?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action is permanent. Your data and credits will be removed and cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
