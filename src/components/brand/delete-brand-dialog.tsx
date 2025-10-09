'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { BrandService } from '../../services/brands'
import { useDeleteBrand, useUpdateBrand } from '../../hooks/useBrands'
import { useRouter } from 'next/navigation'

interface DeleteBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandId: string
  brandName: string
}

export function DeleteBrandDialog({
  open,
  onOpenChange,
  brandId,
  brandName
}: DeleteBrandDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [associations, setAssociations] = useState<{ hasDeals: boolean; dealCount: number } | null>(null)
  const [fetchingAssociations, setFetchingAssociations] = useState(true)

  const deleteBrandMutation = useDeleteBrand()
  const updateBrandMutation = useUpdateBrand()

  useEffect(() => {
    if (open && brandId) {
      fetchAssociations()
    }
  }, [open, brandId])

  const fetchAssociations = async () => {
    try {
      setFetchingAssociations(true)
      const data = await BrandService.getBrandAssociations(brandId)
      setAssociations(data)
    } catch (error) {
      console.error('Error fetching brand associations:', error)
      toast.error('Failed to check brand associations')
      onOpenChange(false)
    } finally {
      setFetchingAssociations(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteBrandMutation.mutateAsync(brandId)
      toast.success('Brand deleted successfully')
      onOpenChange(false)
      router.push('/brands')
    } catch (error) {
      console.error('Error deleting brand:', error)
      toast.error('Failed to delete brand')
    } finally {
      setLoading(false)
    }
  }

  const handleInactivate = async () => {
    setLoading(true)
    try {
      await updateBrandMutation.mutateAsync({
        id: brandId,
        brand: { status: 'INACTIVE' }
      })
      toast.success('Brand inactivated successfully')
      onOpenChange(false)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error inactivating brand:', error)
      toast.error('Failed to inactivate brand')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingAssociations) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Checking Brand Associations</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {associations?.hasDeals ? 'Cannot Delete Brand' : 'Delete Brand'}
          </DialogTitle>
          <DialogDescription>
            {associations?.hasDeals
              ? `This brand has ${associations.dealCount} associated deal${associations.dealCount !== 1 ? 's' : ''}.`
              : 'This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {associations?.hasDeals ? (
              <>
                <strong className="text-foreground">{brandName}</strong> cannot be permanently deleted because it has associated deals.
                You can inactivate the brand instead, which will mark it as inactive but preserve all historical data.
              </>
            ) : (
              <>
                Are you sure you want to permanently delete <strong className="text-foreground">{brandName}</strong>?
                This will remove the brand and all associated data from the database.
              </>
            )}
          </p>
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
          {associations?.hasDeals ? (
            <Button
              type="button"
              variant="default"
              onClick={handleInactivate}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Inactivate Brand
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
