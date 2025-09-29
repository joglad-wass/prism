'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import {
  Building,
  User,
  DollarSign,
  Calendar,
  Target,
  Percent,
  ExternalLink,
  Plus,
  Calculator,
} from 'lucide-react'
import { Deal } from '../../types'

interface DealOverviewProps {
  deal: Deal
}

export function DealOverview({ deal }: DealOverviewProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateCommission = () => {
    if (deal.Amount && deal.dealPercent) {
      return deal.Amount * (deal.dealPercent / 100)
    }
    return deal.commission || 0
  }

  const handleCreateWorkdayProject = () => {
    // Future: Implement Workday project creation
    console.log('Creating Workday project for deal:', deal.id)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Deal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Deal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline">{deal.Status__c}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stage</span>
                <Badge variant="secondary">{deal.StageName}</Badge>
              </div>

              {deal.division && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Division</span>
                  <span className="text-sm text-muted-foreground">{deal.division}</span>
                </div>
              )}

              {deal.company && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Company</span>
                  <span className="text-sm text-muted-foreground">{deal.company}</span>
                </div>
              )}

              {deal.Account_Industry__c && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Industry</span>
                  <span className="text-sm text-muted-foreground">{deal.Account_Industry__c}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Start Date</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(deal.startDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Close Date</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(deal.closeDate)}
                </span>
              </div>

              {deal.Stage_Last_Updated__c && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stage Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(deal.Stage_Last_Updated__c)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account & Owner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account & Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Brand/Account</span>
                <span className="text-sm text-muted-foreground">
                  {deal.brand?.name || deal.Account_Name__c || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Owner</span>
                <span className="text-sm text-muted-foreground">
                  {deal.owner?.name || deal.Licence_Holder_Name__c || 'Unassigned'}
                </span>
              </div>

              {deal.owner?.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Owner Email</span>
                  <span className="text-sm text-muted-foreground">{deal.owner.email}</span>
                </div>
              )}

              {deal.Owner_Workday_Cost_Center__c && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cost Center</span>
                  <span className="text-sm text-muted-foreground">
                    {deal.Owner_Workday_Cost_Center__c}
                  </span>
                </div>
              )}

              {deal.CompanyReference__c && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Company Reference</span>
                  <span className="text-sm text-muted-foreground">
                    {deal.CompanyReference__c}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Details
          </CardTitle>
          <CardDescription>
            Deal amounts, percentages, and commission calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Deal Amount */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Deal Amount</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(deal.Amount)}
              </div>
              {deal.splitPercent && (
                <div className="text-xs text-muted-foreground">
                  Split: {deal.splitPercent}%
                </div>
              )}
            </div>

            {/* Contract Amount */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Contract Amount</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(deal.Contract_Amount__c)}
              </div>
              {/* {deal.Talent_Marketing_Fee_Percentage__c && (
                <div className="text-xs text-muted-foreground">
                  Marketing Fee: {deal.Talent_Marketing_Fee_Percentage__c}%
                </div>
              )} */}
            </div>

            {/* Commission */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Commission</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(calculateCommission())}
              </div>
              {deal.dealPercent && (
                <div className="text-xs text-muted-foreground">
                  Rate: {deal.dealPercent}%
                </div>
              )}
            </div>
          </div>

          {/* Deal Percentages */}
          {(deal.dealPercent || deal.splitPercent || deal.Talent_Marketing_Fee_Percentage__c) && (
            <>
              <Separator className="my-6" />
              <div className="grid gap-4 md:grid-cols-3">
                {deal.dealPercent && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Deal Percentage</span>
                    </div>
                    <span className="text-sm font-semibold">{deal.dealPercent}%</span>
                  </div>
                )}

                {deal.splitPercent && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Split Percentage</span>
                    </div>
                    <span className="text-sm font-semibold">{deal.splitPercent}%</span>
                  </div>
                )}

                {deal.Talent_Marketing_Fee_Percentage__c && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Commission Fee</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {deal.Talent_Marketing_Fee_Percentage__c}%
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Workday Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Workday Integration
          </CardTitle>
          <CardDescription>
            Project creation and management in Workday
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Workday Project</div>
              <div className="text-sm text-muted-foreground">
                {deal.workdayProjectId ? (
                  <span>Project ID: {deal.workdayProjectId}</span>
                ) : (
                  <span>No project created yet</span>
                )}
              </div>
            </div>

            {!deal.workdayProjectId ? (
              <Button onClick={handleCreateWorkdayProject}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            ) : (
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Workday
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Summary */}
      {/* {deal.products && deal.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Products ({deal.products.length})</CardTitle>
            <CardDescription>
              Products associated with this deal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deal.products.map((product, index) => (
                <div key={product.id || index} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {product.Product_Name__c || `Product ${index + 1}`}
                    </div>
                    {product.ProductCode && (
                      <div className="text-sm text-muted-foreground">
                        Code: {product.ProductCode}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {product.UnitPrice ? formatCurrency(product.UnitPrice) : 'N/A'}
                    </div>
                    {product._count?.schedules && (
                      <div className="text-sm text-muted-foreground">
                        {product._count.schedules} schedules
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}