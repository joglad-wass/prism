'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts/theme-context'
import { useFilter } from '../../contexts/filter-context'
import { CostCenterSelector } from './cost-center-selector'
import { useLabels } from '../../hooks/useLabels'
import {
  Users,
  Building2,
  UserCheck,
  Briefcase,
  Home,
  BarChart3,
  ArrowRightFromLine,
  ArrowLeftFromLine
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

export function Sidebar() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const { labels } = useLabels()
  const { filterSelection } = useFilter()
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [groupNames, setGroupNames] = useState<Record<string, string>>({})

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      name: 'Talent Clients',
      href: '/talent',
      icon: Users,
    },
    {
      name: 'Brands',
      href: '/brands',
      icon: Building2,
    },
    {
      name: labels.agents,
      href: '/agents',
      icon: UserCheck,
    },
    {
      name: labels.deals,
      href: '/deals',
      icon: Briefcase,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
  ]

  useEffect(() => {
    setMounted(true)
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  // Fetch cost center groups to get display names
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cost-centers')
        const data = await response.json()
        if (data.success && data.data?.groups) {
          const names: Record<string, string> = {}
          data.data.groups.forEach((group: { id: string; displayName: string }) => {
            names[group.id] = group.displayName
          })
          setGroupNames(names)
        }
      } catch (error) {
        console.error('Failed to fetch cost center groups:', error)
      }
    }
    fetchGroups()
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  // Determine if we should use dark logo (only after mount)
  const isDark = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

  // Get display name for collapsed cost center display
  const getCostCenterDisplay = () => {
    if (filterSelection.type === 'all') return 'A'
    if (filterSelection.type === 'individual') {
      // For individual cost centers, show the CC number (e.g., "CC501" -> "501")
      const match = filterSelection.value?.match(/CC(\d+)/)
      return match ? match[1] : filterSelection.value?.slice(0, 3)?.toUpperCase() || '?'
    }
    if (filterSelection.type === 'group' && filterSelection.value) {
      // For groups, get the display name and show first letter
      const displayName = groupNames[filterSelection.value]
      return displayName?.charAt(0)?.toUpperCase() || '?'
    }
    return '?'
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 relative",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
      {/* Toggle Button - Only show when expanded */}
      {!isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-md flex items-center justify-center transition-all duration-300"
          aria-label="Collapse sidebar"
        >
          <ArrowLeftFromLine className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4 justify-between">
        <div className={cn(
          "flex items-center overflow-hidden",
          isCollapsed && "opacity-0"
        )}>
          <div className="h-8 w-8 relative flex-shrink-0">
            <Image
              src={isDark ? "/logo_dark.png" : "/logo.png"}
              alt="Wasserman Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="ml-3 font-semibold text-lg text-sidebar-foreground whitespace-nowrap">
            Wasserman Prism
          </span>
        </div>
        {isCollapsed && (
          <div className="h-8 w-8 relative flex-shrink-0">
            <Image
              src={isDark ? "/logo_dark.png" : "/logo.png"}
              alt="Wasserman Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>

      {/* Cost Center Selector */}
      {isCollapsed ? (
        <div className="px-3 pb-3">
          <div
            className="w-full h-10 rounded-md border border-input bg-background flex items-center justify-center cursor-default"
            title="Cost Center Filter"
          >
            <span className="text-sm font-medium text-muted-foreground">
              {getCostCenterDisplay()}
            </span>
          </div>
        </div>
      ) : (
        <CostCenterSelector />
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const linkContent = (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                !isCollapsed && "mr-3"
              )} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )

          if (isCollapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return linkContent
        })}

        {/* Expand button - Only show when collapsed */}
        {isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSidebar}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full justify-center"
              >
                <ArrowRightFromLine className="h-5 w-5 flex-shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expand sidebar</p>
            </TooltipContent>
          </Tooltip>
        )}
      </nav>
    </div>
    </TooltipProvider>
  )
}