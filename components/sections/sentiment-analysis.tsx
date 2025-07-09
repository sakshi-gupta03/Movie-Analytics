"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain, Clock } from "lucide-react"

export function SentimentAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">Sentiment Analysis</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto">
              <Clock className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
            <p className="text-gray-600 max-w-md">
              We're working on advanced sentiment analysis features to help you understand customer feedback and movie
              reviews.
            </p>
            <div className="text-sm text-gray-500">Expected launch: Q2 2024</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
