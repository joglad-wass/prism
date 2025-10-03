'use client'

import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Building } from 'lucide-react'
import { TalentDetail } from '../../types/talent'
import { BrandListPanel } from './brand-list-panel'
import { BrandDetailsPanel } from './brand-details-panel'

interface TalentBrandsProps {
  talent: TalentDetail
}

export function TalentBrands({ talent }: TalentBrandsProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Group deals by brand
  const brandGroups = talent.deals?.reduce((acc, dc) => {
    const brandName = dc.deal.brand?.name || 'Unknown Brand'

    if (!acc[brandName]) {
      const brand = dc.deal.brand as any
      acc[brandName] = {
        brand: brandName,
        brandId: dc.deal.brand?.id,
        type: brand?.type || brand?.Type || brand?.Account_Type__c,
        status: brand?.Status__c || brand?.status,
        industry: brand?.Industry || brand?.Account_Industry__c || brand?.industry,
        ownerEmail: brand?.owner?.email,
        ownerName: brand?.owner?.name,
        deals: [],
        totalRevenue: 0,
        talentRevenue: 0,
        wassermanRevenue: 0,
      }
    }

    // Calculate revenues from schedules
    const talentAmount = dc.deal.schedules?.reduce((sum, schedule) => {
      const amount = typeof schedule.Talent_Invoice_Line_Amount__c === 'string'
        ? parseFloat(schedule.Talent_Invoice_Line_Amount__c)
        : (schedule.Talent_Invoice_Line_Amount__c || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0) || 0

    const wassermanAmount = dc.deal.schedules?.reduce((sum, schedule) => {
      const amount = typeof schedule.Wasserman_Invoice_Line_Amount__c === 'string'
        ? parseFloat(schedule.Wasserman_Invoice_Line_Amount__c)
        : (schedule.Wasserman_Invoice_Line_Amount__c || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0) || 0

    const dealAmount = Number((dc.deal as any).Amount || dc.deal.amount) || 0

    acc[brandName].deals.push({
      id: dc.deal.id,
      name: dc.deal.name || 'Unnamed Deal',
      amount: dealAmount,
      stage: (dc.deal as any).StageName || dc.deal.stage || 'Unknown',
      talentAmount,
      wassermanAmount,
    })

    acc[brandName].totalRevenue += dealAmount
    acc[brandName].talentRevenue += talentAmount
    acc[brandName].wassermanRevenue += wassermanAmount

    return acc
  }, {} as Record<string, {
    brand: string
    brandId?: string
    type?: string
    status?: string
    industry?: string
    ownerEmail?: string
    ownerName?: string
    deals: any[]
    totalRevenue: number
    talentRevenue: number
    wassermanRevenue: number
  }>)

  const brandGroupsArray = brandGroups ? Object.values(brandGroups) : []

  if (brandGroupsArray.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-6 text-muted-foreground">
            <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No associated brands</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <BrandListPanel
        brandGroups={brandGroupsArray}
        selectedBrand={selectedBrand}
        onBrandClick={(brand) => setSelectedBrand(brand)}
        formatCurrency={formatCurrency}
      />

      <BrandDetailsPanel
        brandGroup={brandGroupsArray.find(g => g.brand === selectedBrand) || (brandGroupsArray.length > 0 ? brandGroupsArray[0] : null)}
        emptyMessage="Select a brand to view details"
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
