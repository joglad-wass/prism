'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Download, Loader2, Table, Database, Boxes } from 'lucide-react'

export type ExportType = 'visible' | 'all-fields' | 'complete'

interface ExportOptionsDialogProps {
  open: boolean
  onClose: () => void
  onExport: (type: ExportType) => void
  isExporting: boolean
  visibleFieldCount: number
  totalFieldCount: number
  baseEntity: 'talents' | 'brands' | 'agents' | 'deals'
}

export function ExportOptionsDialog({
  open,
  onClose,
  onExport,
  isExporting,
  visibleFieldCount,
  totalFieldCount,
  baseEntity,
}: ExportOptionsDialogProps) {
  const [selectedOption, setSelectedOption] = useState<ExportType>('visible')

  const handleExport = () => {
    onExport(selectedOption)
  }

  const entityLabel = baseEntity === 'talents' ? 'Clients' :
                     baseEntity === 'brands' ? 'Brands' :
                     baseEntity === 'agents' ? 'Agents' : 'Deals'

  const getRelatedEntities = () => {
    switch (baseEntity) {
      case 'talents':
        return 'agents, deals, brands'
      case 'brands':
        return 'owner, deals, clients'
      case 'agents':
        return 'clients, deals, brands'
      case 'deals':
        return 'brand, clients, owner'
      default:
        return 'related entities'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </DialogTitle>
          <DialogDescription>
            Choose what data to include in your CSV export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-6">
          <RadioGroup value={selectedOption} onValueChange={(value) => setSelectedOption(value as ExportType)} className="space-y-3">
            {/* Option 1: Visible Columns */}
            <Label htmlFor="visible" className="flex items-start gap-4 rounded-lg border p-5 hover:bg-accent/50 cursor-pointer transition-colors">
              <RadioGroupItem value="visible" id="visible" className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <Table className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Visible Columns Only</span>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">({visibleFieldCount} columns)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export only the currently displayed columns. Quick and focused export based on your current view.
                </p>
              </div>
            </Label>

            {/* Option 2: All Fields */}
            <Label htmlFor="all-fields" className="flex items-start gap-4 rounded-lg border p-5 hover:bg-accent/50 cursor-pointer transition-colors">
              <RadioGroupItem value="all-fields" id="all-fields" className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <Database className="h-4 w-4 shrink-0" />
                    <span className="font-medium">All {entityLabel} Fields</span>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">({totalFieldCount} columns)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export all available fields from the main {entityLabel.toLowerCase()} object. No related data included.
                </p>
              </div>
            </Label>

            {/* Option 3: Complete Export */}
            <Label htmlFor="complete" className="flex items-start gap-4 rounded-lg border p-5 hover:bg-accent/50 cursor-pointer transition-colors">
              <RadioGroupItem value="complete" id="complete" className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <Boxes className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Complete Export with Related Data</span>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">(Most comprehensive)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Export all fields from {entityLabel.toLowerCase()} plus all related data ({getRelatedEntities()}).
                </p>
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded px-2.5 py-1.5">
                  <span>⚠️</span>
                  <span>May take longer for large datasets and will trigger a database query.</span>
                </div>
              </div>
            </Label>
          </RadioGroup>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
