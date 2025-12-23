// Schema Types - Icon mapping

import {
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
  Briefcase,
} from "lucide-react"

// Icon mapping for schema types
export const SCHEMA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

// Rich snippet preview descriptions
export const RICH_SNIPPET_TYPES: Record<string, string> = {
  article: "Article rich result with author and date",
  faq: "FAQ accordion in search results",
  howto: "Step-by-step instructions with images",
  product: "Product card with price and rating",
  recipe: "Recipe card with image and cooking time",
  review: "Star rating in search results",
  video: "Video thumbnail in search results",
  breadcrumb: "Navigation path in search results",
  localbusiness: "Local business card with map",
  event: "Event card with date and location",
  organization: "Organization knowledge panel",
  person: "Person knowledge panel",
  course: "Course card with provider and rating",
  jobposting: "Job posting with salary and company"
}
