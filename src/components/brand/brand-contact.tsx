'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Edit2
} from 'lucide-react'
import Image from 'next/image'

import { Brand } from '../../types'

interface BrandContactProps {
  brand: Brand
}

export function BrandContact({ brand }: BrandContactProps) {
  const contact = brand.contacts?.[0]
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState({
    email: contact?.email || '',
    phone: contact?.phone || '',
    website: contact?.website || '',
    address: contact?.address || '',
    instagram: contact?.instagram || '',
    twitter: contact?.twitter || '',
    facebook: contact?.facebook || '',
    youtube: contact?.youtube || '',
    tiktok: contact?.tiktok || '',
    twitch: contact?.twitch || '',
    spotify: contact?.spotify || '',
    soundcloud: contact?.soundcloud || ''
  })

  const handleSaveContact = async () => {
    try {
      // In a real implementation, this would call an API to update the contact
      console.log('Updating contact:', {
        brandId: brand.id,
        contactId: contact?.id,
        ...editingContact
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Failed to update contact:', error)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Primary Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => {
              setEditingContact({
                email: contact?.email || '',
                phone: contact?.phone || '',
                website: contact?.website || '',
                address: contact?.address || '',
                instagram: contact?.instagram || '',
                twitter: contact?.twitter || '',
                facebook: contact?.facebook || '',
                youtube: contact?.youtube || '',
                tiktok: contact?.tiktok || '',
                twitch: contact?.twitch || '',
                spotify: contact?.spotify || '',
                soundcloud: contact?.soundcloud || ''
              })
              setIsEditDialogOpen(true)
            }}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contact?.email ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {contact.email}
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}

          {contact?.phone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {contact.phone}
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}

          {contact?.website ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Website</span>
              </div>
              <a
                href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
              >
                {contact.website}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Website</span>
              </div>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}

          {contact?.address ? (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <span className="text-sm text-muted-foreground text-right max-w-xs">
                {contact.address}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contact && (
            contact.instagram ||
            contact.twitter ||
            contact.facebook ||
            contact.youtube ||
            contact.tiktok ||
            contact.twitch ||
            contact.spotify ||
            contact.soundcloud
          ) ? (
            <div className="grid grid-cols-2 gap-4">
              {contact.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/instagram.png"
                    alt="Instagram"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">Instagram</span>
                </a>
              )}

              {contact.twitter && (
                <a
                  href={`https://twitter.com/${contact.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/twitter.png"
                    alt="Twitter/X"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">Twitter/X</span>
                </a>
              )}

              {contact.facebook && (
                <a
                  href={`https://facebook.com/${contact.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/facebook.png"
                    alt="Facebook"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">Facebook</span>
                </a>
              )}

              {contact.youtube && (
                <a
                  href={contact.youtube.startsWith('http') ? contact.youtube : `https://youtube.com/c/${contact.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/youtube.png"
                    alt="YouTube"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">YouTube</span>
                </a>
              )}

              {contact.tiktok && (
                <a
                  href={contact.tiktok.startsWith('http') ? contact.tiktok : `https://tiktok.com/@${contact.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/tiktok.png"
                    alt="TikTok"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">TikTok</span>
                </a>
              )}

              {contact.twitch && (
                <a
                  href={contact.twitch.startsWith('http') ? contact.twitch : `https://twitch.tv/${contact.twitch}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/twitch.png"
                    alt="Twitch"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">Twitch</span>
                </a>
              )}

              {contact.spotify && (
                <a
                  href={contact.spotify.startsWith('http') ? contact.spotify : `https://open.spotify.com/artist/${contact.spotify}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/spotify.png"
                    alt="Spotify"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">Spotify</span>
                </a>
              )}

              {contact.soundcloud && (
                <a
                  href={contact.soundcloud.startsWith('http') ? contact.soundcloud : `https://soundcloud.com/${contact.soundcloud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Image
                    src="/soundcloud.png"
                    alt="SoundCloud"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
                    unoptimized
                  />
                  <span className="text-sm">SoundCloud</span>
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No social media links available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>
              Update contact details and social media links for {brand.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@brand.com"
                    value={editingContact.email}
                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={editingContact.phone}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.brand.com"
                  value={editingContact.website}
                  onChange={(e) => setEditingContact({ ...editingContact, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State ZIP"
                  value={editingContact.address}
                  onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Social Media</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={editingContact.instagram}
                    onChange={(e) => setEditingContact({ ...editingContact, instagram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={editingContact.twitter}
                    onChange={(e) => setEditingContact({ ...editingContact, twitter: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="username"
                    value={editingContact.facebook}
                    onChange={(e) => setEditingContact({ ...editingContact, facebook: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    placeholder="channel URL or username"
                    value={editingContact.youtube}
                    onChange={(e) => setEditingContact({ ...editingContact, youtube: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    placeholder="@username"
                    value={editingContact.tiktok}
                    onChange={(e) => setEditingContact({ ...editingContact, tiktok: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitch">Twitch</Label>
                  <Input
                    id="twitch"
                    placeholder="username"
                    value={editingContact.twitch}
                    onChange={(e) => setEditingContact({ ...editingContact, twitch: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotify">Spotify</Label>
                  <Input
                    id="spotify"
                    placeholder="artist URL or ID"
                    value={editingContact.spotify}
                    onChange={(e) => setEditingContact({ ...editingContact, spotify: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soundcloud">SoundCloud</Label>
                  <Input
                    id="soundcloud"
                    placeholder="username"
                    value={editingContact.soundcloud}
                    onChange={(e) => setEditingContact({ ...editingContact, soundcloud: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveContact}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
