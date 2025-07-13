"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "./overview-tab"
import { ConsolidatedDCRTab } from "./consolidated-dcr-tab"
import { CircuitWiseTab } from "./circuit-wise-tab"
import { ChainGraphTab } from "./chain-graph-tab"
import type { FilterState } from "@/lib/types"

interface DashboardTabsProps {
  filters: FilterState
}

export function DashboardTabs({ filters }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="flex w-full h-10 p-1 bg-muted rounded-md gap-2">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap text-sm font-medium"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="circuit"
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap text-sm font-medium"
        >
          Circuit-wise
        </TabsTrigger>
        <TabsTrigger
          value="chain"
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap text-sm font-medium"
        >
          Chain Graph
        </TabsTrigger>
        <TabsTrigger
          value="dcr"
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap text-sm font-medium"
        >
          Collection Report
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-6">
        <OverviewTab filters={filters} />
      </TabsContent>

      <TabsContent value="circuit" className="space-y-4 mt-6">
        <CircuitWiseTab filters={filters} />
      </TabsContent>

      <TabsContent value="chain" className="space-y-4 mt-6">
        <ChainGraphTab filters={filters} />
      </TabsContent>

      <TabsContent value="dcr" className="space-y-4 mt-6">
        <ConsolidatedDCRTab filters={filters} />
      </TabsContent>
    </Tabs>
  )
}
