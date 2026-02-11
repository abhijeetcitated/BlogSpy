"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useShallow } from "zustand/react/shallow"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createProject } from "@/features/dashboard/actions/create-project"
import { useUIStore } from "@/store/ui-store"
import { useUserStore } from "@/store/user-store"
import { CountrySelector } from "@/components/shared/ui/country-selector"

type AddProjectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  domain = domain.replace(/^https?:\/\//, "")
  domain = domain.replace(/^www\./, "")
  domain = domain.split("/")[0]
  domain = domain.split("?")[0]
  domain = domain.split("#")[0]
  return domain
}

const CLIENT_COUNTRY_NORMALIZE: Record<string, string> = { GB: "UK" }

function normalizeCountryForDisplay(code: string): string {
  return CLIENT_COUNTRY_NORMALIZE[code.toUpperCase()] ?? code.toUpperCase()
}

export function AddProjectDialog({ open, onOpenChange }: AddProjectDialogProps) {
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const { addProject, removeProject, user } = useUserStore(
    useShallow((state) => ({
      addProject: state.addProject,
      removeProject: state.removeProject,
      user: state.user,
    }))
  )
  const openPricingModal = useUIStore((state) => state.openPricingModal)
  const { executeAsync, status } = useAction(createProject)

  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [country, setCountry] = useState("US")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countryResetKey, setCountryResetKey] = useState(0)

  const isLoading = isSubmitting || status === "executing"

  const clearPointerLocks = () => {
    if (typeof document === "undefined") return
    document.body.style.pointerEvents = ""
    document.documentElement.style.pointerEvents = ""
  }

  const clearFocusLocks = () => {
    if (typeof document === "undefined") return
    const openDialogs = document.querySelectorAll(
      '[data-slot="dialog-content"][data-state="open"]'
    )
    if (openDialogs.length > 0) return

    document.querySelectorAll("[inert]").forEach((node) => {
      node.removeAttribute("inert")
    })
    document.querySelectorAll('[aria-hidden="true"]').forEach((node) => {
      node.removeAttribute("aria-hidden")
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setCountryResetKey((prev) => prev + 1)
      setTimeout(() => {
        clearPointerLocks()
        clearFocusLocks()
      }, 0)
    }
  }

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => {
      nameInputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [open])

  useEffect(() => {
    if (!open) {
      setName("")
      setDomain("")
      setCountry("US")
      setIsSubmitting(false)
    }
  }, [open])

  const isCreateDisabled = useMemo(() => {
    return isLoading || !name.trim() || !domain.trim()
  }, [isLoading, name, domain])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    const cleanedDomain = normalizeDomain(domain)
    if (!name.trim() || !cleanedDomain) {
      toast.error("❌ Please enter a valid name and domain")
      setIsSubmitting(false)
      return
    }

    const optimisticId = `temp-${createIdempotencyKey()}`
    const normalizedCountry = normalizeCountryForDisplay(country)
    const optimisticProject = {
      id: optimisticId,
      userid: user?.id ?? "unknown",
      projectname: name.trim(),
      domain: cleanedDomain,
      targetcountry: normalizedCountry,
      icon: `https://www.google.com/s2/favicons?domain=${cleanedDomain}&sz=64`,
      gscpropertyid: null,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    }

    addProject(optimisticProject)
    toast.success(`✅ Project "${optimisticProject.projectname}" created!`)
    handleOpenChange(false)

    const result = await executeAsync({
      name,
      domain,
      country,
      idempotency_key: createIdempotencyKey(),
    })

    const serverError = typeof result?.serverError === "string" ? result.serverError : undefined
    const validationError =
      result?.validationErrors?.name?._errors?.[0] ??
      result?.validationErrors?.domain?._errors?.[0] ??
      result?.validationErrors?.country?._errors?.[0] ??
      result?.validationErrors?.idempotency_key?._errors?.[0]

    if (serverError || validationError || result?.data?.success === false) {
      removeProject(optimisticId)
      const message =
        result?.data?.error ??
        validationError ??
        serverError ??
        "Failed to create project"

      if (result?.data?.code === "LIMIT_REACHED" || serverError === "LIMIT_REACHED") {
        openPricingModal()
        toast.error("❌ Upgrade to Pro to add more sites.")
      } else if (result?.data?.code === "DUPLICATE_DOMAIN" || serverError === "DUPLICATE_DOMAIN") {
        toast.error("❌ Domain already exists")
      } else if (serverError === "DATABASE_UNAVAILABLE") {
        toast.error("❌ Database is temporarily unavailable. Please try again.")
      } else if (serverError === "DATABASE_ERROR" || serverError === "DATABASE_CONSTRAINT_ERROR") {
        toast.error("❌ A database error occurred. Please try again.")
      } else {
        toast.error(`❌ ${message}`)
      }

      setIsSubmitting(false)
      return
    }

    if (result?.data?.project) {
      removeProject(optimisticId)
      addProject(result.data.project)
    } else {
      removeProject(optimisticId)
      toast.error("❌ Failed to create project")
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Add a domain to set the active context for your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="project-name">
              Project Name
            </label>
            <Input
              id="project-name"
              ref={nameInputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My SEO Project"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="project-domain">
              Domain
            </label>
            <Input
              id="project-domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="google.com"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="project-country">
              Target Country
            </label>
            <CountrySelector
              key={countryResetKey}
              value={country}
              onChange={setCountry}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isCreateDisabled} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
