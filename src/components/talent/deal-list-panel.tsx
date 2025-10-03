'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Briefcase, ChevronDown, ChevronRight, DollarSign, Package } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface DealListPanelProps {
  deals: any[]
  title: string
  selectedDeal: any | null
  selectedProduct: any | null
  expandedDeals: Set<string>
  onDealClick: (deal: any) => void
  onProductClick: (product: any, deal: any) => void
  onToggleExpansion: (dealId: string) => void
  formatCurrency: (amount?: number) => string
}

export function DealListPanel({
  deals,
  title,
  selectedDeal,
  selectedProduct,
  expandedDeals,
  onDealClick,
  onProductClick,
  onToggleExpansion,
  formatCurrency,
}: DealListPanelProps) {
  const { labels } = useLabels()

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No {labels.deals.toLowerCase()} found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deals.map((deal) => {
              const isExpanded = expandedDeals.has(deal.id)
              const hasProducts = deal.products && deal.products.length > 0

              return (
                <div key={deal.id} className="space-y-1">
                  {/* Deal Item */}
                  <div
                    className={`p-3 border rounded-lg transition-colors ${
                      selectedDeal?.id === deal.id && !selectedProduct
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Chevron for expansion */}
                      {hasProducts && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleExpansion(deal.id)
                          }}
                          className="mt-1 hover:bg-muted/50 rounded p-0.5"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      {/* Deal Content */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => onDealClick(deal)}
                      >
                        <div className="font-medium text-sm">{deal.name}</div>
                        {deal.brandId ? (
                          <Link
                            href={`/brands/${deal.brandId}`}
                            className="text-xs text-muted-foreground hover:text-primary hover:underline mt-1 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {deal.brand}
                          </Link>
                        ) : (
                          <div className="text-xs text-muted-foreground mt-1">{deal.brand}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {deal.stage}
                          </Badge>
                          {hasProducts && (
                            <span className="text-xs text-muted-foreground">
                              {deal.products.length} deliverable{deal.products.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(deal.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Deliverables List (when expanded) */}
                  {isExpanded && hasProducts && (
                    <div className="ml-6 space-y-1">
                      {deal.products.map((product: any) => (
                        <div
                          key={product.id}
                          className={`p-2 pl-4 border-l-2 rounded cursor-pointer transition-colors ${
                            selectedProduct?.id === product.id
                              ? 'bg-primary/10 border-l-primary'
                              : 'border-l-muted hover:bg-muted/50'
                          }`}
                          onClick={() => onProductClick(product, deal)}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium text-xs">
                                {product.Project_Deliverables__c || product.Product_Name__c || 'Unnamed Deliverable'}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {product.ProductCode && <span>{product.ProductCode}</span>}
                                {product.TotalPrice && (
                                  <span className="flex items-center gap-0.5">
                                    <DollarSign className="h-2.5 w-2.5" />
                                    {formatCurrency(Number(product.TotalPrice))}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
