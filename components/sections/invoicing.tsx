"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Receipt, Clock } from "lucide-react"

export function Invoicing() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Receipt className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Invoicing</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto">
              <Clock className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
            <p className="text-gray-600 max-w-md">
              Comprehensive invoicing and billing management system is being developed to streamline your financial
              operations.
            </p>
            <div className="text-sm text-gray-500">Expected launch: Q3 2024</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
