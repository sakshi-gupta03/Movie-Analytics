"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw } from "lucide-react"
import type { FilterState } from "@/lib/types"

interface FiltersProps {
  filters: FilterState
  onFiltersChange: (filters: Partial<FilterState>) => void
  onReset: () => void
}

const movieOptions = [
  { value: "bhool-chuk-maaf", label: "Bhool Chuk Maaf" },
  { value: "chaava", label: "Chaava" },
]

const circuitOptions = [
  { value: "mumbai-city", label: "Mumbai City" },
  { value: "thane-dist", label: "Thane Dist" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "saurashtra", label: "Saurashtra" },
]

const chainOptions = [
  { value: "pvr", label: "PVR Cinemas" },
  { value: "inox", label: "INOX Leisure" },
  { value: "cinepolis", label: "Cinepolis" },
  { value: "carnival", label: "Carnival Cinemas" },
  { value: "miraj", label: "Miraj Cinemas" },
  { value: "fun", label: "Fun Cinemas" },
]

const theaterTypeOptions = [
  { value: "national-chain-multiplex", label: "National Chain Multiplex" },
  { value: "non-national-chain-multiplex", label: "Non National Chain Multiplex" },
  { value: "single-screen", label: "Single Screen" },
  { value: "army-cinema", label: "Army Cinema" },
]

const weekOptions = [
  { value: "1", label: "Week 1" },
  { value: "2", label: "Week 2" },
  { value: "3", label: "Week 3" },
  { value: "4", label: "Week 4" },
  { value: "5", label: "Week 5" },
  { value: "6", label: "Week 6" },
  { value: "7", label: "Week 7" },
  { value: "8", label: "Week 8" },
]

export function Filters({ filters, onFiltersChange, onReset }: FiltersProps) {
  return (
   <Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Filters</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2 min-w-[180px]">
        <label className="text-sm font-medium">Movie</label>
        <Select value={filters.movieId} onValueChange={(value) => onFiltersChange({ movieId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select movie" />
          </SelectTrigger>
          <SelectContent>
            {movieOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 min-w-[180px]">
        <label className="text-sm font-medium">Circuits</label>
        <MultiSelect
          options={circuitOptions}
          selected={filters.circuitIds}
          onChange={(values) => onFiltersChange({ circuitIds: values })}
          placeholder="Select circuits"
        />
      </div>

      <div className="space-y-2 min-w-[180px]">
        <label className="text-sm font-medium">Chains</label>
        <MultiSelect
          options={chainOptions}
          selected={filters.chainIds}
          onChange={(values) => onFiltersChange({ chainIds: values })}
          placeholder="Select chains"
        />
      </div>

      <div className="space-y-2 min-w-[180px]">
        <label className="text-sm font-medium">Theater Types</label>
        <MultiSelect
          options={theaterTypeOptions}
          selected={filters.theaterTypes}
          onChange={(values) => onFiltersChange({ theaterTypes: values })}
          placeholder="Select types"
        />
      </div>

      <div className="space-y-2 min-w-[180px]">
        <label className="text-sm font-medium">Weeks</label>
        <MultiSelect
          options={weekOptions}
          selected={filters.weekNumbers}
          onChange={(values) => onFiltersChange({ weekNumbers: values })}
          placeholder="Select weeks"
        />
      </div>

      <div className="ml-auto">
        <Button variant="outline" onClick={onReset} className="flex items-center gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  </CardContent>
</Card>


  )
}
