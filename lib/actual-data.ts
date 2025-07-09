import type { Movie, Circuit, Chain, Performance, DCRData } from "./types"

export const movies: Movie[] = [
  {
    id: "bhool-chuk-maaf",
    title: "Bhool Chuk Maaf",
    genre: "Comedy Drama",
    language: "Hindi",
    releaseDate: "2024-01-15",
    duration: 150,
    rating: "U",
  },
  {
    id: "chaava",
    title: "Chaava",
    genre: "Historical Drama",
    language: "Marathi",
    releaseDate: "2024-01-20",
    duration: 180,
    rating: "UA",
  },
]

export const circuits: Circuit[] = [
  { id: "mumbai-city", name: "Mumbai City", region: "Western India" },
  { id: "thane-dist", name: "Thane Dist", region: "Western India" },
  { id: "maharashtra", name: "Maharashtra", region: "Western India" },
  { id: "goa", name: "Goa", region: "Western India" },
  { id: "gujarat", name: "Gujarat", region: "Western India" },
  { id: "saurashtra", name: "Saurashtra", region: "Western India" },
]

export const theaterTypes = ["National Chain Multiplex", "Non National Chain Multiplex", "Single Screen", "Army Cinema"]

export const screenTypes = ["2K-DCI", "IMAX 2D", "Non-2K", "ATMOS 2D", "IMAX", "4DX", "ICE"]


export const chains: Chain[] = [
  // Mumbai City theaters
  {
    id: "inox-laser-plex",
    name: "INOX LASER PLEX C2",
    circuitId: "mumbai-city",
    theaterType: "National Chain Multiplex",
    location: "NARIMAN POINT",
    screens: 4,
  },
  {
    id: "pvr-icon",
    name: "PVR ICON",
    circuitId: "mumbai-city",
    theaterType: "National Chain Multiplex",
    location: "ANDHERI",
    screens: 6,
  },
  {
    id: "regal-cinema",
    name: "REGAL CINEMA",
    circuitId: "mumbai-city",
    theaterType: "Single Screen",
    location: "COLABA",
    screens: 1,
  },
  {
    id: "metro-inox-atmos",
    name: "METRO INOX CINEMAS ATMOS",
    circuitId: "mumbai-city",
    theaterType: "National Chain Multiplex",
    location: "MARINE LINES",
    screens: 3,
  },
  {
    id: "sterling-cineplex",
    name: "STERLING CINEPLEX",
    circuitId: "mumbai-city",
    theaterType: "Non National Chain Multiplex",
    location: "CST",
    screens: 4,
  },
  {
    id: "mukta-excelsior",
    name: "MUKTA A2 CINEMAS NEW EXCELSIOR",
    circuitId: "mumbai-city",
    theaterType: "Non National Chain Multiplex",
    location: "FORT",
    screens: 4,
  },
  {
    id: "maratha-mandir",
    name: "MARATHA MANDIR",
    circuitId: "mumbai-city",
    theaterType: "Single Screen",
    location: "MUMBAI CENTRAL",
    screens: 1,
  },

  // Thane District theaters
  {
    id: "moviemax",
    name: "MOVIEMAX",
    circuitId: "thane-dist",
    theaterType: "Non National Chain Multiplex",
    location: "MIRA ROAD (E)",
    screens: 6,
  },
  {
    id: "aarsaz-multiplex",
    name: "AARSAZ MULTIPLEX",
    circuitId: "thane-dist",
    theaterType: "Non National Chain Multiplex",
    location: "MIRA ROAD (E)",
    screens: 6,
  },
  {
    id: "maxus",
    name: "MAXUS",
    circuitId: "thane-dist",
    theaterType: "Non National Chain Multiplex",
    location: "BHAYANDAR (W)",
    screens: 7,
  },

  // Maharashtra theaters
  {
    id: "cinepolis-seasons",
    name: "CINE POLIS SEASONS MALL",
    circuitId: "maharashtra",
    theaterType: "National Chain Multiplex",
    location: "PUNE",
    screens: 13,
  },
  {
    id: "pvr-pavilion",
    name: "PVR PAVILION PUNE",
    circuitId: "maharashtra",
    theaterType: "National Chain Multiplex",
    location: "PUNE",
    screens: 12,
  },
  {
    id: "miraj-nashik",
    name: "MIRAJ CINEMAS NASHIK",
    circuitId: "maharashtra",
    theaterType: "Non National Chain Multiplex",
    location: "NASHIK",
    screens: 8,
  },

  // Goa theaters
  {
    id: "inox-goa",
    name: "INOX GOA",
    circuitId: "goa",
    theaterType: "National Chain Multiplex",
    location: "NARIMAN POINT",
    screens: 5,
  },
  



  {
    id: "carnival-goa",
    name: "CARNIVAL CINEMAS GOA",
    circuitId: "goa",
    theaterType: "Non National Chain Multiplex",
    location: "NARIMAN POINT",
    screens: 4,
  },

  // Gujarat theaters
  {
    id: "rahans-vastral",
    name: "RAHANS VASTRAL",
    circuitId: "gujarat",
    theaterType: "Non National Chain Multiplex",
    location: "MARINE LINES",
    screens: 8,
  },
  {
    id: "pvr-ahmedabad",
    name: "PVR AHMEDABAD",
    circuitId: "gujarat",
    theaterType: "National Chain Multiplex",
    location: "MARINE LINES",
    screens: 10,
  },
  {
    id: "cinepolis-vadodara",
    name: "CINEPOLIS VADODARA",
    circuitId: "gujarat",
    theaterType: "National Chain Multiplex",
    location: "MARINE LINES",
    screens: 9,
  },

  // Saurashtra theaters
  {
    id: "miraj-rajkot",
    name: "MIRAJ CINEMAS RAJKOT",
    circuitId: "saurashtra",
    theaterType: "Non National Chain Multiplex",
    location: "RAJKOT",
    screens: 6,
  },
  {
    id: "fun-jamnagar",
    name: "FUN CINEMAS JAMNAGAR",
    circuitId: "saurashtra",
    theaterType: "Non National Chain Multiplex",
    location: "JAMNAGAR",
    screens: 5,
  },
  {
    id: "army-cinema-bhuj",
    name: "ARMY CINEMA BHUJ",
    circuitId: "saurashtra",
    theaterType: "Army Cinema",
    location: "BHUJ",
    screens: 2,
  },
]

// Generate performance data with week numbers for multiple weeks
export const generatePerformanceData = (): Performance[] => {
  const performances: Performance[] = []

  // Generate data for 8 weeks
  for (let week = 1; week <= 8; week++) {
    chains.forEach((chain, chainIndex) => {
      movies.forEach((movie) => {
        // Generate multiple performances per theater per week
        const performancesPerWeek = Math.floor(Math.random() * 4) + 2 // 2-5 performances per week

        for (let p = 0; p < performancesPerWeek; p++) {
          const releaseDate = new Date("2024-01-15")
          const weekStartDate = new Date(releaseDate)
          weekStartDate.setDate(releaseDate.getDate() + (week - 1) * 7)

          const performanceDate = new Date(weekStartDate)
          performanceDate.setDate(weekStartDate.getDate() + Math.floor(Math.random() * 7))

          // Adjust revenue and audience based on week (declining over time)
          const weekMultiplier = Math.max(0.3, 1 - (week - 1) * 0.08)
          const randomVariation = 0.7 + Math.random() * 0.6 // 0.7 to 1.3

          // Base values depend on theater type and circuit
          let baseRevenue = 50000
          let baseAudience = 200

          // Adjust based on theater type
          if (chain.theaterType === "National Chain Multiplex") {
            baseRevenue *= 1.5
            baseAudience *= 1.4
          } else if (chain.theaterType === "Non National Chain Multiplex") {
            baseRevenue *= 1.2
            baseAudience *= 1.2
          } else if (chain.theaterType === "Single Screen") {
            baseRevenue *= 0.8
            baseAudience *= 0.9
          } else if (chain.theaterType === "Army Cinema") {
            baseRevenue *= 0.6
            baseAudience *= 0.7
          }

          // Adjust based on circuit popularity
          const circuitMultiplier =
            chain.circuitId === "mumbai-city"
              ? 1.3
              : chain.circuitId === "maharashtra"
                ? 1.2
                : chain.circuitId === "gujarat"
                  ? 1.1
                  : chain.circuitId === "thane-dist"
                    ? 1.0
                    : chain.circuitId === "goa"
                      ? 0.9
                      : 0.8

          const finalRevenue = Math.floor(baseRevenue * weekMultiplier * randomVariation * circuitMultiplier)
          const finalAudience = Math.floor(baseAudience * weekMultiplier * randomVariation * circuitMultiplier)

          performances.push({
            id: `perf-${week}-${chainIndex}-${movie.id}-${p}`,
            movieId: movie.id,
            chainId: chain.id,
            screenId: `screen-${week}-${chainIndex}-${p}`,
            date: performanceDate.toISOString().split("T")[0],
            showTime: ["14:00", "17:00", "20:00", "23:00"][Math.floor(Math.random() * 4)],
            occupancy: Math.min(95, Math.max(20, finalAudience / 3)),
            revenue: finalRevenue,
            ticketsSold: finalAudience,
            weekNumber: week,
          })
        }
      })
    })
  }

  return performances
}

// Generate DCR data
export function generateDCRData(): DCRData[] {
  const controllers = [
  "PVR Inox Ltd",
  "Mukta A2 Cinemas", "Sterling", "Vinay Bhai"
  ]

  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
  const data: DCRData[] = []

  for (let weekIndex = 0; weekIndex < weeks.length-4; weekIndex++) {
    const week = weeks[weekIndex]

    chains.forEach((chain) => {
      const circuit = circuits.find((c) => c.id === chain.circuitId)
      if (!circuit) return

      // Generate multiple entries per theater per week
      const entriesPerWeek = Math.floor(Math.random() * 3) + 2 // 2-4 entries per week

      for (let i = 0; i < entriesPerWeek; i++) {
        const controller = controllers[Math.floor(Math.random() * controllers.length)]
        const screenType = screenTypes[Math.floor(Math.random() * screenTypes.length)]

        // Base values
        let baseAudience = Math.floor(Math.random() * 800) + 200
        let baseShows = Math.floor(Math.random() * 6) + 3

        // Adjust based on theater type
        if (chain.theaterType === "National Chain Multiplex") {
          baseAudience *= 1.4
          baseShows *= 1.3
        } else if (chain.theaterType === "Non National Chain Multiplex") {
          baseAudience *= 1.1
          baseShows *= 1.1
        } else if (chain.theaterType === "Single Screen") {
          baseAudience *= 0.8
          baseShows *= 0.7
        } else if (chain.theaterType === "Army Cinema") {
          baseAudience *= 0.6
          baseShows *= 0.6
        }

        // Week decline
        const weekMultiplier = Math.max(0.4, 1 - weekIndex * 0.08)
        const finalAudience = Math.floor(baseAudience * weekMultiplier)
        const finalShows = Math.max(1, Math.floor(baseShows * weekMultiplier))

        const ticketPrice = Math.floor(Math.random() * 150) + 200
        const nettAmount = finalAudience * ticketPrice

        data.push({
          week,
          circuit: circuit.name,
          theatre: chain.name,
          station: chain.location,
          controllers: controller,
          screenType,
          show: finalShows.toString(),
          audience: finalAudience,
          nettAmount,
        })
      }
    })
  }

  return data.sort((a, b) => {
    const weekA = Number.parseInt(a.week.split(" ")[1])
    const weekB = Number.parseInt(b.week.split(" ")[1])
    return weekA - weekB
  })
}

// Generate day-wise DCR data
export function generateDayWiseDCRData(): (DCRData & { day: string; date: string })[] {
  const controllers = [
  "PVR Inox Ltd",
  "Mukta A2 Cinemas", "Sterling", "Vinay Bhai"
  ]
  

  const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
  const data: (DCRData & { day: string; date: string })[] = []

  for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
    const week = weeks[weekIndex]

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex]

      // Generate date
      const startDate = new Date(2024, 0, 1)
      const dayOffset = weekIndex * 7 + dayIndex
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + dayOffset)
      const dateString = currentDate.toLocaleDateString("en-GB")

      // Generate records for each theater
      chains.forEach((chain) => {
        const circuit = circuits.find((c) => c.id === chain.circuitId)
        if (!circuit) return

        const controller = controllers[Math.floor(Math.random() * controllers.length)]
        const screenType = screenTypes[Math.floor(Math.random() * screenTypes.length)]

        // Base values for daily data (smaller than weekly)
        let baseAudience = Math.floor(Math.random() * 150) + 50
        let baseShows = Math.floor(Math.random() * 4) + 2

        // Adjust based on theater type
        if (chain.theaterType === "National Chain Multiplex") {
          baseAudience *= 1.4
          baseShows *= 1.3
        } else if (chain.theaterType === "Non National Chain Multiplex") {
          baseAudience *= 1.1
          baseShows *= 1.1
        } else if (chain.theaterType === "Single Screen") {
          baseAudience *= 0.8
          baseShows *= 0.7
        } else if (chain.theaterType === "Army Cinema") {
          baseAudience *= 0.6
          baseShows *= 0.6
        }

        // Weekend boost
        const isWeekend = dayIndex >= 5
        const weekendMultiplier = isWeekend ? 1.4 : 1

        // Week decline
        const weekMultiplier = Math.max(0.4, 1 - weekIndex * 0.08)

        const finalAudience = Math.floor(baseAudience * weekMultiplier * weekendMultiplier)
        const finalShows = Math.max(1, Math.floor(baseShows * weekMultiplier))

        const ticketPrice = Math.floor(Math.random() * 150) + 200
        const nettAmount = finalAudience * ticketPrice

        data.push({
          week,
          day,
          date: dateString,
          circuit: circuit.name,
          theatre: chain.name,
          station: chain.location,
          controllers: controller,
          screenType,
          show: finalShows.toString(),
          audience: finalAudience,
          nettAmount,
        })
      })
    }
  }

  return data.sort((a, b) => {
    const weekA = Number.parseInt(a.week.split(" ")[1])
    const weekB = Number.parseInt(b.week.split(" ")[1])
    if (weekA !== weekB) return weekA - weekB

    const dayA = Number.parseInt(a.day.split(" ")[1])
    const dayB = Number.parseInt(b.day.split(" ")[1])
    return dayA - dayB
  })
}

export const completeActualData = {
  movies,
  circuits,
  chains,
  theaterTypes,
  screenTypes,
  performanceData: generatePerformanceData(),
}
