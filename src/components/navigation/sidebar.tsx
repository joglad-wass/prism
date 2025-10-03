'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { GlobalSearch } from '../search/global-search'
import { useTheme } from '../../contexts/theme-context'
import { CostCenterSelector } from './cost-center-selector'
import {
  Users,
  Building2,
  UserCheck,
  Briefcase,
  Search,
  Home,
  BarChart3
} from 'lucide-react'

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
    name: 'Agents',
    href: '/agents',
    icon: UserCheck,
  },
  {
    name: 'Deals',
    href: '/deals',
    icon: Briefcase,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine if we should use dark logo (only after mount)
  const isDark = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center">
          <div className="h-8 w-8 relative">
            <Image
              src={isDark ? "/logo_dark.png" : "/logo.png"}
              alt="Wasserman Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="ml-3 font-semibold text-lg text-sidebar-foreground">Wasserman Prism</span>
        </div>
      </div>

      {/* Cost Center Selector */}
      <CostCenterSelector />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Search Button */}
      <div className="p-3">
        <GlobalSearch
          trigger={
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Search className="mr-2 h-4 w-4" />
              Search...
            </Button>
          }
        />
      </div>
    </div>
  )
}