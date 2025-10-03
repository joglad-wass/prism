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

interface AddressEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  talent: TalentDetail
  addressType: 'billing' | 'shipping'
}

interface AddressFormData {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export function AddressEditDialog({
  open,
  onOpenChange,
  talent,
  addressType
}: AddressEditDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  })

  // Initialize form data when dialog opens or address type changes
  useEffect(() => {
    if (open) {
      if (addressType === 'billing') {
        setFormData({
          street: talent.BillingStreet || '',
          city: talent.BillingCity || '',
          state: talent.BillingState || talent.BillingStateCode || '',
          postalCode: talent.BillingPostalCode || '',
          country: talent.BillingCountry || talent.BillingCountryCode || ''
        })
      } else {
        setFormData({
          street: talent.ShippingStreet || '',
          city: talent.ShippingCity || '',
          state: talent.ShippingState || talent.ShippingStateCode || '',
          postalCode: talent.ShippingPostalCode || '',
          country: talent.ShippingCountry || talent.ShippingCountryCode || ''
        })
      }
    }
  }, [open, addressType, talent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build update payload based on address type
      const updateData: any = {}

      if (addressType === 'billing') {
        updateData.BillingStreet = formData.street
        updateData.BillingCity = formData.city
        updateData.BillingState = formData.state
        updateData.BillingPostalCode = formData.postalCode
        updateData.BillingCountry = formData.country
      } else {
        updateData.ShippingStreet = formData.street
        updateData.ShippingCity = formData.city
        updateData.ShippingState = formData.state
        updateData.ShippingPostalCode = formData.postalCode
        updateData.ShippingCountry = formData.country
      }

      await TalentService.updateTalent(talent.id, updateData)

      toast.success(`${addressType === 'billing' ? 'Billing' : 'Shipping'} address updated successfully`)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating address:', error)
      toast.error('Failed to update address')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = () => {
    // Copy from the opposite address type
    if (addressType === 'billing') {
      setFormData({
        street: talent.ShippingStreet || '',
        city: talent.ShippingCity || '',
        state: talent.ShippingState || talent.ShippingStateCode || '',
        postalCode: talent.ShippingPostalCode || '',
        country: talent.ShippingCountry || talent.ShippingCountryCode || ''
      })
      toast.success('Copied from shipping address')
    } else {
      setFormData({
        street: talent.BillingStreet || '',
        city: talent.BillingCity || '',
        state: talent.BillingState || talent.BillingStateCode || '',
        postalCode: talent.BillingPostalCode || '',
        country: talent.BillingCountry || talent.BillingCountryCode || ''
      })
      toast.success('Copied from billing address')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Edit {addressType === 'billing' ? 'Billing' : 'Shipping'} Address
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Los Angeles"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="CA"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="90001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="USA"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              disabled={loading}
            >
              Copy from {addressType === 'billing' ? 'Shipping' : 'Billing'}
            </Button>
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
