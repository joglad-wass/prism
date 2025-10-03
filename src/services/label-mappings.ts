import { DivisionLabels } from '../config/labels'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export interface LabelMappingsResponse {
  success: boolean
  data: DivisionLabels
}

export interface AllLabelMappingsResponse {
  success: boolean
  data: Record<string, DivisionLabels>
}

export interface UpdateLabelMappingsRequest {
  division: string
  labels: DivisionLabels
}

export interface UpdateLabelMappingsResponse {
  success: boolean
  data: {
    division: string
    labels: DivisionLabels
  }
}

// Get label mappings for a specific division
export async function getLabelMappings(division: string): Promise<DivisionLabels> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Add user ID header if available
  if (typeof window !== 'undefined') {
    const userId = window.localStorage.getItem('prism-active-user-id')
    if (userId) {
      headers['x-user-id'] = userId
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/label-mappings?division=${encodeURIComponent(division)}`, {
    headers
  })

  const data: LabelMappingsResponse = await response.json()

  if (!data.success) {
    throw new Error('Failed to fetch label mappings')
  }

  return data.data
}

// Get all label mappings (admin only)
export async function getAllLabelMappings(): Promise<Record<string, DivisionLabels>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Add user ID header if available
  if (typeof window !== 'undefined') {
    const userId = window.localStorage.getItem('prism-active-user-id')
    if (userId) {
      headers['x-user-id'] = userId
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/label-mappings`, {
    headers
  })

  const data: AllLabelMappingsResponse = await response.json()

  if (!data.success) {
    throw new Error('Failed to fetch all label mappings')
  }

  return data.data
}

// Update label mappings for a division (admin only)
export async function updateLabelMappings(request: UpdateLabelMappingsRequest): Promise<UpdateLabelMappingsResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Add user ID header if available
  if (typeof window !== 'undefined') {
    const userId = window.localStorage.getItem('prism-active-user-id')
    if (userId) {
      headers['x-user-id'] = userId
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/label-mappings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(request)
  })

  const data: UpdateLabelMappingsResponse = await response.json()

  if (!data.success) {
    throw new Error('Failed to update label mappings')
  }

  return data
}

// Seed default label mappings (development only)
export async function seedLabelMappings(): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Add user ID header if available
  if (typeof window !== 'undefined') {
    const userId = window.localStorage.getItem('prism-active-user-id')
    if (userId) {
      headers['x-user-id'] = userId
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/label-mappings/seed`, {
    method: 'POST',
    headers
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error('Failed to seed label mappings')
  }
}
