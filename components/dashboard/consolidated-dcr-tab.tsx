"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, Download, SortAsc, SortDesc, Filter, Calendar, CalendarDays } from "lucide-react"
import type { FilterState } from "@/lib/types"
import { generateDCRData, generateDayWiseDCRData } from "@/lib/actual-data"

interface ConsolidatedDCRTabProps {
  filters: FilterState
}

type SortField = "week" | "day" | "circuit" | "theatre" | "audience" | "nettAmount"
type SortDirection = "asc" | "desc"

export function ConsolidatedDCRTab({ filters }: ConsolidatedDCRTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("nettAmount")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [isDayWiseView, setIsDayWiseView] = useState(false)

  // Generate data based on view mode
  const allDCRData = isDayWiseView ? generateDayWiseDCRData() : generateDCRData()

  // Filter data based on filters and search
  const filteredData = allDCRData.filter((item) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !item.theatre.toLowerCase().includes(searchLower) &&
        !item.circuit.toLowerCase().includes(searchLower) &&
        !item.station.toLowerCase().includes(searchLower) &&
        !item.controllers.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Circuit filter
    if (filters.circuitIds.length > 0) {
      const circuitMatch = filters.circuitIds.some((id) => {
        const circuitName =
          id === "1"
            ? "Mumbai"
            : id === "2"
              ? "Thane Dist"
              : id === "3"
                ? "Maharashtra"
                : id === "4"
                  ? "Goa"
                  : id === "5"
                    ? "Gujarat"
                    : "Saurashtra"
        return item.circuit.includes(circuitName)
      })
      if (!circuitMatch) return false
    }

    // Theater type filter
    if (filters.theaterTypes.length > 0) {
      const theaterTypeMatch = filters.theaterTypes.some((type) => {
        if (type === "National Chain Multiplex") {
          return item.theatre.includes("PVR") || item.theatre.includes("INOX") || item.theatre.includes("CINE POLIS")
        }
        if (type === "Non National Chain Multiplex") {
          return (
            item.theatre.includes("MUKTA") ||
            item.theatre.includes("MIRAJ") ||
            item.theatre.includes("RAHANS") ||
            item.theatre.includes("MOVIEMAX")
          )
        }
        if (type === "Single Screen") {
          return item.theatre.includes("REGAL") || item.theatre.includes("MARATHA") || item.theatre.includes("GEETA")
        }
        return false
      })
      if (!theaterTypeMatch) return false
    }

    // Week filter for day-wise view
    if (isDayWiseView && filters.weekNumbers.length > 0) {
      const weekMatch = filters.weekNumbers.some((weekNum) => {
        return item.week === `Week ${weekNum}`
      })
      if (!weekMatch) return false
    }

    return true
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a]
    let bValue: any = b[sortField as keyof typeof b]

    if (sortField === "audience" || sortField === "nettAmount") {
      aValue = Number(aValue)
      bValue = Number(bValue)
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination
  const totalItems = sortedData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleViewToggle = (checked: boolean) => {
    setIsDayWiseView(checked)
    setCurrentPage(1) // Reset to first page when switching views
    // Update sort field if it was 'week' and switching to day view
    if (checked && sortField === "week") {
      setSortField("day")
    } else if (!checked && sortField === "day") {
      setSortField("week")
    }
  }

  const exportToCSV = () => {
    const headers = isDayWiseView
      ? [
          "Week",
          "Day",
          "Date",
          "Circuit",
          "Sub Circuit",
          "Theatre",
          "Station",
          "Controllers",
          "Screen Type",
          "Shows",
          "Audience",
          "Nett Amount",
        ]
      : [
          "Week",
          "Circuit",
          "Sub Circuit",
          "Theatre",
          "Station",
          "Controllers",
          "Screen Type",
          "Shows",
          "Audience",
          "Nett Amount",
        ]

    const csvContent = [
      headers.join(","),
      ...sortedData.map((item) => {
        const baseData = [
          item.week,
          ...(isDayWiseView ? [(item as any).day, (item as any).date] : []),
          item.circuit,
          item.subCircuit,
          `"${item.theatre}"`,
          `"${item.station}"`,
          `"${item.controllers}"`,
          item.screenType,
          item.show,
          item.audience,
          item.nettAmount,
        ]
        return baseData.join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dcr-report-${isDayWiseView ? "daywise" : "weekwise"}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isDayWiseView ? <CalendarDays className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                Consolidated DCR Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isDayWiseView
                  ? "Daily Collection Report with day-wise granular data"
                  : "Daily Collection Report with weekly aggregated data"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="view-toggle" className="text-sm font-medium">
                  Week View
                </Label>
                <Switch id="view-toggle" checked={isDayWiseView} onCheckedChange={handleViewToggle} />
                <Label htmlFor="view-toggle" className="text-sm font-medium">
                  Day View
                </Label>
              </div>
              <Badge variant="outline">
                {totalItems} record{totalItems !== 1 ? "s" : ""}
              </Badge>
              <Button onClick={exportToCSV} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search theaters, circuits, stations, or controllers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(filters.circuitIds.length > 0 ||
            filters.theaterTypes.length > 0 ||
            filters.weekNumbers.length > 0 ||
            searchTerm) && (
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && <Badge variant="secondary">Search: "{searchTerm}"</Badge>}
              {filters.circuitIds.length > 0 && (
                <Badge variant="secondary">
                  {filters.circuitIds.length} circuit{filters.circuitIds.length > 1 ? "s" : ""}
                </Badge>
              )}
              {filters.theaterTypes.length > 0 && (
                <Badge variant="secondary">
                  {filters.theaterTypes.length} theater type{filters.theaterTypes.length > 1 ? "s" : ""}
                </Badge>
              )}
              {filters.weekNumbers.length > 0 && (
                <Badge variant="secondary">
                  {filters.weekNumbers.length} week{filters.weekNumbers.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("week")}>
                    <div className="flex items-center gap-2">
                      Week
                      <SortIcon field="week" />
                    </div>
                  </TableHead>
                  {isDayWiseView && (
                    <>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("day")}>
                        <div className="flex items-center gap-2">
                          Day
                          <SortIcon field="day" />
                        </div>
                      </TableHead>
                      <TableHead>Date</TableHead>
                    </>
                  )}
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("circuit")}>
                    <div className="flex items-center gap-2">
                      Circuit
                      <SortIcon field="circuit" />
                    </div>
                  </TableHead>
                  <TableHead>Sub Circuit</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("theatre")}>
                    <div className="flex items-center gap-2">
                      Theatre
                      <SortIcon field="theatre" />
                    </div>
                  </TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Controllers</TableHead>
                  <TableHead>Screen Type</TableHead>
                  <TableHead>Shows</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("audience")}>
                    <div className="flex items-center gap-2">
                      Audience
                      <SortIcon field="audience" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("nettAmount")}>
                    <div className="flex items-center gap-2">
                      Nett Amount (₹)
                      <SortIcon field="nettAmount" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isDayWiseView ? 12 : 10} className="text-center py-8 text-muted-foreground">
                      No data found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={`${item.theatre}-${item.week}-${isDayWiseView ? (item as any).day : ""}-${index}`}>
                      <TableCell>
                        <Badge variant="outline">{item.week}</Badge>
                      </TableCell>
                      {isDayWiseView && (
                        <>
                          <TableCell>
                            <Badge variant="secondary">{(item as any).day}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{(item as any).date}</TableCell>
                        </>
                      )}
                      <TableCell className="font-medium">{item.circuit}</TableCell>
                      <TableCell>{item.subCircuit}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={item.theatre}>
                          {item.theatre}
                        </div>
                      </TableCell>
                      <TableCell>{item.station}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={item.controllers}>
                          {item.controllers}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.screenType}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{item.show}</TableCell>
                      <TableCell className="text-right font-mono">{item.audience.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">₹{item.nettAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} results
                {isDayWiseView ? " (Day-wise view)" : " (Week-wise view)"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
