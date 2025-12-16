"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  FileText, 
  HelpCircle, 
  ListOrdered, 
  ShoppingCart, 
  UtensilsCrossed, 
  Star, 
  Video, 
  Link2, 
  Store, 
  CalendarDays, 
  Building2, 
  User, 
  GraduationCap, 
  Briefcase 
} from "lucide-react"
import { SchemaTypeConfig } from "../types"

// Icon mapping for schema types
const SCHEMA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  HelpCircle,
  ListOrdered,
  ShoppingCart,
  UtensilsCrossed,
  Star,
  Video,
  Link2,
  Store,
  CalendarDays,
  Building2,
  User,
  GraduationCap,
  Briefcase
}

interface SchemaTypeCardProps {
  config: SchemaTypeConfig
  onSelect: () => void
}

export function SchemaTypeCard({ config, onSelect }: SchemaTypeCardProps) {
  const IconComponent = SCHEMA_ICONS[config.icon] || FileText

  return (
    <Card 
      className="bg-card border-border hover:border-muted-foreground/50 transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${config.bgColor}`}>
            <IconComponent className={`h-6 w-6 ${config.color}`} />
          </div>
          <Badge 
            variant="outline" 
            className="text-xs text-muted-foreground border-muted-foreground/30"
          >
            {config.popularity}% popular
          </Badge>
        </div>

        <div className="mt-3">
          <h3 className={`font-semibold ${config.color}`}>
            {config.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {config.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {config.fields.length} fields
          </span>
          <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Select
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
