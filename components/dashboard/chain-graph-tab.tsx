"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import type { FilterState } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ChainGraphTabProps {
  filters: FilterState
}

// Generate time-based data for chains and all metrics
const generateChainData = (filters: FilterState, metric: string) => {
  const chains = [
    "PVR Cinemas",
    "INOX Leisure",
    "Cinepolis",
    "Carnival Cinemas",
    "Miraj Cinemas",
    "Fun Cinemas",
    "Wave Cinemas",
    "SPI Cinemas",
    "Mukta A2 Cinemas",
    "Delite Cinemas",
  ]

  // Determine time periods based on week selection
  const isSpecificWeek = filters.weekNumbers.length === 1
  const timePeriods = isSpecificWeek
    ? Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`)
    : Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`)

  return timePeriods.map((period) => {
    const dataPoint: any = { period }
    chains.slice(0, 6).forEach((chain) => {
      // Generate realistic performance data for each metric
      let baseValue = Math.random() * 80 + 20
      let trend = Math.sin((timePeriods.indexOf(period) / timePeriods.length) * Math.PI * 2) * 15
      let value = Math.max(10, Math.round(baseValue + trend))
      if (metric === "collection") value = Math.round((baseValue + trend) * 10000)
      if (metric === "shows") value = Math.round((baseValue + trend) / 2)
      if (metric === "audience") value = Math.round((baseValue + trend) * 100)
      dataPoint[chain] = value
    })
    return dataPoint
  })
}

const chartConfig = {
  "PVR Cinemas": { color: "hsl(var(--chart-1))" },
  "INOX Leisure": { color: "hsl(var(--chart-2))" },
  Cinepolis: { color: "hsl(var(--chart-3))" },
  "Carnival Cinemas": { color: "hsl(var(--chart-4))" },
  "Miraj Cinemas": { color: "hsl(var(--chart-5))" },
  "Fun Cinemas": { color: "#8B5CF6" },
}

export function ChainGraphTab({ filters }: ChainGraphTabProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("collection")
  const data = generateChainData(filters, selectedMetric)
  const chains = Object.keys(chartConfig)

  // Calculate insights
  const totalRevenue = data.reduce(
    (sum, item) => sum + chains.reduce((chainSum, chain) => chainSum + (item[chain] || 0), 0),
    0,
  )

  const avgOccupancy = Math.round(totalRevenue / (data.length * chains.length))
  const topPerformer = chains.reduce((best, chain) => {
    const chainTotal = data.reduce((sum, item) => sum + (item[chain] || 0), 0)
    const bestTotal = data.reduce((sum, item) => sum + (item[best] || 0), 0)
    return chainTotal > bestTotal ? chain : best
  })

  const timeLabel = filters.weekNumbers.length === 1 ? "Daily" : "Weekly"

  const metricOptions = [
    { value: "collection", label: "Collection" },
    { value: "shows", label: "Shows" },
    { value: "audience", label: "Audience" },
  ]

  const yAxisLabel = metricOptions.find(opt => opt.value === selectedMetric)?.label || "Occupancy %"

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {metricOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{topPerformer}</div>
          </CardContent>
        </Card>

        {/* Removed Avg Occupancy card */}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Chains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{chains.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Chain Performance Trends</CardTitle>
          <CardDescription>{timeLabel} performance comparison across theater chains</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {chains.map((chain) => (
                  <Line
                    key={chain}
                    type="monotone"
                    dataKey={chain}
                    stroke={chartConfig[chain as keyof typeof chartConfig]?.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
