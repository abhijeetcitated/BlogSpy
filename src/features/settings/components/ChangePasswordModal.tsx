"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Eye, EyeOff, X } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangePasswordSchema, type ChangePasswordInput } from "@/features/settings/schemas/security.schema"
import { updatePassword } from "@/features/settings/actions/security-actions"

const requirementChecks = (value: string, confirm: string) => ({
  minLength: value.length >= 8,
  hasUppercase: /[A-Z]/.test(value),
  hasLowercase: /[a-z]/.test(value),
  hasNumber: /[0-9]/.test(value),
  hasSpecial: /[!@#$%^&*]/.test(value),
  matches: value.length > 0 && value === confirm,
})

export function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const { executeAsync } = useAction(updatePassword)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
  })

  const newPassword = watch("newPassword") || ""
  const confirmPassword = watch("confirmPassword") || ""

  const validation = useMemo(
    () => requirementChecks(newPassword, confirmPassword),
    [newPassword, confirmPassword]
  )

  const onSubmit = handleSubmit(async (values) => {
    const result = await executeAsync(values)
    const serverError =
      typeof result?.serverError === "string" ? result.serverError : undefined
    if (serverError) {
      if (serverError === "WRONG_CURRENT_PASSWORD") {
        toast.error("Wrong current password.")
      } else {
        toast.error(serverError)
      }
      return
    }
    if (!result?.data?.success) {
      toast.error("Failed to update password.")
      return
    }
    toast.success("Password changed successfully. Your security record has been updated.")
    reset()
    setIsOpen(false)
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border text-muted-foreground hover:bg-accent bg-transparent">
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Change Password</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a strong password that you don't use elsewhere.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-foreground">Current Password</Label>
            <div className="relative">
              <Input
                type={show.current ? "text" : "password"}
                placeholder="Enter current password"
                className="bg-input/50 border-border text-foreground pr-10"
                {...register("currentPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShow((prev) => ({ ...prev, current: !prev.current }))}
              >
                {show.current ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">New Password</Label>
            <div className="relative">
              <Input
                type={show.next ? "text" : "password"}
                placeholder="Enter new password"
                className="bg-input/50 border-border text-foreground pr-10"
                {...register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShow((prev) => ({ ...prev, next: !prev.next }))}
              >
                {show.next ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${validation.minLength ? "text-emerald-500" : "text-muted-foreground"}`}>
              {validation.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              At least 8 characters
            </div>
            <div className={`flex items-center gap-1 ${validation.hasUppercase ? "text-emerald-500" : "text-muted-foreground"}`}>
              {validation.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              One uppercase letter
            </div>
            <div className={`flex items-center gap-1 ${validation.hasLowercase ? "text-emerald-500" : "text-muted-foreground"}`}>
              {validation.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              One lowercase letter
            </div>
            <div className={`flex items-center gap-1 ${validation.hasNumber ? "text-emerald-500" : "text-muted-foreground"}`}>
              {validation.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              One number
            </div>
            <div className={`flex items-center gap-1 ${validation.hasSpecial ? "text-emerald-500" : "text-muted-foreground"}`}>
              {validation.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              One special character
            </div>
            <div className={`flex items-center gap-1 ${validation.matches ? "text-emerald-500" : "text-muted-foreground"}`}>
              {validation.matches ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              Passwords match
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={show.confirm ? "text" : "password"}
                placeholder="Confirm new password"
                className="bg-input/50 border-border text-foreground pr-10"
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShow((prev) => ({ ...prev, confirm: !prev.confirm }))}
              >
                {show.confirm ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="border-border" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#FFD700] text-black hover:bg-[#FFC400]">
              {isSubmitting && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />}
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
