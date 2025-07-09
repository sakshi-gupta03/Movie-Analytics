"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock } from "lucide-react"

export function Planning() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Planning</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto">
              <Clock className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
            <p className="text-gray-600 max-w-md">
              Strategic planning tools and business forecasting features are under development to help you plan your
              cinema operations.
            </p>
            <div className="text-sm text-gray-500">Expected launch: Q2 2024</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
