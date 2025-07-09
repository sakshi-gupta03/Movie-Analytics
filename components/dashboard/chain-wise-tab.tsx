"use client"
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
    const topChains = chainPerformance.slice(0, 5) // Show top
