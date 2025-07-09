import { format, addDays } from "date-fns"
import type { Performance, DCRData } from "./types"
import { chains, dcrData } from "./actual-data" // Import chains and dcrData

// Re-export from actual-data for backward compatibility
export {
  movies,
  circuits,
  subCircuits,
  chains,
  theaterTypes,
  screenTypes,
  dcrData,
  performanceData,
  getMovieWeekNumber,
  getWeekOptions,
  generateDCRData,
  generatePerformanceData,
} from "./actual-data"

// Additional mock functions for compatibility
export function generateMockPerformanceData(): Performance[] {
  const mockData: Performance[] = []
  const startDate = new Date(2024, 0, 15) // Jan 15, 2024

  // Generate 30 days of data
  for (let day = 0; day < 30; day++) {
    const currentDate = addDays(startDate, day)
    const dateString = format(currentDate, "yyyy-MM-dd")

    // Generate data for each chain
    chains.forEach((chain, chainIndex) => {
      const baseRevenue = Math.random() * 100000 + 50000
      const baseAudience = Math.random() * 500 + 100
      const occupancy = Math.random() * 40 + 60 // 60-100%

      mockData.push({
        id: `mock-${day}-${chainIndex}`,
        movieId: Math.random() > 0.5 ? "1" : "2",
        chainId: chain.id,
        screenId: `screen-${chainIndex}`,
        date: dateString,
        showTime: "19:00",
        occupancy,
        revenue: Math.floor(baseRevenue),
        ticketsSold: Math.floor(baseAudience),
      })
    })
  }

  return mockData
}

export function generateMockDCRData(): DCRData[] {
  return dcrData // Use actual data
}
