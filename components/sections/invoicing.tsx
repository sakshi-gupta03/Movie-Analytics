"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Receipt,
  Search,
  Download,
  FileText,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
} from "lucide-react"
import { generateDCRData } from "@/lib/actual-data"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import { useToast } from "@/components/ui/use-toast"

interface InvoiceData {
  id: string
  week: string
  day?: string
  date?: string
  circuit: string
  theatre: string
  station: string
  controllers: string
  screenType: string
  shows: string
  audience: number
  nettAmount: number
  deduction: number
  afterDeduction: number
  terms: string
  share: number
  gst: number
  finalShare: number
  invoiceGenerated: boolean // Keep for internal logic/content generation
  fileUploaded: boolean // New: indicates if a file has been uploaded for this invoice
  collectionReceived: boolean
  invoiceNumber?: string
  invoiceDate?: string
  dueDate?: string
  invoiceContent?: string
}

type SortDirection = "asc" | "desc" | null
type SortableColumn = keyof InvoiceData

// Generate invoice data from DCR data
const generateInvoiceData = (): InvoiceData[] => {
  const dcrData = generateDCRData()

  return dcrData.map((item, index) => {
    const deduction = Math.round(item.nettAmount * 0.1) // 10% deduction
    const afterDeduction = item.nettAmount - deduction
    const gst = Math.round(afterDeduction * 0.18) // 18% GST
    const share = Math.round(afterDeduction * 0.6) // 60% share
    const finalShare = share + gst

    return {
      id: `INV-${String(index + 1).padStart(4, "0")}`,
      week: item.week,
      circuit: item.circuit,
      theatre: item.theatre,
      station: item.station,
      controllers: item.controllers,
      screenType: item.screenType,
      shows: item.show,
      audience: item.audience,
      nettAmount: item.nettAmount,
      deduction,
      afterDeduction,
      terms: "Net 30",
      share,
      gst,
      finalShare,
      invoiceGenerated: Math.random() > 0.3, // Still generate invoice content internally
      fileUploaded: Math.random() > 0.5, // New property
      collectionReceived: Math.random() > 0.6,
      invoiceNumber: `INV-2024-${String(index + 1).padStart(4, "0")}`,
      invoiceDate: new Date(2024, 0, 15 + Math.floor(index / 10)).toLocaleDateString(),
      dueDate: new Date(2024, 1, 15 + Math.floor(index / 10)).toLocaleDateString(),
    }
  })
}

const stickyTableStyles = `
  .billing-table-container {
    width: 100%;
    max-width: 100vw;
    overflow-x: auto;
    overflow-y: visible;
    position: relative;
  }
  
  .billing-table-container::-webkit-scrollbar {
    height: 8px;
  }
  
  .billing-table-container::-webkit-scrollbar-track {
    background: hsl(var(--muted));
    border-radius: 4px;
  }
  
  .billing-table-container::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground));
    border-radius: 4px;
  }
  
  .billing-table-container::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--foreground));
  }
  
  .billing-table {
    min-width: 1800px;
    border-collapse: separate;
    border-spacing: 0;
    width: max-content;
  }
  
  .billing-table .sticky-left {
    position: sticky;
    background: hsl(var(--background));
    z-index: 10;
    border-right: 1px solid hsl(var(--border));
  }
  
  .billing-table .sticky-right {
    position: sticky;
    background: hsl(var(--background));
    z-index: 10;
    border-left: 1px solid hsl(var(--border));
  }
  
  .billing-table .sticky-left.z-20,
  .billing-table .sticky-right.z-20 {
    z-index: 20;
  }
  
  .billing-table .sticky-left::after {
    content: '';
    position: absolute;
    top: 0;
    right: -1px;
    bottom: 0;
    width: 1px;
    background: hsl(var(--border));
    z-index: 1;
  }
  
  .billing-table .sticky-right::before {
    content: '';
    position: absolute;
    top: 0;
    left: -1px;
    bottom: 0;
    width: 1px;
    background: hsl(var(--border));
    z-index: 1;
  }
`

export function Invoicing() {
  const [activeTab, setActiveTab] = useState("billing")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTheaterFilter, setSelectedTheaterFilter] = useState("All Theaters")
  const [selectedWeek, setSelectedWeek] = useState("All Weeks")
  const [invoiceData, setInvoiceData] = useState<InvoiceData[]>(generateInvoiceData())
  const { toast } = useToast()

  // Map state
  const [selectedTheaterMarker, setSelectedTheaterMarker] = useState<string | null>(null)
  const [filterPerformance, setFilterPerformance] = useState<string>("All Performance")
  const [mapCenter] = useState({ lat: 19.076, lng: 72.8777 }) // Mumbai center

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Refs for file inputs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = invoiceData.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.theatre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.circuit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.controllers.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.screenType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.week.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTheater = selectedTheaterFilter === "All Theaters" || item.theatre.includes(selectedTheaterFilter)
      const matchesWeek = selectedWeek === "All Weeks" || item.week === selectedWeek

      return matchesSearch && matchesTheater && matchesWeek
    })

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        let comparison = 0

        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue)
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue
        } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          comparison = aValue === bValue ? 0 : aValue ? 1 : -1
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }

        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [invoiceData, searchTerm, selectedTheaterFilter, selectedWeek, sortColumn, sortDirection])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedTheaterFilter, selectedWeek, sortColumn, sortDirection])

  // Sorting function
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Get sort icon
  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="h-4 w-4 text-foreground" />
    }
    if (sortDirection === "desc") {
      return <ChevronDown className="h-4 w-4 text-foreground" />
    }
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
  }

  // Pagination functions
  const goToFirstPage = () => setCurrentPage(1)
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1))
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(totalPages, page)))

  // Generate invoice template (kept for internal content generation)
  const generateInvoiceContent = (item: InvoiceData) => {
    return `
INVOICE

Invoice Number: ${item.invoiceNumber}
Invoice Date: ${item.invoiceDate}
Due Date: ${item.dueDate}

Bill To:
${item.theatre}
${item.station}
${item.circuit}

Controller: ${item.controllers}

SERVICES:
Screen Type: ${item.screenType}
Shows: ${item.shows}
Audience: ${item.audience.toLocaleString()}

FINANCIAL BREAKDOWN:
Gross Amount: ₹${item.nettAmount.toLocaleString()}
Less: Deduction: ₹${item.deduction.toLocaleString()}
Net Amount: ₹${item.afterDeduction.toLocaleString()}
Share (60%): ₹${item.share.toLocaleString()}
GST (18%): ₹${item.gst.toLocaleString()}
Final Amount: ₹${item.finalShare.toLocaleString()}

Terms: ${item.terms}
  `
  }

  // Handle file upload
  const handleFileUpload = (invoiceId: string, file: File | null) => {
    if (file) {
      console.log(`Uploading file for invoice ${invoiceId}:`, file.name)
      // Simulate upload process
      setTimeout(() => {
        setInvoiceData((prev) =>
          prev.map((invoice) => (invoice.id === invoiceId ? { ...invoice, fileUploaded: true } : invoice)),
        )
        toast({
          title: "File Uploaded & Sent!",
          description: `Invoice ${invoiceId} - ${file.name} has been successfully uploaded and sent.`,
          duration: 3000,
        })
      }, 1000)
    } else {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Toggle collection status
  const toggleCollection = (id: string, collected: boolean) => {
    setInvoiceData((prev) =>
      prev.map((invoice) => (invoice.id === id ? { ...invoice, collectionReceived: collected } : invoice)),
    )
  }

  // Export functions
  const exportToExcel = () => {
    const csvContent = [
      [
        "Week",
        "Circuit",
        "Theatre",
        "Station",
        "Controllers",
        "Screen Type",
        "Shows",
        "Audience",
        "Net Amount",
        "Deduction",
        "After Deduction",
        "Terms",
        "Share",
        "GST",
        "Final Share",
        "File Uploaded", // Changed from Invoice Generated
        "Collection",
      ].join(","),
      ...filteredAndSortedData.map((item) =>
        [
          item.week,
          item.circuit,
          `"${item.theatre}"`,
          `"${item.station}"`,
          `"${item.controllers}"`,
          item.screenType,
          item.shows,
          item.audience,
          item.nettAmount,
          item.deduction,
          item.afterDeduction,
          item.terms,
          item.share,
          item.gst,
          item.finalShare,
          item.fileUploaded ? "Yes" : "No", // Changed from invoiceGenerated
          item.collectionReceived ? "Yes" : "No",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `billing-sheet-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Calculate overview metrics
  const totalInvoices = filteredAndSortedData.length
  const filesUploaded = filteredAndSortedData.filter((item) => item.fileUploaded).length // Changed from invoicesGenerated
  const collectionsReceived = filteredAndSortedData.filter((item) => item.collectionReceived).length
  const totalAmount = filteredAndSortedData.reduce((sum, item) => sum + item.finalShare, 0)
  const collectedAmount = filteredAndSortedData
    .filter((item) => item.collectionReceived)
    .reduce((sum, item) => sum + item.finalShare, 0)
  const pendingAmount = totalAmount - collectedAmount

  // Chart data
  const invoiceStatusData = [
    { name: "Uploaded", value: filesUploaded, color: "#10b981" }, // Changed from Generated
    { name: "Collected", value: collectionsReceived, color: "#f59e0b" },
    { name: "Pending", value: totalInvoices - collectionsReceived, color: "#ef4444" },
  ]

  const collectionTrendData = Array.from({ length: 8 }, (_, i) => {
    const week = i + 1
    const weekData = filteredAndSortedData.filter((item) => item.week === `Week ${week}`)
    const totalWeekAmount = weekData.reduce((sum, item) => sum + item.finalShare, 0)
    const collectedWeekAmount = weekData
      .filter((item) => item.collectionReceived)
      .reduce((sum, item) => sum + item.finalShare, 0)

    return {
      week: `Week ${week}`,
      total: totalWeekAmount,
      collected: collectedWeekAmount,
      pending: totalWeekAmount - collectedWeekAmount,
    }
  })

  const circuitWiseData = Array.from(new Set(filteredAndSortedData.map((item) => item.circuit)))
    .map((circuit) => {
      const circuitData = filteredAndSortedData.filter((item) => item.circuit === circuit)
      const totalAmount = circuitData.reduce((sum, item) => sum + item.finalShare, 0)
      const collectedAmount = circuitData
        .filter((item) => item.collectionReceived)
        .reduce((sum, item) => sum + item.finalShare, 0)

      return {
        circuit,
        total: totalAmount,
        collected: collectedAmount,
        pending: totalAmount - collectedAmount,
        collectionRate: totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  // Prepare theater data for map with coordinates
  const theaterMapData = invoiceData.reduce(
    (acc, item) => {
      const existingTheater = acc.find((t) => t.theatre === item.theatre)
      if (existingTheater) {
        existingTheater.finalShare += item.finalShare
        existingTheater.audience += item.audience
        existingTheater.shows += Number.parseInt(item.shows)
      } else {
        // Generate realistic coordinates for theaters in their respective circuits
        let lat, lng
        switch (item.circuit) {
          case "Mumbai City":
            lat = 19.076 + (Math.random() - 0.5) * 0.1
            lng = 72.8777 + (Math.random() - 0.5) * 0.1
            break
          case "Thane Dist":
            lat = 19.2183 + (Math.random() - 0.5) * 0.05
            lng = 72.9781 + (Math.random() - 0.5) * 0.05
            break
          case "Maharashtra":
            lat = 18.5204 + (Math.random() - 0.5) * 0.1
            lng = 73.8567 + (Math.random() - 0.5) * 0.1
            break
          case "Goa":
            lat = 15.2993 + (Math.random() - 0.5) * 0.05
            lng = 74.124 + (Math.random() - 0.5) * 0.05
            break
          case "Gujarat":
            lat = 23.0225 + (Math.random() - 0.5) * 0.1
            lng = 72.5714 + (Math.random() - 0.5) * 0.1
            break
          case "Saurashtra":
            lat = 22.3039 + (Math.random() - 0.5) * 0.1
            lng = 70.8022 + (Math.random() - 0.5) * 0.1
            break
          default:
            lat = 19.076 + (Math.random() - 0.5) * 0.2
            lng = 72.8777 + (Math.random() - 0.5) * 0.2
        }

        acc.push({
          id: item.id,
          theatre: item.theatre,
          station: item.station,
          circuit: item.circuit,
          controllers: item.controllers,
          screenType: item.screenType,
          finalShare: item.finalShare,
          audience: item.audience,
          shows: Number.parseInt(item.shows),
          lat,
          lng,
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

  // Calculate performance tiers for color coding
  const maxFinalShare = Math.max(...theaterMapData.map((t) => t.finalShare))
  const minFinalShare = Math.min(...theaterMapData.map((t) => t.finalShare))

  const getPerformanceLevel = useCallback(
    (finalShare: number) => {
      const ratio = (finalShare - minFinalShare) / (maxFinalShare - minFinalShare)
      if (ratio > 0.7) return "high"
      if (ratio > 0.4) return "medium"
      return "low"
    },
    [maxFinalShare, minFinalShare],
  )

  const getMarkerColor = useCallback(
    (finalShare: number) => {
      const level = getPerformanceLevel(finalShare)
      switch (level) {
        case "high":
          return "#10b981" // Green
        case "medium":
          return "#f59e0b" // Yellow
        case "low":
          return "#ef4444" // Red
        default:
          return "#6b7280" // Gray
      }
    },
    [getPerformanceLevel],
  )

  const getMarkerSize = useCallback(
    (finalShare: number) => {
      const ratio = (finalShare - minFinalShare) / (maxFinalShare - minFinalShare)
      return Math.max(20, 15 + ratio * 25) // Size between 20-40px
    },
    [maxFinalShare, minFinalShare],
  )

  // Filter theaters for map
  const filteredMapTheaters = useMemo(() => {
    return theaterMapData.filter((theater) => {
      const performanceMatch =
        filterPerformance === "All Performance" ||
        getPerformanceLevel(theater.finalShare) === filterPerformance.toLowerCase()

      return performanceMatch
    })
  }, [theaterMapData, filterPerformance, getPerformanceLevel])

  // Get unique circuits for map filter
  const mapCircuits = useMemo(() => {
    return Array.from(new Set(theaterMapData.map((t) => t.circuit))).sort()
  }, [theaterMapData])

  // Create custom marker icon for Google Maps
  const createMarkerIcon = useCallback(
    (theater: (typeof theaterMapData)[0]) => {
      const color = getMarkerColor(theater.finalShare)
      const size = getMarkerSize(theater.finalShare)

      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${color}" stroke="#ffffff" strokeWidth="3" opacity="0.9"/>
          <circle cx="20" cy="20" r="8" fill="#ffffff" opacity="0.8"/>
          <text x="20" y="25" textAnchor="middle" fill="${color}" fontSize="10" fontWeight="bold">₹</text>
        </svg>
      `)}`,
        scaledSize: { width: size, height: size },
        anchor: { x: size / 2, y: size / 2 },
      }
    },
    [getMarkerColor, getMarkerSize],
  )

  // Dummy map component for when no API key is available
  const DummyMap = () => (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border bg-gradient-to-br from-blue-50 to-green-50 relative">
      {/* Mock Map Background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 800 500" className="w-full h-full">
          <defs>
            <pattern id="water" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="#3b82f6" opacity="0.1" />
              <path d="M0,4l4,-4M-1,1l2,-2M3,5l2,-2" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>

          {/* Water bodies */}
          <path d="M0,200 Q200,180 400,200 T800,220 L800,500 L0,500 Z" fill="url(#water)" />
          <ellipse cx="150" cy="300" rx="80" ry="40" fill="url(#water)" />
          <ellipse cx="650" cy="150" rx="60" ry="30" fill="url(#water)" />

          {/* Land masses */}
          <path d="M0,0 L800,0 L800,200 Q600,180 400,200 Q200,180 0,200 Z" fill="#10b981" opacity="0.1" />
          <path
            d="M100,250 Q300,230 500,250 Q700,270 800,250 L800,400 Q600,380 400,400 Q200,380 100,400 Z"
            fill="#f59e0b"
            opacity="0.1"
          />

          {/* Roads/connections */}
          <path
            d="M50,100 Q200,120 350,100 Q500,80 750,100"
            stroke="#6b7280"
            strokeWidth="2"
            opacity="0.3"
            fill="none"
            strokeDasharray="5,5"
          />
          <path
            d="M100,300 Q300,280 500,300 Q700,320 800,300"
            stroke="#6b7280"
            strokeWidth="2"
            opacity="0.3"
            fill="none"
            strokeDasharray="5,5"
          />
        </svg>
      </div>

      {/* Theater Markers */}
      <div className="absolute inset-0">
        {filteredMapTheaters.map((theater, index) => {
          const markerColor = getMarkerColor(theater.finalShare)
          const markerSize = Math.max(16, 12 + getMarkerSize(theater.finalShare) / 3)

          // Distribute markers across the map
          const x = 80 + (index % 8) * 90 + Math.random() * 30
          const y = 100 + Math.floor(index / 8) * 80 + Math.random() * 40

          return (
            <div
              key={theater.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${Math.min(x, 750)}px`,
                top: `${Math.min(y, 450)}px`,
              }}
              onClick={() => setSelectedTheaterMarker(selectedTheaterMarker === theater.id ? null : theater.id)}
            >
              {/* Marker */}
              <div
                className="rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: markerColor,
                  width: `${markerSize}px`,
                  height: `${markerSize}px`,
                }}
              >
                <span className="text-white font-bold text-xs">₹</span>
              </div>

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {theater.theatre}
                  <div className="text-xs opacity-75">₹{theater.finalShare.toLocaleString()}</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Theater Info Panel */}
      {selectedTheaterMarker && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm z-20">
          {(() => {
            const theater = filteredMapTheaters.find((t) => t.id === selectedTheaterMarker)
            if (!theater) return null
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">🎥 {theater.theatre}</h3>
                  <button
                    onClick={() => setSelectedTheaterMarker(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>📍 Station & Circuit:</strong> {theater.station}, {theater.circuit}
                  </p>
                  <p>
                    <strong>🎟️ Audience Count:</strong> {theater.audience.toLocaleString()}
                  </p>
                  <p>
                    <strong>💰 Final Share:</strong> ₹{theater.finalShare.toLocaleString()}
                  </p>
                  <p>
                    <strong>📅 Number of Shows:</strong> {theater.shows}
                  </p>
                  <p>
                    <strong>🖥️ Screen Type:</strong> {theater.screenType}
                  </p>
                  <p>
                    <strong>🏢 Controller:</strong> {theater.controllers}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <Badge
                    variant={
                      getPerformanceLevel(theater.finalShare) === "high"
                        ? "default"
                        : getPerformanceLevel(theater.finalShare) === "medium"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {getPerformanceLevel(theater.finalShare) === "high"
                      ? "🟢 High Performance"
                      : getPerformanceLevel(theater.finalShare) === "medium"
                        ? "🟡 Medium Performance"
                        : "🔴 Low Performance"}
                  </Badge>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-white rounded shadow border p-2">
          <div className="text-xs font-medium text-gray-600 mb-1">Zoom</div>
          <div className="flex flex-col gap-1">
            <button className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold">+</button>
            <button className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold">−</button>
          </div>
        </div>
      </div>

      {/* Circuit Labels */}
      <div className="absolute top-20 left-20 text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow">
        Mumbai City
      </div>
      <div className="absolute top-40 right-40 text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow">
        Thane Dist
      </div>
      <div className="absolute bottom-40 left-40 text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow">
        Maharashtra
      </div>
      <div className="absolute bottom-20 right-20 text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow">
        Gujarat
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow">
        Saurashtra
      </div>
    </div>
  )

  const hasApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== "YOUR_API_KEY_HERE"

  return (
    <div className="w-full max-w-full overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: stickyTableStyles }} />

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Revenue & Invoicing</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
          <Select value={selectedTheaterFilter} onValueChange={setSelectedTheaterFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Theater" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Theaters">All Theaters</SelectItem>
              {Array.from(new Set(invoiceData.map((item) => item.theatre))).map((theater) => (
                <SelectItem key={theater} value={theater}>
                  {theater}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Weeks">All Weeks</SelectItem>
              {Array.from({ length: 8 }, (_, i) => (
                <SelectItem key={i + 1} value={`Week ${i + 1}`}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full h-10 p-1 bg-muted rounded-md gap-2">
            <TabsTrigger value="billing">Billing Sheet</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="billing" className="space-y-4 w-full">
            {/* Billing Table */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Billing Sheet</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Search and Table Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search theaters, circuits, controllers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">entries</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of{" "}
                  {filteredAndSortedData.length} entries
                  {filteredAndSortedData.length !== invoiceData.length &&
                    ` (filtered from ${invoiceData.length} total entries)`}
                </div>
              </CardHeader>

              <CardContent className="p-0 w-full">
                <div className="billing-table-container">
                  <Table className="billing-table">
                    <TableHeader>
                      <TableRow>
                        {/* Fixed Left Columns */}
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 sticky-left left-0 z-20 w-[100px]"
                          onClick={() => handleSort("week")}
                          style={{ left: "0px" }}
                        >
                          <div className="flex items-center gap-2">
                            Week
                            {getSortIcon("week")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 sticky-left left-[100px] z-20 w-[120px]"
                          onClick={() => handleSort("circuit")}
                          style={{ left: "100px" }}
                        >
                          <div className="flex items-center gap-2">
                            Circuit
                            {getSortIcon("circuit")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 sticky-left left-[220px] z-20 w-[200px]"
                          onClick={() => handleSort("theatre")}
                          style={{ left: "220px" }}
                        >
                          <div className="flex items-center gap-2">
                            Theatre
                            {getSortIcon("theatre")}
                          </div>
                        </TableHead>

                        {/* Scrollable Middle Columns */}
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[120px]"
                          onClick={() => handleSort("station")}
                        >
                          <div className="flex items-center gap-2">
                            Station
                            {getSortIcon("station")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[150px]"
                          onClick={() => handleSort("controllers")}
                        >
                          <div className="flex items-center gap-2">
                            Controllers
                            {getSortIcon("controllers")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[120px]"
                          onClick={() => handleSort("screenType")}
                        >
                          <div className="flex items-center gap-2">
                            Screen Type
                            {getSortIcon("screenType")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[100px]"
                          onClick={() => handleSort("shows")}
                        >
                          <div className="flex items-center gap-2">
                            Shows
                            {getSortIcon("shows")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[120px]"
                          onClick={() => handleSort("audience")}
                        >
                          <div className="flex items-center gap-2">
                            Audience
                            {getSortIcon("audience")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[130px]"
                          onClick={() => handleSort("nettAmount")}
                        >
                          <div className="flex items-center gap-2">
                            Net Amount
                            {getSortIcon("nettAmount")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[120px]"
                          onClick={() => handleSort("deduction")}
                        >
                          <div className="flex items-center gap-2">
                            Deduction
                            {getSortIcon("deduction")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[140px]"
                          onClick={() => handleSort("afterDeduction")}
                        >
                          <div className="flex items-center gap-2">
                            After Deduction
                            {getSortIcon("afterDeduction")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[100px]"
                          onClick={() => handleSort("terms")}
                        >
                          <div className="flex items-center gap-2">
                            Terms
                            {getSortIcon("terms")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[120px]"
                          onClick={() => handleSort("share")}
                        >
                          <div className="flex items-center gap-2">
                            Share
                            {getSortIcon("share")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 w-[100px]"
                          onClick={() => handleSort("gst")}
                        >
                          <div className="flex items-center gap-2">
                            GST
                            {getSortIcon("gst")}
                          </div>
                        </TableHead>

                        {/* Fixed Right Columns */}
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 sticky-right right-[200px] z-20 w-[130px]"
                          onClick={() => handleSort("finalShare")}
                          style={{ right: "200px" }}
                        >
                          <div className="flex items-center gap-2">
                            Final Share
                            {getSortIcon("finalShare")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 sticky-right right-[100px] z-20 w-[100px]"
                          onClick={() => handleSort("fileUploaded")}
                          style={{ right: "100px" }}
                        >
                          <div className="flex items-center gap-2">
                            Upload
                            {getSortIcon("fileUploaded")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:bg-muted/50 sticky-right right-0 z-20 w-[100px]"
                          onClick={() => handleSort("collectionReceived")}
                          style={{ right: "0px" }}
                        >
                          <div className="flex items-center gap-2">
                            Collection
                            {getSortIcon("collectionReceived")}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={17} className="text-center py-8 text-muted-foreground">
                            No data found matching your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((item) => (
                          <TableRow key={item.id}>
                            {/* Fixed Left Columns */}
                            <TableCell className="sticky-left left-0 z-10" style={{ left: "0px" }}>
                              <Badge variant="outline">{item.week}</Badge>
                            </TableCell>
                            <TableCell className="font-medium sticky-left left-[100px] z-10" style={{ left: "100px" }}>
                              {item.circuit}
                            </TableCell>
                            <TableCell className="sticky-left left-[220px] z-10" style={{ left: "220px" }}>
                              <div className="truncate max-w-[180px]" title={item.theatre}>
                                {item.theatre}
                              </div>
                            </TableCell>

                            {/* Scrollable Middle Columns */}
                            <TableCell>{item.station}</TableCell>
                            <TableCell>
                              <div className="truncate max-w-[130px]" title={item.controllers}>
                                {item.controllers}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.screenType}</Badge>
                            </TableCell>
                            <TableCell className="text-center">{item.shows}</TableCell>
                            <TableCell className="text-right font-mono">{item.audience.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">₹{item.nettAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono text-red-600">
                              ₹{item.deduction.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ₹{item.afterDeduction.toLocaleString()}
                            </TableCell>
                            <TableCell>{item.terms}</TableCell>
                            <TableCell className="text-right font-mono">₹{item.share.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">₹{item.gst.toLocaleString()}</TableCell>

                            {/* Fixed Right Columns */}
                            <TableCell
                              className="text-right font-mono font-bold sticky-right right-[200px] z-10"
                              style={{ right: "200px" }}
                            >
                              ₹{item.finalShare.toLocaleString()}
                            </TableCell>
                            <TableCell className="sticky-right right-[100px] z-10" style={{ right: "100px" }}>
                              <input
                                type="file"
                                ref={(el) => (fileInputRefs.current[item.id] = el)}
                                style={{ display: "none" }}
                                onChange={(e) => handleFileUpload(item.id, e.target.files ? e.target.files[0] : null)}
                              />
                              {item.fileUploaded ? (
                                <Button size="sm" variant="outline" className="w-full bg-transparent" disabled>
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                  Uploaded
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => fileInputRefs.current[item.id]?.click()}
                                  size="sm"
                                  variant="default"
                                  className="w-full"
                                >
                                  <Upload className="h-4 w-4 mr-1" />
                                  Upload
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="sticky-right right-0 z-10 text-center" style={{ right: "0px" }}>
                              <Checkbox
                                checked={item.collectionReceived}
                                onCheckedChange={(checked) => toggleCollection(item.id, checked as boolean)}
                                disabled={!item.fileUploaded} // Disabled until file is uploaded
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goToFirstPage} disabled={currentPage === 1}>
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="sm" onClick={goToLastPage} disabled={currentPage === totalPages}>
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">{filesUploaded} uploaded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" /> {/* Changed to IndianRupee */}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Final share amount</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collected</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{collectedAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{collectionsReceived} collections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{totalInvoices - collectionsReceived} pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Invoice Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ChartContainer config={{}} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={invoiceStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {invoiceStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              {/* Collection Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Final Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={collectionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Amount" />
                        <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" />
                        <Line type="monotone" dataKey="pending" stroke="#ef4444" strokeWidth={2} name="Pending" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Google Map Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Theater Final Share View</CardTitle>
                <CardDescription></CardDescription>

                {/* Filters for Map */}
                <div className="flex items-center gap-4 pt-4">
                  <Select value={filterPerformance} onValueChange={setFilterPerformance}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by Performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Performance">All Performance</SelectItem>
                      <SelectItem value="High">🟢 High Performance</SelectItem>
                      <SelectItem value="Medium">🟡 Medium Performance</SelectItem>
                      <SelectItem value="Low">🔴 Low Performance</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-sm text-muted-foreground">
                    Showing {filteredMapTheaters.length} of {theaterMapData.length} theaters
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!hasApiKey ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <div className="text-lg">🗺️</div>
                        <h4 className="font-medium">Demo Mode - Mock Map View</h4>
                      </div>
                      <p className="text-sm text-blue-700">
                        This is a demonstration view. For real Google Maps integration, add your API key to environment
                        variables:
                      </p>
                      <code className="block mt-2 text-xs bg-blue-100 p-2 rounded">
                        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
                      </code>
                    </div>
                    <DummyMap />
                  </div>
                ) : (
                  <div className="h-[500px] w-full rounded-lg overflow-hidden border">
                    <LoadScript
                      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                      onLoad={() => console.log("Google Maps loaded successfully")}
                      onError={(error) => console.error("Google Maps failed to load:", error)}
                      loadingElement={
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
                          </div>
                        </div>
                      }
                    >
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={mapCenter}
                        zoom={7}
                        options={{
                          zoomControl: true,
                          streetViewControl: false,
                          mapTypeControl: true,
                          fullscreenControl: true,
                          mapTypeControlOptions: {
                            style: 1, // HORIZONTAL_BAR
                            position: 3, // TOP_RIGHT
                          },
                        }}
                      >
                        {filteredMapTheaters.map((theater) => (
                          <Marker
                            key={theater.id}
                            position={{ lat: theater.lat, lng: theater.lng }}
                            onClick={() => setSelectedTheaterMarker(theater.id)}
                            icon={createMarkerIcon(theater)}
                          />
                        ))}

                        {selectedTheaterMarker && (
                          <InfoWindow
                            position={{
                              lat: filteredMapTheaters.find((t) => t.id === selectedTheaterMarker)?.lat || 0,
                              lng: filteredMapTheaters.find((t) => t.id === selectedTheaterMarker)?.lng || 0,
                            }}
                            onCloseClick={() => setSelectedTheaterMarker(null)}
                          >
                            <div className="p-3 max-w-sm">
                              {(() => {
                                const theater = filteredMapTheaters.find((t) => t.id === selectedTheaterMarker)
                                if (!theater) return null
                                return (
                                  <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">🎥 {theater.theatre}</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>📍 Station & Circuit:</strong> {theater.station}, {theater.circuit}
                                      </p>
                                      <p>
                                        <strong>🎟️ Audience Count:</strong> {theater.audience.toLocaleString()}
                                      </p>
                                      <p>
                                        <strong>💰 Final Share:</strong> ₹{theater.finalShare.toLocaleString()}
                                      </p>
                                      <p>
                                        <strong>📅 Number of Shows:</strong> {theater.shows}
                                      </p>
                                      <p>
                                        <strong>🖥️ Screen Type:</strong> {theater.screenType}
                                      </p>
                                      <p>
                                        <strong>🏢 Controller:</strong> {theater.controllers}
                                      </p>
                                    </div>
                                    <div className="pt-2 border-t">
                                      <Badge
                                        variant={
                                          getPerformanceLevel(theater.finalShare) === "high"
                                            ? "default"
                                            : getPerformanceLevel(theater.finalShare) === "medium"
                                              ? "secondary"
                                              : "destructive"
                                        }
                                      >
                                        {getPerformanceLevel(theater.finalShare) === "high"
                                          ? "🟢 High Performance"
                                          : getPerformanceLevel(theater.finalShare) === "medium"
                                            ? "🟡 Medium Performance"
                                            : "🔴 Low Performance"}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  </div>
                )}

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>🟢 High Performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span>🟡 Medium Performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span>🔴 Low Performance</span>
                  </div>
                  <div className="text-muted-foreground">• Marker size indicates Final Share amount</div>
                </div>

                {/* Statistics */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-700">
                      {filteredMapTheaters.filter((t) => getPerformanceLevel(t.finalShare) === "high").length}
                    </div>
                    <div className="text-sm text-green-600">High Performers</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-lg font-bold text-yellow-700">
                      {filteredMapTheaters.filter((t) => getPerformanceLevel(t.finalShare) === "medium").length}
                    </div>
                    <div className="text-sm text-yellow-600">Medium Performers</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-lg font-bold text-red-700">
                      {filteredMapTheaters.filter((t) => getPerformanceLevel(t.finalShare) === "low").length}
                    </div>
                    <div className="text-sm text-red-600">Low Performers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Circuit Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Circuit Final Share Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Circuit</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Collected</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead className="text-right">Collection Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {circuitWiseData.map((circuit) => (
                      <TableRow key={circuit.circuit}>
                        <TableCell className="font-medium">{circuit.circuit}</TableCell>
                        <TableCell className="text-right font-mono">₹{circuit.total.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          ₹{circuit.collected.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          ₹{circuit.pending.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              circuit.collectionRate >= 80
                                ? "default"
                                : circuit.collectionRate >= 60
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {circuit.collectionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
