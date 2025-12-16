"use client"

import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, HelpCircleIcon } from "@/components/icons/platform-icons"
import { Badge } from "@/components/ui/badge"
import { getStatusColor, getStatusBgColor, getStatusLabel } from "../utils/citation-utils"
import type { CitationStatus } from "../types"

interface StatusBadgeProps {
  status: CitationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = status === "cited" ? CheckCircleIcon 
    : status === "partial" ? AlertCircleIcon 
    : status === "not-cited" ? XCircleIcon 
    : HelpCircleIcon

  return (
    <Badge
      variant="secondary"
      className={`${getStatusBgColor(status)} ${getStatusColor(status)} border-0 font-medium`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {getStatusLabel(status)}
    </Badge>
  )
}
