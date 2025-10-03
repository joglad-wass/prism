'use client'

import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Calendar } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface TalentListPanelProps {
  talents: Array<{
    id: string
    Name: string
    category?: string
    status: string
    isNil?: boolean
    lastDealDate?: string
    agents?: {
      isPrimary: boolean
      agent: {
        name: string
      }
    }[]
  }>
  selectedTalentId: string | null
  onTalentClick: (talentId: string) => void
  formatDate: (dateString?: string) => string
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline'
}

export function TalentListPanel({
  talents,
  selectedTalentId,
  onTalentClick,
  formatDate,
  getStatusVariant,
}: TalentListPanelProps) {
  const { labels } = useLabels()

  return (
    <div className={selectedTalentId ? 'lg:col-span-1' : ''}>
      <div className={`space-y-2 ${selectedTalentId ? '' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}`}>
        {talents.map((talent) => (
          <div
            key={talent.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedTalentId === talent.id
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onTalentClick(talent.id)}
          >
            <Link
              href={`/talent/${talent.id}`}
              className="font-medium text-sm mb-2 hover:text-primary hover:underline inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              {talent.Name}
            </Link>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={getStatusVariant(talent.status)} className="text-xs">
                {talent.status}
              </Badge>
              {talent.category && (
                <Badge variant="outline" className="text-xs">
                  {talent.category}
                </Badge>
              )}
              {talent.isNil && (
                <Badge variant="secondary" className="text-xs">
                  NIL
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              <div>
                Agent: {talent.agents?.find(ta => ta.isPrimary)?.agent?.name || talent.agents?.[0]?.agent?.name || 'No agent assigned'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last {labels.deal}: {formatDate(talent.lastDealDate)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
