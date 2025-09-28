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

  const getSocialPlatforms = () => {
    if (!contact) return []

    return [
      {
        name: 'Instagram',
        handle: contact.instagram,
        iconSrc: '/instagram.png',
        url: contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : null,
      },
      {
        name: 'Twitter/X',
        handle: contact.twitter,
        iconSrc: '/twitter.png',
        url: contact.twitter ? `https://twitter.com/${contact.twitter.replace('@', '')}` : null,
      },
      {
        name: 'Facebook',
        handle: contact.facebook,
        iconSrc: '/facebook.png',
        url: contact.facebook ? `https://facebook.com/${contact.facebook}` : null,
      },
      {
        name: 'YouTube',
        handle: contact.youtube,
        iconSrc: '/youtube.png',
        url: contact.youtube ? `https://youtube.com/c/${contact.youtube}` : null,
      },
      {
        name: 'TikTok',
        handle: contact.tiktok,
        iconSrc: '/tiktok.png',
        url: contact.tiktok ? `https://tiktok.com/@${contact.tiktok.replace('@', '')}` : null,
      },
      {
        name: 'Twitch',
        handle: contact.twitch,
        iconSrc: '/twitch.png',
        url: contact.twitch ? `https://twitch.tv/${contact.twitch}` : null,
      },
      {
        name: 'Spotify',
        handle: contact.spotify,
        iconSrc: '/spotify.png',
        url: contact.spotify ? `https://open.spotify.com/artist/${contact.spotify}` : null,
      },
      {
        name: 'SoundCloud',
        handle: contact.soundcloud,
        iconSrc: '/soundcloud.png',
        url: contact.soundcloud ? `https://soundcloud.com/${contact.soundcloud}` : null,
      }
    ].filter(platform => platform.handle)
  }

  const socialPlatforms = getSocialPlatforms()

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
          {contact?.email && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
            </div>
          )}

          {contact?.address && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{contact.address}</p>
                </div>
              </div>
            </div>
          )}

          {(!contact?.email && !contact?.address) && (
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
            {contact?.email && (
              <Button variant="outline" asChild>
                <a href={`mailto:${contact.email}?subject=Regarding ${talent.name}`}>
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