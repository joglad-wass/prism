import { TalentDetail, ApiResponse } from '../types/talent'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class TalentService {
  static async getTalentById(id: string): Promise<TalentDetail> {
    const response = await fetch(`${API_BASE_URL}/api/talents/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Talent not found')
      }
      throw new Error(`Failed to fetch talent: ${response.statusText}`)
    }

    const result: ApiResponse<TalentDetail> = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch talent')
    }

    return result.data
  }

  static async updateTalent(id: string, data: Partial<TalentDetail>): Promise<TalentDetail> {
    const response = await fetch(`${API_BASE_URL}/api/talents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Talent not found')
      }
      throw new Error(`Failed to update talent: ${response.statusText}`)
    }

    const result: ApiResponse<TalentDetail> = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to update talent')
    }

    return result.data
  }
}