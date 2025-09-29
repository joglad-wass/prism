'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import {
  Mail,
  MapPin,
  ExternalLink,
  Globe,
  MessageCircle,
} from 'lucide-react'
import { TalentDetail } from '../../types/talent'
import Image from 'next/image'

interface TalentContactProps {
  talent: TalentDetail
}

export function TalentContact({ talent }: TalentContactProps) {
  // Get the first contact record (assuming one contact per talent)
  const contact = talent.contacts?.[0]

  // Helper to get primary email from multiple sources
  const getPrimaryEmail = () => {
    return talent.PersonEmail || contact?.email || null
  }

  // Helper to get primary phone from multiple sources
  const getPrimaryPhone = () => {
    return talent.PersonMobilePhone || talent.PersonHomePhone || talent.Phone || null
  }

  // Helper to get website
  const getWebsite = () => {
    return talent.Website || contact?.website || null
  }

  // Helper to format address from various sources
  const getFormattedAddress = () => {
    // Try mailing address first
    if (talent.PersonMailingStreet || talent.PersonMailingCity) {
      const parts = [
        talent.PersonMailingStreet,
        talent.PersonMailingCity,
        talent.PersonMailingState || talent.PersonMailingStateCode,
        talent.PersonMailingPostalCode,
        talent.PersonMailingCountry
      ].filter(Boolean)
      return parts.join(', ')
    }

    // Try billing address
    if (talent.BillingStreet || talent.BillingCity) {
      const parts = [
        talent.BillingStreet,
        talent.BillingCity,
        talent.BillingState || talent.BillingStateCode,
        talent.BillingPostalCode,
        talent.BillingCountry
      ].filter(Boolean)
      return parts.join(', ')
    }

    // Fall back to contact address
    return contact?.address || null
  }

  const getSocialPlatforms = () => {
    return [
      {
        name: 'Instagram',
        handle: talent.Instagram__c || contact?.instagram,
        iconSrc: '/instagram.png',
        url: talent.Instagram__c || contact?.instagram ? `https://instagram.com/${(talent.Instagram__c || contact?.instagram || '').replace('@', '')}` : null,
      },
      {
        name: 'Twitter/X',
        handle: talent.X_Twitter__c || contact?.twitter,
        iconSrc: '/twitter.png',
        url: talent.X_Twitter__c || contact?.twitter ? `https://twitter.com/${(talent.X_Twitter__c || contact?.twitter || '').replace('@', '')}` : null,
      },
      {
        name: 'Facebook',
        handle: talent.Facebook__c || contact?.facebook,
        iconSrc: '/facebook.png',
        url: talent.Facebook__c || contact?.facebook ? `https://facebook.com/${talent.Facebook__c || contact?.facebook}` : null,
      },
      {
        name: 'YouTube',
        handle: talent.YouTube__c || contact?.youtube,
        iconSrc: '/youtube.png',
        url: talent.YouTube__c || contact?.youtube ? `https://youtube.com/c/${talent.YouTube__c || contact?.youtube}` : null,
      },
      {
        name: 'TikTok',
        handle: contact?.tiktok,
        iconSrc: '/tiktok.png',
        url: contact?.tiktok ? `https://tiktok.com/@${contact.tiktok.replace('@', '')}` : null,
      },
      {
        name: 'Twitch',
        handle: contact?.twitch,
        iconSrc: '/twitch.png',
        url: contact?.twitch ? `https://twitch.tv/${contact.twitch}` : null,
      },
      {
        name: 'Spotify',
        handle: contact?.spotify,
        iconSrc: '/spotify.png',
        url: contact?.spotify ? `https://open.spotify.com/artist/${contact.spotify}` : null,
      },
      {
        name: 'SoundCloud',
        handle: contact?.soundcloud,
        iconSrc: '/soundcloud.png',
        url: contact?.soundcloud ? `https://soundcloud.com/${contact.soundcloud}` : null,
      }
    ].filter(platform => platform.handle)
  }

  const socialPlatforms = getSocialPlatforms()
  const primaryEmail = getPrimaryEmail()
  const primaryPhone = getPrimaryPhone()
  const website = getWebsite()
  const formattedAddress = getFormattedAddress()

  return (
    <div className="space-y-6">
      {/* Primary Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Primary Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {primaryEmail && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{primaryEmail}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${primaryEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
            </div>
          )}

          {primaryPhone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{primaryPhone}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${primaryPhone}`}>Call</a>
              </Button>
            </div>
          )}

          {website && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Website</p>
                  <p className="text-sm text-muted-foreground truncate max-w-xs">{website}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          {formattedAddress && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{formattedAddress}</p>
                </div>
              </div>
            </div>
          )}

          {(!primaryEmail && !primaryPhone && !website && !formattedAddress) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No contact information available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Social Media Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Media & Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          {socialPlatforms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {socialPlatforms.map((platform) => {
                return (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {platform.iconSrc ? (
                        <Image
                          src={platform.iconSrc}
                          alt={`${platform.name} icon`}
                          width={40}
                          height={40}
                          className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                          // style={{ imageRendering: '-webkit-optimize-contrast' }}
                          unoptimized
                        />
                      ) : platform.icon ? (
                        <platform.icon className={`h-5 w-5 ${platform.color}`} />
                      ) : null}
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-sm text-muted-foreground">{platform.handle}</p>
                      </div>
                    </div>
                    {platform.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={platform.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No social media platforms available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {primaryEmail && (
              <Button variant="outline" asChild>
                <a href={`mailto:${primaryEmail}?subject=Regarding ${talent.Name}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
            )}
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
            <Button variant="outline">
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}