'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../../components/layout/app-layout'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { BrandOverview } from '../../../components/brand/brand-overview'
import { BrandContact } from '../../../components/brand/brand-contact'
import { BrandTalent } from '../../../components/brand/brand-talent'
import { BrandDeals } from '../../../components/brand/brand-deals'
import { BrandNotes } from '../../../components/brand/brand-notes'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { BrandService } from '../../../services/brands'
import { Brand } from '../../../types'
import { useLabels } from '../../../hooks/useLabels'

interface BrandDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = use(params)

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true)
        setError(null)
        const brandData = await BrandService.getBrand(id)
        setBrand(brandData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load brand')
        console.error('Error fetching brand:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBrand()
    }
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading brand details...</span>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading Brand</h2>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!brand) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Brand Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2">The brand you're looking for doesn't exist.</p>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const handleExternalLink = (type: 'salesforce' | 'workday') => {
    const id = type === 'salesforce' ? brand.salesforceId : brand.workdayId
    if (id) {
      // In a real app, these would be proper external URLs
      console.log(`Opening ${type} with ID: ${id}`)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
        return 'secondary'
      case 'PROSPECT':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getTypeVariant = (type: string) => {
    return type === 'AGENCY' ? 'secondary' : 'default'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {brand.salesforceId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExternalLink('salesforce')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Salesforce
              </Button>
            )}
            {brand.workdayId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExternalLink('workday')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Workday
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight gap-2">{brand.name}</h1>
              {brand.altName && (
                <p className="text-muted-foreground mt-1">
                  Also known as: {brand.altName}
                </p>
              )}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(brand.status)}>
                    {brand.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getTypeVariant(brand.type)}>
                    {brand.type}
                  </Badge>
                </div>
              </div>
              {brand.industry && (
                <p className="text-muted-foreground flex items-center gap-2 mt-2">
                  {brand.industry}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="talent">Talent</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="deals">{labels.deals}</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <BrandOverview brand={brand} />
          </TabsContent>

          <TabsContent value="talent">
            <BrandTalent brand={brand} />
          </TabsContent>

          <TabsContent value="contact">
            <BrandContact brand={brand} />
          </TabsContent>

          <TabsContent value="deals">
            <BrandDeals brand={brand} />
          </TabsContent>

          <TabsContent value="notes">
            <BrandNotes brand={brand} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
