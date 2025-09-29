'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../../components/layout/app-layout'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { TalentOverview } from '../../../components/talent/talent-overview'
import { TalentJourney } from '../../../components/talent/talent-journey'
import { TalentContact } from '../../../components/talent/talent-contact'
import { TalentDeals } from '../../../components/talent/talent-deals'
import { TalentNotes } from '../../../components/talent/talent-notes'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MapPin,
} from 'lucide-react'
import Image from 'next/image'
import { TalentService } from '../../../services/talent'
import { TalentDetail } from '../../../types/talent'

interface TalentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function TalentDetailPage({ params }: TalentDetailPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [talent, setTalent] = useState<TalentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = use(params)

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        setLoading(true)
        setError(null)
        const talentData = await TalentService.getTalentById(id)
        setTalent(talentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load talent')
        console.error('Error fetching talent:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTalent()
    }
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading talent details...</span>
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
            <h2 className="text-lg font-semibold text-red-600">Error Loading Talent</h2>
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

  if (!talent) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Talent Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2">The talent client you're looking for doesn't exist.</p>
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
    const id = type === 'salesforce' ? (talent.Id || talent.salesforceId) : (talent.Workday_ID__c || talent.workdayId)
    if (id) {
      // In a real app, these would be proper external URLs
      console.log(`Opening ${type} with ID: ${id}`)
    }
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
            {(talent.Id || talent.salesforceId) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExternalLink('salesforce')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Salesforce
              </Button>
            )}
            {(talent.Workday_ID__c || talent.workdayId) && (
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
              <h1 className="text-3xl font-bold tracking-tight gap-2">{talent.Name}</h1>
              <p className="text-muted-foreground flex items-center h-8">
                <Badge variant={(talent.Status__c || talent.status)?.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                  {talent.Status__c || talent.status || 'Unknown'}
                </Badge>
              </p>
              {(talent.Sport__c || talent.CSM_Sport__c || talent.sport) && (
                <p className="text-muted-foreground flex items-center gap-2">
                  {talent.Sport__c || talent.CSM_Sport__c || talent.sport}
                </p>
              )}
              {(talent.Team__c || talent.team) && (
                <p className="text-muted-foreground flex items-center gap-2">
                  {talent.Team__c || talent.team}
                </p>
              )}
              {(talent.City__c || talent.location) && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {talent.City__c || talent.location}
                </p>
              )}
              {/* Social Media Icons */}
              {((talent.Instagram__c || talent.contacts?.[0]?.instagram) ||
                (talent.X_Twitter__c || talent.contacts?.[0]?.twitter) ||
                (talent.Facebook__c || talent.contacts?.[0]?.facebook) ||
                (talent.YouTube__c || talent.contacts?.[0]?.youtube) ||
                talent.contacts?.[0]?.tiktok ||
                talent.contacts?.[0]?.twitch ||
                talent.contacts?.[0]?.spotify ||
                talent.contacts?.[0]?.soundcloud) && (
                <div className="flex items-center gap-2 mt-2">
                  {(talent.Instagram__c || talent.contacts?.[0]?.instagram) && (
                    <a
                      href={`https://instagram.com/${(talent.Instagram__c || talent.contacts?.[0]?.instagram || '').replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/instagram.png"
                        alt="Instagram"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                  {(talent.X_Twitter__c || talent.contacts?.[0]?.twitter) && (
                    <a
                      href={`https://twitter.com/${(talent.X_Twitter__c || talent.contacts?.[0]?.twitter || '').replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <Image
                        src="/twitter.png"
                        alt="Twitter/X"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                  {(talent.Facebook__c || talent.contacts?.[0]?.facebook) && (
                    <a
                      href={`https://facebook.com/${talent.Facebook__c || talent.contacts?.[0]?.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/facebook.png"
                        alt="Facebook"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                  {(talent.YouTube__c || talent.contacts?.[0]?.youtube) && (
                    <a
                      href={(talent.YouTube__c || talent.contacts?.[0]?.youtube)?.startsWith('http')
                        ? (talent.YouTube__c || talent.contacts?.[0]?.youtube || '')
                        : `https://youtube.com/c/${talent.YouTube__c || talent.contacts?.[0]?.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/youtube.png"
                        alt="YouTube"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                  {talent.contacts?.[0]?.tiktok && (
                    <a
                      href={talent.contacts[0].tiktok.startsWith('http') ? talent.contacts[0].tiktok : `https://tiktok.com/@${talent.contacts[0].tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/tiktok.png"
                        alt="TikTok"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                  {talent.contacts?.[0]?.twitch && (
                    <a
                      href={talent.contacts[0].twitch.startsWith('http') ? talent.contacts[0].twitch : `https://twitch.tv/${talent.contacts[0].twitch}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/twitch.png"
                        alt="Twitch"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                  {talent.contacts?.[0]?.spotify && (
                    <a
                      href={talent.contacts[0].spotify.startsWith('http') ? talent.contacts[0].spotify : `https://open.spotify.com/artist/${talent.contacts[0].spotify}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/spotify.png"
                        alt="Spotify"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                  {talent.contacts?.[0]?.soundcloud && (
                    <a
                      href={talent.contacts[0].soundcloud.startsWith('http') ? talent.contacts[0].soundcloud : `https://soundcloud.com/${talent.contacts[0].soundcloud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/soundcloud.png"
                        alt="SoundCloud"
                        width={32}
                        height={32}
                        className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                        unoptimized
                      />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="journey">Journey</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TalentOverview talent={talent} />
          </TabsContent>

          <TabsContent value="journey">
            <TalentJourney talent={talent} />
          </TabsContent>

          <TabsContent value="contact">
            <TalentContact talent={talent} />
          </TabsContent>

          <TabsContent value="deals">
            <TalentDeals talent={talent} />
          </TabsContent>

          <TabsContent value="notes">
            <TalentNotes talent={talent} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}