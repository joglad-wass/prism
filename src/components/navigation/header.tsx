'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../ui/dropdown-menu'
import { GlobalSearch } from '../search/global-search'
import { SearchResult } from '../../types'
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ArrowLeftRight,
  Check,
} from 'lucide-react'
import { useTheme } from '../../contexts/theme-context'
import { useUser } from '../../contexts/user-context'
import { useLabels } from '../../hooks/useLabels'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export function Header() {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const { user, availableUsers, activeUserId, switchUser } = useUser()
  const { labels } = useLabels()
  const [switchingUserId, setSwitchingUserId] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const handleSearchResult = (result: SearchResult) => {
    // Navigate based on result type
    switch (result.type) {
      case 'talent':
        router.push(`/talent`)
        break
      case 'brand':
        router.push(`/brands`)
        break
      case 'agent':
        router.push(`/agents`)
        break
      case 'deal':
        router.push(`/deals`)
        break
    }
  }

  const handleSwitchUser = async (userId: string) => {
    if (userId === activeUserId) return

    try {
      setSwitchingUserId(userId)
      await switchUser(userId)
    } catch (error) {
      console.error('Failed to switch user:', error)
    } finally {
      setSwitchingUserId(null)
    }
  }

  const currentUserOption = availableUsers.find((candidate) => candidate.id === activeUserId)
  const switchableUsers = availableUsers.filter((candidate) => candidate.id !== activeUserId)

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Search */}
      <div className="flex flex-1 items-center max-w-md">
        <GlobalSearch
          onResultSelect={handleSearchResult}
          trigger={
            <Button variant="outline" className="justify-start w-full">
              <Search className="mr-2 h-4 w-4" />
              Search talents, brands, {labels.deals.toLowerCase()}...
            </Button>
          }
        />
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePictureUrl || undefined} alt={user?.name || 'User'} />
                <AvatarFallback className="text-xs">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="w-56">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Switch user
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                {currentUserOption && (
                  <DropdownMenuItem disabled className="cursor-default opacity-80">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">{currentUserOption.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Current user · {currentUserOption.userType === 'ADMINISTRATOR' ? 'Administrator' : 'Agent'}
                        </span>
                      </div>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  </DropdownMenuItem>
                )}
                {currentUserOption && switchableUsers.length > 0 && <DropdownMenuSeparator />}
                {switchableUsers.length === 0 ? (
                  <DropdownMenuItem disabled>
                    No other users available
                  </DropdownMenuItem>
                ) : (
                  switchableUsers.map((candidate) => (
                    <DropdownMenuItem
                      key={candidate.id}
                      onClick={() => handleSwitchUser(candidate.id)}
                      disabled={switchingUserId !== null}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{candidate.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {candidate.userType === 'ADMINISTRATOR' ? 'Administrator' : 'Agent'}
                          </span>
                        </div>
                        {switchingUserId === candidate.id && (
                          <div className="h-4 w-4 animate-spin border-2 border-muted border-t-transparent rounded-full" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger align="end"className="w-56">
                <div className="mr-2 h-4 w-6">
                  {getThemeIcon()}
                </div>
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
