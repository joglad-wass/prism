'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import {
  Mail,
  MapPin,
  ExternalLink,
  Globe,
  MessageCircle,
  Pencil,
  Building2,
  Package,
} from 'lucide-react'
import { TalentDetail } from '../../types/talent'
import Image from 'next/image'
import { useState } from 'react'
import { AddressEditDialog } from './address-edit-dialog'
import { PrimaryContactEditDialog } from './primary-contact-edit-dialog'
import { SocialMediaEditDialog } from './social-media-edit-dialog'

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

  // Helper to format billing address
  const getBillingAddress = () => {
    if (talent.BillingStreet || talent.BillingCity) {
      return {
        street: talent.BillingStreet || '',
        city: talent.BillingCity || '',
        state: talent.BillingState || talent.BillingStateCode || '',
        postalCode: talent.BillingPostalCode || '',
        country: talent.BillingCountry || talent.BillingCountryCode || '',
        formatted: [
          talent.BillingStreet,
          talent.BillingCity,
          talent.BillingState || talent.BillingStateCode,
          talent.BillingPostalCode,
          talent.BillingCountry || talent.BillingCountryCode
        ].filter(Boolean).join(', ')
      }
    }
    return null
  }

  // Helper to format shipping address
  const getShippingAddress = () => {
    if (talent.ShippingStreet || talent.ShippingCity) {
      return {
        street: talent.ShippingStreet || '',
        city: talent.ShippingCity || '',
        state: talent.ShippingState || talent.ShippingStateCode || '',
        postalCode: talent.ShippingPostalCode || '',
        country: talent.ShippingCountry || talent.ShippingCountryCode || '',
        formatted: [
          talent.ShippingStreet,
          talent.ShippingCity,
          talent.ShippingState || talent.ShippingStateCode,
          talent.ShippingPostalCode,
          talent.ShippingCountry || talent.ShippingCountryCode
        ].filter(Boolean).join(', ')
      }
    }
    return null
  }

  // Helper to build social media URL - handles both full URLs and usernames
  const buildSocialUrl = (value: string | undefined, baseUrl: string, prefix: string = '') => {
    if (!value) return null

    // If already a full URL, return as-is
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value
    }

    // Otherwise, build the URL
    const cleanValue = value.replace('@', '')
    return `${baseUrl}${prefix}${cleanValue}`
  }

  const getSocialPlatforms = () => {
    return [
      {
        name: 'Instagram',
        handle: talent.Instagram__c || contact?.instagram,
        iconSrc: '/instagram.png',
        url: buildSocialUrl(
          talent.Instagram__c || contact?.instagram,
          'https://instagram.com/',
          ''
        ),
      },
      {
        name: 'Twitter/X',
        handle: talent.X_Twitter__c || contact?.twitter,
        iconSrc: '/twitter.png',
        url: buildSocialUrl(
          talent.X_Twitter__c || contact?.twitter,
          'https://twitter.com/',
          ''
        ),
      },
      {
        name: 'Facebook',
        handle: talent.Facebook__c || contact?.facebook,
        iconSrc: '/facebook.png',
        url: buildSocialUrl(
          talent.Facebook__c || contact?.facebook,
          'https://facebook.com/',
          ''
        ),
      },
      {
        name: 'YouTube',
        handle: talent.YouTube__c || contact?.youtube,
        iconSrc: '/youtube.png',
        url: buildSocialUrl(
          talent.YouTube__c || contact?.youtube,
          'https://youtube.com/c/',
          ''
        ),
      },
      {
        name: 'TikTok',
        handle: contact?.tiktok,
        iconSrc: '/tiktok.png',
        url: buildSocialUrl(
          contact?.tiktok,
          'https://tiktok.com/',
          '@'
        ),
      },
      {
        name: 'Twitch',
        handle: contact?.twitch,
        iconSrc: '/twitch.png',
        url: buildSocialUrl(
          contact?.twitch,
          'https://twitch.tv/',
          ''
        ),
      },
      {
        name: 'Spotify',
        handle: contact?.spotify,
        iconSrc: '/spotify.png',
        url: buildSocialUrl(
          contact?.spotify,
          'https://open.spotify.com/artist/',
          ''
        ),
      },
      {
        name: 'SoundCloud',
        handle: contact?.soundcloud,
        iconSrc: '/soundcloud.png',
        url: buildSocialUrl(
          contact?.soundcloud,
          'https://soundcloud.com/',
          ''
        ),
      }
    ].filter(platform => platform.handle)
  }

  const socialPlatforms = getSocialPlatforms()
  const primaryEmail = getPrimaryEmail()
  const primaryPhone = getPrimaryPhone()
  const website = getWebsite()
  const billingAddress = getBillingAddress()
  const shippingAddress = getShippingAddress()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editAddressType, setEditAddressType] = useState<'billing' | 'shipping'>('billing')
  const [editContactDialogOpen, setEditContactDialogOpen] = useState(false)
  const [editSocialMediaDialogOpen, setEditSocialMediaDialogOpen] = useState(false)

  const handleEditAddress = (type: 'billing' | 'shipping') => {
    setEditAddressType(type)
    setEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Primary Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Primary Contact Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditContactDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {primaryEmail || '—'}
                </p>
              </div>
            </div>
            {primaryEmail && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${primaryEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {primaryPhone || '—'}
                </p>
              </div>
            </div>
            {primaryPhone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${primaryPhone}`}>Call</a>
              </Button>
            )}
          </div>

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
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Billing Address
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditAddress('billing')}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {billingAddress ? (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="space-y-1">
                {billingAddress.street && (
                  <p className="text-sm">{billingAddress.street}</p>
                )}
                <p className="text-sm">
                  {[
                    billingAddress.city,
                    billingAddress.state,
                    billingAddress.postalCode
                  ].filter(Boolean).join(', ')}
                </p>
                {billingAddress.country && (
                  <p className="text-sm">{billingAddress.country}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">No billing address available</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditAddress('billing')}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Add Billing Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Shipping Address
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditAddress('shipping')}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shippingAddress ? (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="space-y-1">
                {shippingAddress.street && (
                  <p className="text-sm">{shippingAddress.street}</p>
                )}
                <p className="text-sm">
                  {[
                    shippingAddress.city,
                    shippingAddress.state,
                    shippingAddress.postalCode
                  ].filter(Boolean).join(', ')}
                </p>
                {shippingAddress.country && (
                  <p className="text-sm">{shippingAddress.country}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">No shipping address available</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditAddress('shipping')}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Add Shipping Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Platforms */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Media & Platforms
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditSocialMediaDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
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

      {/* Contact Actions
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
      </Card> */}

      {/* Primary Contact Edit Dialog */}
      <PrimaryContactEditDialog
        open={editContactDialogOpen}
        onOpenChange={setEditContactDialogOpen}
        talent={talent}
      />

      {/* Social Media Edit Dialog */}
      <SocialMediaEditDialog
        open={editSocialMediaDialogOpen}
        onOpenChange={setEditSocialMediaDialogOpen}
        talent={talent}
      />

      {/* Address Edit Dialog */}
      <AddressEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        talent={talent}
        addressType={editAddressType}
      />
    </div>
  )
}