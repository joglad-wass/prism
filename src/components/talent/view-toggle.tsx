'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, Table } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

type ViewType = 'modular' | 'table'

interface ViewToggleProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-8 p-0"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-8 p-0"
        >
          <Table className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={view === 'modular' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('modular')}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Modular View</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={view === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('table')}
              className="h-8 w-8 p-0"
            >
              <Table className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Table View</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
