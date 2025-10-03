'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '../contexts/user-context'
import { DivisionLabels, getDefaultLabelsForDivision, LabelKey } from '../config/labels'
import { getLabelMappings } from '../services/label-mappings'

export function useLabels() {
  const { user, isLoading: userLoading } = useUser()
  const [labels, setLabels] = useState<DivisionLabels>(getDefaultLabelsForDivision(null))
  const [isLoading, setIsLoading] = useState(true)

  const fetchLabels = useCallback(async (division: string | null) => {
    if (!division) {
      setLabels(getDefaultLabelsForDivision(null))
      setIsLoading(false)
      return
    }

    try {
      const mappings = await getLabelMappings(division)
      setLabels(mappings)
    } catch (error) {
      console.error('Failed to fetch label mappings, using defaults:', error)
      setLabels(getDefaultLabelsForDivision(division))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!userLoading) {
      fetchLabels(user?.division || null)
    }
  }, [user?.division, userLoading, fetchLabels])

  const getLabel = useCallback((key: LabelKey): string => {
    return labels[key] || getDefaultLabelsForDivision(null)[key]
  }, [labels])

  return {
    labels,
    getLabel,
    isLoading,
    division: user?.division || null
  }
}
