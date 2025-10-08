'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, Table, List, Rows, PanelTop } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

export type ProductViewType = 'modular' | 'grouped' | 'flat' | 'master-detail' | 'compact'

interface ProductsViewSelectorProps {
  view: ProductViewType
  onViewChange: (view: ProductViewType) => void
}

const viewOptions = [
  {
    value: 'modular' as const,
    label: 'Modular',
    icon: LayoutGrid,
    description: 'Card-based with detail panel'
  },
  {
    value: 'grouped' as const,
    label: 'Grouped Table',
    icon: Rows,
    description: 'Expandable row groups'
  },
  {
    value: 'flat' as const,
    label: 'Flat Table',
    icon: List,
    description: 'All data visible'
  },
  {
    value: 'master-detail' as const,
    label: 'Master-Detail',
    icon: PanelTop,
    description: 'Two-level tables'
  },
  {
    value: 'compact' as const,
    label: 'Compact',
    icon: Table,
    description: 'Inline mini-tables'
  },
]

export function ProductsViewSelector({ view, onViewChange }: ProductsViewSelectorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show placeholder during SSR
  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-input bg-transparent" />
    )
  }

  const currentOption = viewOptions.find(opt => opt.value === view) || viewOptions[0]
  const Icon = currentOption.icon

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Icon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentOption.label}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {viewOptions.map((option) => {
            const OptionIcon = option.icon
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onViewChange(option.value)}
              >
                <div className="flex items-start gap-3 py-1">
                  <OptionIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
