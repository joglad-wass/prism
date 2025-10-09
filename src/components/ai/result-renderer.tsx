import { PresentationMetadata } from '../../services/ai'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface ResultRendererProps {
  data: any
  presentation: PresentationMetadata
}

export function ResultRenderer({ data, presentation }: ResultRendererProps) {
  // Defensive checks
  if (!presentation || !data) {
    return null
  }

  // Count display
  if (presentation.type === 'count') {
    return (
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="text-4xl font-bold text-primary">{data}</div>
        <div className="text-sm text-muted-foreground">{presentation.title || 'Total'}</div>
      </div>
    )
  }

  // Single item display (e.g., individual agent)
  if (presentation.type === 'single' && !Array.isArray(data)) {
    const SingleWrapper = data.id ? Link : 'div'
    const wrapperProps = data.id
      ? { href: `/agents/${data.id}`, className: "block" }
      : {}

    return (
      <SingleWrapper {...wrapperProps}>
        <Card className={data.id ? "cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{presentation.title}</CardTitle>
              {data.id && (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {Object.entries(data)
                .filter(([key]) => key !== 'id')
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="text-sm mt-1">
                      {formatValue(key, value)}
                    </dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>
      </SingleWrapper>
    )
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No results found</div>
  }

  // Table display for deals
  if (presentation.type === 'table') {
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="text-sm text-muted-foreground">No data to display</div>
    }

    const columns = presentation.columns || Object.keys(data[0] || {})

    if (columns.length === 0) {
      return <div className="text-sm text-muted-foreground">No columns to display</div>
    }

    return (
      <div className="space-y-2">
        {presentation.title && (
          <div className="text-sm font-medium text-muted-foreground">{presentation.title}</div>
        )}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {col.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row: any, idx: number) => {
                const RowWrapper = row.id ? Link : 'tr'
                const rowProps = row.id
                  ? { href: `/deals/${row.id}`, className: "hover:bg-muted/30 transition-colors cursor-pointer table-row" }
                  : { className: "hover:bg-muted/30 transition-colors" }

                return (
                  <RowWrapper key={idx} {...rowProps}>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-sm">
                        {formatValue(col, row[col], row.id)}
                      </td>
                    ))}
                  </RowWrapper>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Cards display for clients and agents
  if (presentation.type === 'cards') {
    return (
      <div className="space-y-2">
        {presentation.title && (
          <div className="text-sm font-medium text-muted-foreground">{presentation.title}</div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((item: any, idx: number) => {
            const CardWrapper = item.id ? Link : 'div'
            const cardProps = item.id
              ? {
                  href: presentation.title?.includes('Agent') ? `/agents/${item.id}` : `/talent/${item.id}`,
                  className: "block hover:shadow-lg transition-shadow"
                }
              : {}

            return (
              <CardWrapper key={idx} {...cardProps}>
                <Card className={item.id ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{item.name || item.dealName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(item)
                      .filter(([key]) => key !== 'name' && key !== 'dealName' && key !== 'id')
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-medium">{formatValue(key, value)}</span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </CardWrapper>
            )
          })}
        </div>
      </div>
    )
  }

  // Default list display
  return (
    <div className="space-y-2">
      {data.map((item: any, idx: number) => (
        <div key={idx} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
          <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}

// Format values based on field type
function formatValue(key: string, value: any, rowId?: string): React.ReactNode {
  if (value === null || value === undefined) return '-'

  // Deal name - just display as text since row is clickable
  if (key === 'dealName') {
    return <span className="font-medium">{value}</span>
  }

  // Amount/currency formatting
  if (key.toLowerCase().includes('amount') && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Date formatting
  if (key.toLowerCase().includes('date') && value) {
    return new Date(value).toLocaleDateString()
  }

  // Status/Stage badges
  if (key.toLowerCase().includes('status') || key.toLowerCase().includes('stage')) {
    const variant = getStatusVariant(value)
    return <Badge variant={variant}>{value}</Badge>
  }

  return String(value)
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status?.toLowerCase() || ''
  if (s.includes('won') || s.includes('active') || s.includes('closed won')) return 'default'
  if (s.includes('lost') || s.includes('inactive')) return 'destructive'
  if (s.includes('negotiation') || s.includes('proposal')) return 'secondary'
  return 'outline'
}
