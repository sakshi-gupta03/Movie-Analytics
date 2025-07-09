"use client"

import { useState } from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Filters } from "@/components/dashboard/filters"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { SentimentAnalysis } from "@/components/sections/sentiment-analysis"
import { Planning } from "@/components/sections/planning"
import { Invoicing } from "@/components/sections/invoicing"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { BarChart3, Zap } from "lucide-react"
import type { FilterState, User as UserType } from "@/lib/types"

type AuthView = "login" | "signup" | "forgot-password"

export default function HomePage() {
  const [authView, setAuthView] = useState<AuthView>("login")
  const [user, setUser] = useState<UserType | null>(null)
  const [activeSection, setActiveSection] = useState("reporting")
  const [filters, setFilters] = useState<FilterState>({
    movieId: "",
    circuitIds: [],
    // subCircuitIds: [],
    chainIds: [],
    theaterTypes: [],
    weekNumbers: [],
    dateRange: {
      from: new Date(2024, 0, 1),
      to: new Date(),
    },
  })

  const handleLogin = (email: string, password: string) => {
    setUser({
      id: "1",
      email,
      name: email.split("@")[0],
    })
  }

  const handleSignup = (name: string, email: string, password: string) => {
    setUser({
      id: "1",
      email,
      name,
    })
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleReset = () => {
    setFilters({
      movieId: "",
      circuitIds: [],
      subCircuitIds: [],
      chainIds: [],
      theaterTypes: [],
      weekNumbers: [],
      dateRange: {
        from: new Date(2024, 0, 1),
        to: new Date(),
      },
    })
  }

  if (!user) {
    switch (authView) {
      case "login":
        return (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthView("signup")}
            onForgotPassword={() => setAuthView("forgot-password")}
          />
        )
      case "signup":
        return <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setAuthView("login")} />
      case "forgot-password":
        return <ForgotPasswordForm onBackToLogin={() => setAuthView("login")} />
    }
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="text-center py-20 text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-6 text-gray-300" />
              <p className="text-xl font-medium text-gray-700 mb-2">Welcome to Uttaram.ai</p>
            </div>
          </div>
        )
      case "sentiment":
        return <SentimentAnalysis />
      case "planning":
        return <Planning />
      case "reporting":
        return (
          <div className="space-y-6">
            <Filters filters={filters} onFiltersChange={handleFiltersChange} onReset={handleReset} />
            <DashboardTabs filters={filters} />
          </div>
        )
      case "invoicing":
        return <Invoicing />
      default:
        return (
          <div className="text-center py-20 text-gray-500">
            <BarChart3 className="h-16 w-16 mx-auto mb-6 text-gray-300" />
            <p className="text-xl font-medium text-gray-700 mb-2">Module Under Development</p>
            <p className="text-gray-500">This feature will be available soon</p>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>

            </div>
          </div>

          {renderMainContent()}
        </main>
      </div>
    </SidebarProvider>
  )
}
