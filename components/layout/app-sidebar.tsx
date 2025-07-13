"use client"

import type React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BarChart3, Brain, Receipt, Home, TrendingUp, Zap } from "lucide-react"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },

  {
    title: "Sentiment Analysis",
    icon: Brain,
    id: "sentiment",
  },
  {
    title: "Planning",
    icon: TrendingUp,
    id: "planning",
  },
    {
    title: "Reporting",
    icon: BarChart3,
    id: "reporting",
  },
  {
    title: "Revenue & Invoicing",
    icon: Receipt,
    id: "invoicing",
  },
]

export function AppSidebar({ activeSection, onSectionChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      <SidebarHeader>
        <div className="flex items-center space-x-3 px-3 py-4">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex-shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
            <h1 className="text-lg font-brand text-gray-900 tracking-wider">UTTARAM.AI</h1>
            <p className="text-xs text-gray-500 font-medium">Analytics Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs font-medium text-gray-600">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    tooltip={item.title}
                    className="w-full font-medium"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
