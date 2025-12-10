"use client"

import { cn } from "@/lib/utils"
import { ChevronLeft, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderAction {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "ghost"
}

interface PageHeaderProps {
  title: string
  description?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  breadcrumbs?: BreadcrumbItem[]
  backLink?: string
  actions?: PageHeaderAction[]
  menuActions?: PageHeaderAction[]
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  badge,
  badgeVariant = "default",
  breadcrumbs,
  backLink,
  actions,
  menuActions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <span className="mx-1">/</span>}
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-300">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {backLink && (
            <Link href={backLink}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {badge && (
                <Badge 
                  variant={badgeVariant}
                  className={cn(
                    badgeVariant === "default" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  )}
                >
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-slate-400 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {(actions || menuActions) && (
          <div className="flex items-center gap-2">
            {actions?.map((action, index) => {
              const ButtonComponent = (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  onClick={action.onClick}
                  className={cn(
                    action.variant === "default" && "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white",
                    action.variant === "outline" && "border-slate-700 text-slate-300 hover:bg-slate-800"
                  )}
                >
                  {action.icon}
                  {action.label}
                </Button>
              )

              if (action.href) {
                return (
                  <Link key={index} href={action.href}>
                    {ButtonComponent}
                  </Link>
                )
              }

              return ButtonComponent
            })}

            {menuActions && menuActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-slate-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                  {menuActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className="text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Optional additional content (tabs, filters, etc.) */}
      {children}
    </div>
  )
}

// Simple title component for smaller sections
interface SectionTitleProps {
  title: string
  description?: string
  action?: PageHeaderAction
  className?: string
}

export function SectionTitle({ title, description, action, className }: SectionTitleProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="text-sm text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              {action.icon}
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={action.onClick}
            className="text-slate-400 hover:text-white"
          >
            {action.icon}
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
