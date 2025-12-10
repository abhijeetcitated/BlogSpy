"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompetitorGapContent, WeakSpotDetector } from "@/components/features"
import { Swords, Target } from "lucide-react"

export default function CompetitorGapPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Swords className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Gap Analysis</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Find keyword opportunities and weak spots to dominate your niche
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="competitor-gap" className="flex-1 flex flex-col">
        <div className="px-6 pt-4 border-b border-border">
          <TabsList className="bg-transparent p-0 h-auto gap-4">
            <TabsTrigger 
              value="competitor-gap"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-amber-400 rounded-none px-1 pb-3 pt-0 text-muted-foreground data-[state=active]:text-amber-400"
            >
              <Swords className="h-4 w-4 mr-2" />
              Competitor Gap
            </TabsTrigger>
            <TabsTrigger 
              value="weak-spots"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-cyan-400 rounded-none px-1 pb-3 pt-0 text-muted-foreground data-[state=active]:text-cyan-400"
            >
              <Target className="h-4 w-4 mr-2" />
              Weak Spot Detector
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded">NEW</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="competitor-gap" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <CompetitorGapContent />
        </TabsContent>

        <TabsContent value="weak-spots" className="flex-1 mt-0 p-6 data-[state=inactive]:hidden">
          <WeakSpotDetector />
        </TabsContent>
      </Tabs>
    </div>
  )
}
