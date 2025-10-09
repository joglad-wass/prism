'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Loader2, FileText, FileSpreadsheet, Download } from 'lucide-react'
import { Deal } from '../../types'
import { useLabels } from '../../hooks/useLabels'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface DealExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
}

export interface ExportOptions {
  sections: {
    dealInfo: boolean
    ownerContract: boolean
    financial: boolean
    products: boolean
    payments: boolean
    notes: boolean
    attachments: boolean
    timeline: boolean
  }
  format: 'csv' | 'pdf'
  notesFilter: {
    category?: string
    status?: string
  }
  pdfOptions: {
    orientation: 'portrait' | 'landscape'
    includeBranding: boolean
  }
}

export function DealExportDialog({ open, onOpenChange, deal }: DealExportDialogProps) {
  const { labels } = useLabels()
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    sections: {
      dealInfo: true,
      ownerContract: true,
      financial: true,
      products: true,
      payments: true,
      notes: true,
      attachments: true,
      timeline: true,
    },
    format: 'pdf',
    notesFilter: {},
    pdfOptions: {
      orientation: 'portrait',
      includeBranding: true,
    },
  })

  const handleSelectAll = () => {
    setExportOptions({
      ...exportOptions,
      sections: {
        dealInfo: true,
        ownerContract: true,
        financial: true,
        products: true,
        payments: true,
        notes: true,
        attachments: true,
        timeline: true,
      },
    })
  }

  const handleDeselectAll = () => {
    setExportOptions({
      ...exportOptions,
      sections: {
        dealInfo: false,
        ownerContract: false,
        financial: false,
        products: false,
        payments: false,
        notes: false,
        attachments: false,
        timeline: false,
      },
    })
  }

  const toggleSection = (section: keyof ExportOptions['sections']) => {
    setExportOptions({
      ...exportOptions,
      sections: {
        ...exportOptions.sections,
        [section]: !exportOptions.sections[section],
      },
    })
  }

  const hasAnySelection = Object.values(exportOptions.sections).some(v => v)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/api/deals/${deal.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${deal.Name.replace(/[^a-z0-9]/gi, '_')}_export.${exportOptions.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {labels.deal}
          </DialogTitle>
          <DialogDescription>
            Select the sections you want to export and choose your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>

          {/* Export Sections */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Select Sections to Export</h3>

            <div className="space-y-3 border rounded-lg p-4">
              {/* Deal Information */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-deal-info"
                  checked={exportOptions.sections.dealInfo}
                  onCheckedChange={() => toggleSection('dealInfo')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-deal-info"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {labels.deal} Information
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basic info, stage, dates, brand, talent client, industry
                  </p>
                </div>
              </div>

              {/* Owner & Contract */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-owner"
                  checked={exportOptions.sections.ownerContract}
                  onCheckedChange={() => toggleSection('ownerContract')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-owner"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Owner & Contract Details
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Owner info, cost center, company reference, CLM number
                  </p>
                </div>
              </div>

              {/* Financial */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-financial"
                  checked={exportOptions.sections.financial}
                  onCheckedChange={() => toggleSection('financial')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-financial"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Financial Summary
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deal amount, contract amount, commission, percentages
                  </p>
                </div>
              </div>

              {/* Products & Schedules */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-products"
                  checked={exportOptions.sections.products}
                  onCheckedChange={() => toggleSection('products')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-products"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Products & Schedules
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Product details, schedule dates, payment status
                  </p>
                </div>
              </div>

              {/* Payments */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-payments"
                  checked={exportOptions.sections.payments}
                  onCheckedChange={() => toggleSection('payments')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-payments"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Payments
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Payment details, remittances, invoices
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-notes"
                  checked={exportOptions.sections.notes}
                  onCheckedChange={() => toggleSection('notes')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-notes"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Notes
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All notes with category and status
                  </p>
                  {exportOptions.sections.notes && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="space-y-1">
                        <Label htmlFor="notes-category" className="text-xs">
                          Filter by Category
                        </Label>
                        <Select
                          value={exportOptions.notesFilter.category || 'all'}
                          onValueChange={(value) =>
                            setExportOptions({
                              ...exportOptions,
                              notesFilter: {
                                ...exportOptions.notesFilter,
                                category: value === 'all' ? undefined : value,
                              },
                            })
                          }
                        >
                          <SelectTrigger id="notes-category" className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="GENERAL">General</SelectItem>
                            <SelectItem value="BUSINESS">Business</SelectItem>
                            <SelectItem value="PERSONAL">Personal</SelectItem>
                            <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                            <SelectItem value="MEETING">Meeting</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="notes-status" className="text-xs">
                          Filter by Status
                        </Label>
                        <Select
                          value={exportOptions.notesFilter.status || 'all'}
                          onValueChange={(value) =>
                            setExportOptions({
                              ...exportOptions,
                              notesFilter: {
                                ...exportOptions.notesFilter,
                                status: value === 'all' ? undefined : value,
                              },
                            })
                          }
                        >
                          <SelectTrigger id="notes-status" className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-attachments"
                  checked={exportOptions.sections.attachments}
                  onCheckedChange={() => toggleSection('attachments')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-attachments"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Attachments
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Attachment list (file names, dates, sizes)
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="section-timeline"
                  checked={exportOptions.sections.timeline}
                  onCheckedChange={() => toggleSection('timeline')}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="section-timeline"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Timeline / Activity Log
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deal history and activity changes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Export Format</h3>
            <Tabs
              value={exportOptions.format}
              onValueChange={(value) =>
                setExportOptions({
                  ...exportOptions,
                  format: value as 'csv' | 'pdf',
                })
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pdf" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF
                </TabsTrigger>
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pdf" className="space-y-3 mt-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="pdf-branding"
                    checked={exportOptions.pdfOptions.includeBranding}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        pdfOptions: {
                          ...exportOptions.pdfOptions,
                          includeBranding: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label htmlFor="pdf-branding" className="text-sm cursor-pointer">
                    Include branding and logo
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf-orientation" className="text-sm">
                    Page Orientation
                  </Label>
                  <Select
                    value={exportOptions.pdfOptions.orientation}
                    onValueChange={(value) =>
                      setExportOptions({
                        ...exportOptions,
                        pdfOptions: {
                          ...exportOptions.pdfOptions,
                          orientation: value as 'portrait' | 'landscape',
                        },
                      })
                    }
                  >
                    <SelectTrigger id="pdf-orientation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="csv" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  CSV export will create separate sheets for nested data (products, schedules,
                  payments). Best for data analysis and spreadsheet import.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!hasAnySelection || isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {exportOptions.format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
