"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, Users, Film, DollarSign, Calendar, Target , IndianRupeeIcon} from "lucide-react"
import type { FilterState } from "@/lib/types"
import { generatePerformanceData, chains, movies } from "@/lib/actual-data"

interface OverviewTabProps {
  filters: FilterState
}

type MetricType = "collection" | "shows" | "audience"

export function OverviewTab({ filters }: OverviewTabProps) {
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

  // Generate time series data based on weeks
  const generateTimeSeriesData = () => {
    const selectedWeeks = filters.weekNumbers.length > 0 ? filters.weekNumbers.map(Number) : [1, 2, 3, 4, 5, 6, 7, 8]

    if (filters.weekNumbers.length === 1) {
      // If single week selected, show days 1-7
      const weekNumber = Number(filters.weekNumbers[0])
      return Array.from({ length: 7 }, (_, dayIndex) => {
        const day = dayIndex + 1
        const dayData = filteredData.filter(
          (item) => item.weekNumber === weekNumber && new Date(item.date).getDay() === dayIndex,
        )

        const totalCollection = dayData.reduce((sum, item) => sum + item.revenue, 0)
        const totalShows = dayData.length
        const totalAudience = dayData.reduce((sum, item) => sum + item.ticketsSold, 0)

        return {
          date: `Day ${day}`,
          fullDate: `Week ${weekNumber}, Day ${day}`,
          collection: totalCollection,
          shows: totalShows,
          audience: totalAudience,
        }
      })
    } else {
      // Show week-based data
      return selectedWeeks.map((weekNumber) => {
        const weekData = filteredData.filter((item) => item.weekNumber === weekNumber)

        const totalCollection = weekData.reduce((sum, item) => sum + item.revenue, 0)
        const totalShows = weekData.length
        const totalAudience = weekData.reduce((sum, item) => sum + item.ticketsSold, 0)

        return {
          date: `Week ${weekNumber}`,
          fullDate: `Week ${weekNumber}`,
          collection: totalCollection,
          shows: totalShows,
          audience: totalAudience,
        }
      })
    }
  }

  const timeSeriesData = generateTimeSeriesData()

  // Calculate summary metrics
  const totalCollection = filteredData.reduce((sum, item) => sum + item.revenue, 0)
  const totalShows = filteredData.length
  const totalAudience = filteredData.reduce((sum, item) => sum + item.ticketsSold, 0)
  const avgOccupancy =
    filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.occupancy, 0) / filteredData.length : 0

  // Get metric details
  const getMetricDetails = () => {
    switch (selectedMetric) {
      case "collection":
        return {
          label: "Total Collection",
          value: totalCollection,
          formatter: (value: number) => `₹${value.toLocaleString()}`,
          color: "#3b82f6",
          icon: IndianRupeeIcon,
          dataKey: "collection",
        }
      case "shows":
        return {
          label: "Total Shows",
          value: totalShows,
          formatter: (value: number) => value.toLocaleString(),
          color: "#10b981",
          icon: Film,
          dataKey: "shows",
        }
      case "audience":
        return {
          label: "Total Audience",
          value: totalAudience,
          formatter: (value: number) => value.toLocaleString(),
          color: "#f59e0b",
          icon: Users,
          dataKey: "audience",
        }
    }
  }

  const metricDetails = getMetricDetails()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCollection.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {filteredData.length} shows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Performance records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAudience.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tickets sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {/* Removed Avg Occupancy title */}
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Removed Avg Occupancy value */}
            <p className="text-xs text-muted-foreground">Theater utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Metric Selection and Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Performance Trend Over Time
              {filters.weekNumbers.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  Week{filters.weekNumbers.length > 1 ? "s" : ""} {filters.weekNumbers.join(", ")}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
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
        <CardContent>
          {timeSeriesData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No data available for the selected filters</p>
              <p className="text-sm">Try adjusting your filter criteria</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (selectedMetric === "collection") {
                      return `₹${(value / 1000).toFixed(0)}K`
                    }
                    return value.toLocaleString()
                  }}
                />
                <Tooltip
                  formatter={(value) => [metricDetails.formatter(Number(value)), metricDetails.label]}
                  labelFormatter={(label) => {
                    const item = timeSeriesData.find((d) => d.date === label)
                    return item?.fullDate || label
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={metricDetails.dataKey}
                  stroke={metricDetails.color}
                  strokeWidth={3}
                  name={metricDetails.label}
                  dot={{ fill: metricDetails.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: metricDetails.color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredData.length > 0 ? (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-800">Performance Summary</h4>
                    </div>
                    <p className="text-sm text-blue-600">
                      {metricDetails.formatter(metricDetails.value)} total {selectedMetric} across all selected criteria
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="h-4 w-4 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-800">Occupancy Rate</h4>
                    </div>
                    <p className="text-sm text-green-600">
                      {/* Removed average occupancy text */}
                    </p>
                  </div>

                  {filters.weekNumbers.length > 0 && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                        <h4 className="font-medium text-indigo-800">Week Filter Active</h4>
                      </div>
                      <p className="text-sm text-indigo-600">
                        Showing data for Week{filters.weekNumbers.length > 1 ? "s" : ""}{" "}
                        {filters.weekNumbers.join(", ")}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Film className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No insights available</p>
                  <p className="text-sm">Apply filters to view performance insights</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
