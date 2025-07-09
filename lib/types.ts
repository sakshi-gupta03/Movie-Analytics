export interface Movie {
  id: string
  title: string
  genre: string
  language: string
  releaseDate: string
  duration: number
  rating: string
}

export interface Circuit {
  id: string
  name: string
  region: string
}

export interface Chain {
  id: string
  name: string
  circuitId: string
  theaterType: string
  location: string
  screens: number
}

export interface Screen {
  id: string
  chainId: string
  screenNumber: number
  screenType: string
  capacity: number
}

export interface Theater {
  id: string
  name: string
  chainId: string
  location: string
  screens: Screen[]
}

export interface Performance {
  id: string
  movieId: string
  chainId: string
  screenId: string
  date: string
  showTime: string
  occupancy: number
  revenue: number
  ticketsSold: number
  weekNumber: number
}

export interface DCRData {
  week: string
  circuit: string
  theatre: string
  station: string
  controllers: string
  screenType: string
  show: string
  audience: number
  nettAmount: number
}

export interface FilterState {
  movieId: string
  circuitIds: string[]
  chainIds: string[]
  theaterTypes: string[]
  weekNumbers: string[]
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface User {
  id: string
  email: string
  name: string
}
