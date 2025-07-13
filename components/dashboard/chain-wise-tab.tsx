"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import type { FilterState } from "@/lib/types"
import { chains, circuits, generatePerformanceData } from "@/lib/actual-data"

interface ChainWiseTabProps {
  filters: FilterState
}

type MetricType = "collection" | "shows" | "audience"

export function ChainWiseTab({ filters }: ChainWiseTabProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("collection")

  const allPerformanceData = generatePerformanceData()

  // Filter data based on current filters
  const filteredData = allPerformanceData.filter((item) => {
    // Filter by movie
    if (filters.movieId && item.movieId !== filters.movieId) return false

    // Filter by chains
    if (filters.chainIds.length > 0 && !filters.chainIds.includes(item.chainId)) return false

    // Filter by circuits
    if (filters.circuitIds.length > 0) {
      const chain = chains.find((c) => c.id === item.chainId)
      if (!chain || !filters.circuitIds.includes(chain.circuitId)) return false
    }

    // Filter by theater types
    if (filters.theaterTypes.length > 0) {
      const chain = chains.find((c) => c.id === item.chainId)
      if (!chain) return false
      
      const typeMatch = filters.theaterTypes.some(filterType => {
        if (filterType === "national-chain-multiplex") return chain.theaterType === "National Chain Multiplex"
        if (filterType === "non-national-chain-multiplex") return chain.theaterType === "Non National Chain Multiplex"
        if (filterType === "single-screen") return chain.theaterType === "Single Screen"
        if (filterType === "army-cinema") return chain.theaterType === "Army Cinema"
        return false
      })
      
      if (!typeMatch) return false
    }

    // Filter by week numbers
    if (filters.weekNumbers.length > 0 && !filters.weekNumbers.includes(item.weekNumber.toString())) {
      return false
    }

    return true
  })

  // Get chains that have data in filtered results
  const getDisplayChains = () => {
    if (filters.chainIds.length > 0) {
      return chains.filter((chain) => filters.chainIds.includes(chain.id))
    } else {
      const chainsWithData = new Set<string>()
      filteredData.forEach((item) => {
        chainsWithData.add(item.chainId)
      })
      return chains.filter((chain) => chainsWithData.has(chain.id))
    }
  }

  const displayChains = getDisplayChains()

  // Calculate chain performance data
  const chainPerformance = displayChains
    .map((chain) => {
      const chainData = filteredData.filter((item) => item.chainId === chain.id)
      const circuit = circuits.find((c) => c.id === chain.circuitId)

      const totalCollection = chainData.reduce((sum, item) => sum + item.revenue, 0)
      const totalShows = chainData.length
      const totalAudience = chainData.reduce((sum, item) => sum + item.ticketsSold, 0)
      const avgOccupancy = chainData.length > 0 
        ? chainData.reduce((sum, item) => sum + item.occupancy, 0) / chainData.length 
        : 0

      // Calculate trend (compare first half vs second half of data)
      const midPoint = Math.floor(chainData.length / 2)
      const firstHalf = chainData.slice(0, midPoint)
      const secondHalf = chainData.slice(midPoint)
      
      const firstHalfAvg = firstHalf.length > 0 
        ? firstHalf.reduce((sum, item) => sum + item.revenue, 0) / firstHalf.length 
        : 0
      const secondHalfAvg = secondHalf.length > 0 
        ? secondHalf.reduce((sum, item) => sum + item.revenue, 0) / secondHalf.length 
        : 0
      
      const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

      return {
        name: chain.name,
        collection: totalCollection,
        shows: totalShows,
        audience: totalAudience,
        occupancy: Math.round(avgOccupancy),
        trend: Math.round(trend * 10) / 10,
        location: circuit?.name || "Unknown",
        theaterType: chain.theaterType,
        screens: chain.screens,
      }
    })
    .filter((chain) => chain.collection > 0 || chain.shows > 0)
    .sort((a, b) => b[selectedMetric] - a[selectedMetric])

  // Generate weekly trend data for top chains
  const generateWeeklyTrend = () => {
    const selectedWeeks = filters.weekNumbers.length > 0 ? filters.weekNumbers.map(Number) : [1, 2, 3, 4, 5, 6, 7, 8]
    const topChains = chainPerformance.slice(0, 5) // Show top 5 chains

    return topChains.map((chain) => {
      const weeklyData = selectedWeeks.map((week) => {
        const weekData = filteredData.filter((item) => item.chainId === chain.name && item.weekNumber === week)
        const totalCollection = weekData.reduce((sum, item) => sum + item.revenue, 0)
        const totalShows = weekData.length
        const totalAudience = weekData.reduce((sum, item) => sum + item.ticketsSold, 0)
        const avgOccupancy = weekData.length > 0 
          ? weekData.reduce((sum, item) => sum + item.occupancy, 0) / weekData.length 
          : 0

        return {
          week,
          collection: totalCollection,
          shows: totalShows,
          audience: totalAudience,
          occupancy: Math.round(avgOccupancy),
        }
      })

      return {
        chain: chain.name,
        data: weeklyData,
      }
    })
  }

  const weeklyTrendData = generateWeeklyTrend()

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="collection">Collection</SelectItem>
            <SelectItem value="shows">Shows</SelectItem>
            <SelectItem value="audience">Audience</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {chainPerformance.length === 0 ? (
        <p className="text-center text-muted-foreground">No data available for the selected filters.</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {chainPerformance.map((chain) => (
              <Card key={chain.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{chain.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Collection</p>
                      <p className="text-xl font-bold">{chain.collection.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Shows</p>
                      <p className="text-xl font-bold">{chain.shows.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Audience</p>
                      <p className="text-xl font-bold">{chain.audience.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Occupancy</p>
                      <p className="text-xl font-bold">{chain.occupancy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <p className="text-xl font-bold">{chain.trend}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Weekly Trend for Top Chains</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyTrendData.length === 0 ? (
                <p className="text-center text-muted-foreground">No weekly trend data available.</p>
              ) : (
                <div className="grid gap-4">
                  {weeklyTrendData.map((chain) => (
                    <div key={chain.chain} className="rounded-md border p-4">
                      <h3 className="text-md font-semibold">{chain.chain}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {chain.data.map((weekData) => (
                          <div key={weekData.week} className="text-center">
                            <p className="text-xs text-muted-foreground">Week {weekData.week}</p>
                            <p className="text-sm font-bold">{weekData[selectedMetric].toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
