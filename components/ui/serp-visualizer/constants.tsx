import {
  Sparkles,
  FileText,
  HelpCircle,
  Video,
  Image,
  MapPin,
  ShoppingCart,
  DollarSign,
  Info,
  Newspaper,
  Globe,
  Link,
} from "lucide-react"
import type { SERPElementType } from "@/types/pixel.types"

export const SERP_ICONS: Record<SERPElementType, React.ReactNode> = {
  ai_overview: <Sparkles className="h-3 w-3" />,
  featured_snippet: <FileText className="h-3 w-3" />,
  people_also_ask: <HelpCircle className="h-3 w-3" />,
  video_carousel: <Video className="h-3 w-3" />,
  image_pack: <Image className="h-3 w-3" />,
  local_pack: <MapPin className="h-3 w-3" />,
  shopping_ads: <ShoppingCart className="h-3 w-3" />,
  top_ads: <DollarSign className="h-3 w-3" />,
  knowledge_panel: <Info className="h-3 w-3" />,
  top_stories: <Newspaper className="h-3 w-3" />,
  organic: <Globe className="h-3 w-3" />,
  site_links: <Link className="h-3 w-3" />,
  bottom_ads: <DollarSign className="h-3 w-3" />,
}

export const SERP_COLORS: Record<SERPElementType, string> = {
  ai_overview: "bg-purple-500/30 border-purple-500/50 text-purple-300",
  featured_snippet: "bg-emerald-500/30 border-emerald-500/50 text-emerald-300",
  people_also_ask: "bg-blue-500/30 border-blue-500/50 text-blue-300",
  video_carousel: "bg-red-500/30 border-red-500/50 text-red-300",
  image_pack: "bg-pink-500/30 border-pink-500/50 text-pink-300",
  local_pack: "bg-green-500/30 border-green-500/50 text-green-300",
  shopping_ads: "bg-orange-500/30 border-orange-500/50 text-orange-300",
  top_ads: "bg-amber-500/30 border-amber-500/50 text-amber-300",
  knowledge_panel: "bg-cyan-500/30 border-cyan-500/50 text-cyan-300",
  top_stories: "bg-indigo-500/30 border-indigo-500/50 text-indigo-300",
  organic: "bg-slate-500/30 border-slate-500/50 text-slate-300",
  site_links: "bg-slate-500/30 border-slate-500/50 text-slate-300",
  bottom_ads: "bg-amber-500/30 border-amber-500/50 text-amber-300",
}
