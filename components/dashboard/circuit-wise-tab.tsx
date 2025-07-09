"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts"
import { MapPin, TrendingUp, TrendingDown, Users, Film, DollarSign, Calendar } from "lucide-react"
import { useState } from "react"
import type { FilterState } from "@/lib/types"
import { circuits, chains, generatePerformanceData } from "@/lib/actual-data"

interface CircuitWiseTabProps {
  filters: FilterState
}

type MetricType = "collection" | "shows" | "audience"

export function CircuitWiseTab({ filters }: CircuitWiseTabProps) {
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

      const typeMatch = filters.theaterTypes.some((filterType) => {
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

  // Get only the circuits that should be displayed based on filters
  const getDisplayCircuits = () => {
    if (filters.circuitIds.length > 0) {
      // If specific circuits are selected, only show those
      return circuits.filter((circuit) => filters.circuitIds.includes(circuit.id))
    } else {
      // If no circuits are specifically selected, show circuits that have data in the filtered results
      const circuitsWithData = new Set<string>()

      filteredData.forEach((item) => {
        const chain = chains.find((c) => c.id === item.chainId)
        if (chain) {
          circuitsWithData.add(chain.circuitId)
        }
      })

      return circuits.filter((circuit) => circuitsWithData.has(circuit.id))
    }
  }

  const displayCircuits = getDisplayCircuits()

  // Calculate circuit-wise data only for display circuits
  const circuitData = displayCircuits
    .map((circuit) => {
      const circuitChains = chains.filter((chain) => chain.circuitId === circuit.id)

      const circuitPerformanceData = filteredData.filter((item) => {
        return circuitChains.some((chain) => chain.id === item.chainId)
      })

      const totalCollection = circuitPerformanceData.reduce((sum, item) => sum + item.revenue, 0)
      const totalShows = circuitPerformanceData.length
      const totalAudience = circuitPerformanceData.reduce((sum, item) => sum + item.ticketsSold, 0)
      const avgOccupancy =
        circuitPerformanceData.length > 0
          ? circuitPerformanceData.reduce((sum, item) => sum + item.occupancy, 0) / circuitPerformanceData.length
          : 0

      return {
        name: circuit.name,
        region: circuit.region,
        collection: totalCollection,
        shows: totalShows,
        audience: totalAudience,
        avgOccupancy,
        theaters: circuitChains.length,
      }
    })
    .filter((circuit) => circuit.collection > 0 || circuit.shows > 0 || circuit.audience > 0)

  // Generate time-based trend data only for display circuits
  const generateTrendData = () => {
    const selectedWeeks = filters.weekNumbers.length > 0 ? filters.weekNumbers.map(Number) : [1, 2, 3, 4, 5, 6, 7, 8]

    if (filters.weekNumbers.length === 1) {
      // If single week selected, show days 1-7
      const weekNumber = Number(filters.weekNumbers[0])
      return Array.from({ length: 7 }, (_, dayIndex) => {
        const day = dayIndex + 1
        const dayData: any = {
          date: `Day ${day}`,
          fullDate: `Week ${weekNumber}, Day ${day}`,
        }

        displayCircuits.forEach((circuit) => {
          const circuitChains = chains.filter((chain) => chain.circuitId === circuit.id)

          const dayPerformanceData = filteredData.filter((item) => {
            const itemDate = new Date(item.date)
            const isCorrectWeekAndDay = item.weekNumber === weekNumber && itemDate.getDay() === dayIndex
            const isCircuitMatch = circuitChains.some((chain) => chain.id === item.chainId)
            return isCorrectWeekAndDay && isCircuitMatch
          })

          const value =
            selectedMetric === "collection"
              ? dayPerformanceData.reduce((sum, item) => sum + item.revenue, 0)
              : selectedMetric === "shows"
                ? dayPerformanceData.length
                : dayPerformanceData.reduce((sum, item) => sum + item.ticketsSold, 0)

          dayData[circuit.name] = value
        })

        return dayData
      })
    } else {
      // Show week-based data
      return selectedWeeks.map((weekNumber) => {
        const weekData: any = {
          date: `Week ${weekNumber}`,
          fullDate: `Week ${weekNumber}`,
        }

        displayCircuits.forEach((circuit) => {
          const circuitChains = chains.filter((chain) => chain.circuitId === circuit.id)

          const weekPerformanceData = filteredData.filter((item) => {
            const isCorrectWeek = item.weekNumber === weekNumber
            const isCircuitMatch = circuitChains.some((chain) => chain.id === item.chainId)
            return isCorrectWeek && isCircuitMatch
          })

          const value =
            selectedMetric === "collection"
              ? weekPerformanceData.reduce((sum, item) => sum + item.revenue, 0)
              : selectedMetric === "shows"
                ? weekPerformanceData.length
                : weekPerformanceData.reduce((sum, item) => sum + item.ticketsSold, 0)

          weekData[circuit.name] = value
        })

        return weekData
      })
    }
  }

  const trendData = generateTrendData()

  // Get metric details
  const getMetricDetails = () => {
    switch (selectedMetric) {
      case "collection":
        return {
          label: "Collection (₹)",
          icon: DollarSign,
          color: "#3b82f6",
          formatter: (value: number) => `₹${value.toLocaleString()}`,
          yAxisLabel: "Collection (₹)",
        }
      case "shows":
        return {
          label: "Shows",
          icon: Film,
          color: "#10b981",
          formatter: (value: number) => value.toLocaleString(),
          yAxisLabel: "Number of Shows",
        }
      case "audience":
        return {
          label: "Audience",
          icon: Users,
          color: "#f59e0b",
          formatter: (value: number) => value.toLocaleString(),
          yAxisLabel: "Number of Audience",
        }
    }
  }

  const metricDetails = getMetricDetails()

  return (
    <div className="space-y-6">
      {/* Metric Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Circuit Performance Analysis
              {filters.circuitIds.length > 0 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({filters.circuitIds.length} circuit{filters.circuitIds.length > 1 ? "s" : ""} selected)
                </span>
              )}
              {filters.weekNumbers.length > 0 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - Week{filters.weekNumbers.length > 1 ? "s" : ""} {filters.weekNumbers.join(", ")}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Metric:</label>
              <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="shows">Shows</SelectItem>
                  <SelectItem value="audience">Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Time-based Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {filters.weekNumbers.length === 1 ? "Daily" : "Weekly"} {metricDetails.label} Trends by Circuit
            {displayCircuits.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {displayCircuits.length} circuit{displayCircuits.length > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayCircuits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Film className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No circuit data available for the selected filters</p>
              <p className="text-sm">Try adjusting your filter criteria</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  angle={filters.weekNumbers.length === 1 ? -45 : 0}
                  textAnchor={filters.weekNumbers.length === 1 ? "end" : "middle"}
                  height={filters.weekNumbers.length === 1 ? 60 : 40}
                />
                <YAxis label={{ value: metricDetails.yAxisLabel, angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => [metricDetails.formatter(Number(value)), ""]}
                  labelFormatter={(label) => {
                    const item = trendData.find((d) => d.date === label)
                    return item?.fullDate || label
                  }}
                />
                <Legend />
                {displayCircuits.map((circuit, index) => (
                  <Line
                    key={circuit.id}
                    type="monotone"
                    dataKey={circuit.name}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                    name={circuit.name}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Circuit Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Circuit Performance Details
              {displayCircuits.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {displayCircuits.length} circuit{displayCircuits.length > 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {circuitData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No performance data available</p>
                <p className="text-sm">for the selected circuits and filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {circuitData
                  .sort((a, b) => b[selectedMetric] - a[selectedMetric])
                  .map((circuit, index) => (
                    <div key={circuit.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{circuit.name}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {circuit.region}
                            <Film className="h-3 w-3 ml-3 mr-1" />
                            {circuit.theaters} theaters
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{metricDetails.formatter(circuit[selectedMetric])}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {circuit.avgOccupancy.toFixed(1)}% avg occupancy
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {circuitData.length > 0 ? (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-800">Top Performer</h4>
                    </div>
                    <p className="text-sm text-green-600">
                      {circuitData.sort((a, b) => b[selectedMetric] - a[selectedMetric])[0]?.name} leads in{" "}
                      {selectedMetric}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-800">Best Occupancy</h4>
                    </div>
                    <p className="text-sm text-blue-600">
                      {circuitData.sort((a, b) => b.avgOccupancy - a.avgOccupancy)[0]?.name} has highest occupancy rate
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Film className="h-4 w-4 text-purple-600 mr-2" />
                      <h4 className="font-medium text-purple-800">Total Performance</h4>
                    </div>
                    <p className="text-sm text-purple-600">
                      {metricDetails.formatter(circuitData.reduce((sum, circuit) => sum + circuit[selectedMetric], 0))}{" "}
                      total {selectedMetric}
                    </p>
                  </div>

                  {filters.weekNumbers.length > 0 && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                        <h4 className="font-medium text-indigo-800">Week Filter</h4>
                      </div>
                      <p className="text-sm text-indigo-600">
                        Showing data for Week{filters.weekNumbers.length > 1 ? "s" : ""}{" "}
                        {filters.weekNumbers.join(", ")}
                      </p>
                    </div>
                  )}

                  {circuitData.some((circuit) => circuit.avgOccupancy < 60) && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                        <h4 className="font-medium text-red-800">Improvement Needed</h4>
                      </div>
                      <p className="text-sm text-red-600">
                        Some circuits have occupancy below 60% - consider optimization strategies
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No insights available</p>
                  <p className="text-sm">Select circuits to view performance insights</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
