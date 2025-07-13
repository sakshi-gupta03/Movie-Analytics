"use client"

import { TheaterPerformanceMap } from "@/components/maps/theater-performance-map"
import { generateDCRData } from "@/lib/actual-data"
import { useMemo } from "react"

export default function MapsPage() {
  // Generate theater data from invoice data
  const theaterData = useMemo(() => {
    const dcrData = generateDCRData()

    return dcrData.reduce(
      (acc, item, index) => {
        const deduction = Math.round(item.nettAmount * 0.1)
        const afterDeduction = item.nettAmount - deduction
        const gst = Math.round(afterDeduction * 0.18)
        const share = Math.round(afterDeduction * 0.6)
        const finalShare = share + gst

        const existingTheater = acc.find((t) => t.theatre === item.theatre)
        if (existingTheater) {
          existingTheater.finalShare += finalShare
          existingTheater.audience += item.audience
          existingTheater.shows += Number.parseInt(item.show)
        } else {
          acc.push({
            id: `theater-${index}`,
            theatre: item.theatre,
            station: item.station,
            circuit: item.circuit,
            controllers: item.controllers,
            screenType: item.screenType,
            finalShare,
            audience: item.audience,
            shows: Number.parseInt(item.show),
            lat: 0, // Will be generated in the component
            lng: 0, // Will be generated in the component
          })
        }
        return acc
      },
      [] as Array<{
        id: string
        theatre: string
        station: string
        circuit: string
        controllers: string
        screenType: string
        finalShare: number
        audience: number
        shows: number
        lat: number
        lng: number
      }>,
    )
  }, [])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Theater Performance Maps</h1>
        <p className="text-muted-foreground">
          Interactive map visualization showing theater performance across different circuits based on Final Share
          amounts.
        </p>
      </div>

      <TheaterPerformanceMap theaters={theaterData} />
    </div>
  )
}
