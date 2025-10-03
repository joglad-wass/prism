'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { TalentDetail } from '../../types/talent'
import { TalentService } from '../../services/talents'
import { ContactService } from '../../services/contacts'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SocialMediaEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  talent: TalentDetail
}

interface SocialMediaFormData {
  instagram: string
  twitter: string
  facebook: string
  youtube: string
  tiktok: string
  twitch: string
  spotify: string
  soundcloud: string
}

export function SocialMediaEditDialog({
  open,
  onOpenChange,
  talent
}: SocialMediaEditDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const contact = talent.contacts?.[0]

  const [formData, setFormData] = useState<SocialMediaFormData>({
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    twitch: '',
    spotify: '',
    soundcloud: ''
  })

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        instagram: talent.Instagram__c || contact?.instagram || '',
        twitter: talent.X_Twitter__c || contact?.twitter || '',
        facebook: talent.Facebook__c || contact?.facebook || '',
        youtube: talent.YouTube__c || contact?.youtube || '',
        tiktok: contact?.tiktok || '',
        twitch: contact?.twitch || '',
        spotify: contact?.spotify || '',
        soundcloud: contact?.soundcloud || ''
      })
    }
  }, [open, talent, contact])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update talent fields (Instagram, Twitter, Facebook, YouTube are on TalentClient)
      await TalentService.updateTalent(talent.id, {
        Instagram__c: formData.instagram,
        X_Twitter__c: formData.twitter,
        Facebook__c: formData.facebook,
        YouTube__c: formData.youtube
      })

      // Update or create contact record for TikTok, Twitch, Spotify, SoundCloud
      await ContactService.upsertContactForTalent(talent.id, {
        instagram: formData.instagram,
        twitter: formData.twitter,
        facebook: formData.facebook,
        youtube: formData.youtube,
        tiktok: formData.tiktok,
        twitch: formData.twitch,
        spotify: formData.spotify,
        soundcloud: formData.soundcloud
      })

      toast.success('Social media platforms updated successfully')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating social media:', error)
      toast.error('Failed to update social media platforms')
    } finally {
      setLoading(false)
    }
  }

  const formatHandle = (value: string, prefix: string = '@') => {
    // Remove leading @ if user types it
    let cleaned = value.trim()
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(1)
    }
    return cleaned
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Social Media & Platforms</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md h-10">
                  @
                </span>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    instagram: formatHandle(e.target.value)
                  })}
                  placeholder="username"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md h-10">
                  @
                </span>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    twitter: formatHandle(e.target.value)
                  })}
                  placeholder="username"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="Profile name or URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="Channel name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md h-10">
                  @
                </span>
                <Input
                  id="tiktok"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({
                    ...formData,
                    tiktok: formatHandle(e.target.value)
                  })}
                  placeholder="username"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitch">Twitch</Label>
              <Input
                id="twitch"
                value={formData.twitch}
                onChange={(e) => setFormData({ ...formData, twitch: e.target.value })}
                placeholder="Channel name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spotify">Spotify</Label>
              <Input
                id="spotify"
                value={formData.spotify}
                onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                placeholder="Artist ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soundcloud">SoundCloud</Label>
              <Input
                id="soundcloud"
                value={formData.soundcloud}
                onChange={(e) => setFormData({ ...formData, soundcloud: e.target.value })}
                placeholder="Profile name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
