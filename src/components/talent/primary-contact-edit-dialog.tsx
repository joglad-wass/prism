'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { TalentDetail } from '../../types/talent'
import { TalentService } from '../../services/talents'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PrimaryContactEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  talent: TalentDetail
}

interface ContactFormData {
  email: string
  mobilePhone: string
  homePhone: string
  website: string
}

export function PrimaryContactEditDialog({
  open,
  onOpenChange,
  talent
}: PrimaryContactEditDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    mobilePhone: '',
    homePhone: '',
    website: ''
  })

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        email: talent.PersonEmail || '',
        mobilePhone: talent.PersonMobilePhone || '',
        homePhone: talent.PersonHomePhone || '',
        website: talent.Website || ''
      })
    }
  }, [open, talent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await TalentService.updateTalent(talent.id, {
        PersonEmail: formData.email,
        PersonMobilePhone: formData.mobilePhone,
        PersonHomePhone: formData.homePhone,
        Website: formData.website
      })

      toast.success('Contact information updated successfully')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating contact information:', error)
      toast.error('Failed to update contact information')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Primary Contact Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobilePhone">Mobile Phone</Label>
            <Input
              id="mobilePhone"
              type="tel"
              value={formData.mobilePhone}
              onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homePhone">Home Phone</Label>
            <Input
              id="homePhone"
              type="tel"
              value={formData.homePhone}
              onChange={(e) => setFormData({ ...formData, homePhone: e.target.value })}
              placeholder="+1 (555) 987-6543"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
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
