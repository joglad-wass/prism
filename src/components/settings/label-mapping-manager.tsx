'use client'

import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Save, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react'
import { getAllLabelMappings, updateLabelMappings } from '../../services/label-mappings'
import { DivisionLabels, getDefaultLabelsForDivision } from '../../config/labels'

const DIVISIONS = ['Talent', 'Marketing', 'Properties', 'Consulting', 'Brand Partnerships', 'Brillstein']

export function LabelMappingManager() {
  const [mappings, setMappings] = useState<Record<string, DivisionLabels>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadMappings()
  }, [])

  const loadMappings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const allMappings = await getAllLabelMappings()

      // Initialize with defaults for divisions that don't have custom mappings
      const initializedMappings: Record<string, DivisionLabels> = {}
      DIVISIONS.forEach(division => {
        initializedMappings[division] = allMappings[division] || getDefaultLabelsForDivision(division)
      })

      setMappings(initializedMappings)
    } catch (err) {
      console.error('Failed to load label mappings:', err)
      setError('Failed to load label mappings. Using defaults.')

      // Initialize with defaults on error
      const defaultMappings: Record<string, DivisionLabels> = {}
      DIVISIONS.forEach(division => {
        defaultMappings[division] = getDefaultLabelsForDivision(division)
      })
      setMappings(defaultMappings)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLabelChange = (division: string, labelKey: keyof DivisionLabels, value: string) => {
    setMappings(prev => ({
      ...prev,
      [division]: {
        ...prev[division],
        [labelKey]: value
      }
    }))
  }

  const handleSave = async (division: string) => {
    setIsSaving(division)
    setError(null)
    setSuccess(null)

    try {
      await updateLabelMappings({
        division,
        labels: mappings[division]
      })
      setSuccess(`Successfully updated labels for ${division}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to save label mappings:', err)
      setError(`Failed to save labels for ${division}`)
    } finally {
      setIsSaving(null)
    }
  }

  const handleReset = (division: string) => {
    setMappings(prev => ({
      ...prev,
      [division]: getDefaultLabelsForDivision(division)
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Configure custom terminology for each division. Changes will apply to all users in that division.
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DIVISIONS.map(division => (
          <Card key={division} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{division}</h3>
                {division === 'Brillstein' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Custom</span>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`${division}-agent`} className="text-xs">
                    Agent (singular)
                  </Label>
                  <Input
                    id={`${division}-agent`}
                    value={mappings[division]?.agent || ''}
                    onChange={(e) => handleLabelChange(division, 'agent', e.target.value)}
                    placeholder="Agent"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${division}-agents`} className="text-xs">
                    Agent (plural)
                  </Label>
                  <Input
                    id={`${division}-agents`}
                    value={mappings[division]?.agents || ''}
                    onChange={(e) => handleLabelChange(division, 'agents', e.target.value)}
                    placeholder="Agents"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${division}-deal`} className="text-xs">
                    Deal (singular)
                  </Label>
                  <Input
                    id={`${division}-deal`}
                    value={mappings[division]?.deal || ''}
                    onChange={(e) => handleLabelChange(division, 'deal', e.target.value)}
                    placeholder="Deal"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${division}-deals`} className="text-xs">
                    Deal (plural)
                  </Label>
                  <Input
                    id={`${division}-deals`}
                    value={mappings[division]?.deals || ''}
                    onChange={(e) => handleLabelChange(division, 'deals', e.target.value)}
                    placeholder="Deals"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleSave(division)}
                  disabled={isSaving === division}
                  size="sm"
                  className="flex-1"
                >
                  {isSaving === division ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleReset(division)}
                  variant="outline"
                  size="sm"
                  disabled={isSaving === division}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
