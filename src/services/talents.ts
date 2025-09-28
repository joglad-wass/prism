import api from './api'
import { TalentClient, PaginatedResponse, TalentFilters } from '../types'

export class TalentService {
  static async getTalents(filters: TalentFilters = {}): Promise<PaginatedResponse<TalentClient>> {
    const params = new URLSearchParams()

    if (filters.status) params.append('status', filters.status)
    if (filters.category) params.append('category', filters.category)
    if (filters.isNil !== undefined) params.append('isNil', filters.isNil.toString())
    if (filters.isWomen !== undefined) params.append('isWomen', filters.isWomen.toString())
    if (filters.agent) params.append('agent', filters.agent)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/talents?${params.toString()}`)
    return response.data
  }

  static async getTalent(id: string): Promise<TalentClient> {
    const response = await api.get(`/talents/${id}`)
    return response.data
  }

  static async createTalent(talent: Partial<TalentClient>): Promise<TalentClient> {
    const response = await api.post('/talents', talent)
    return response.data
  }

  static async updateTalent(id: string, talent: Partial<TalentClient>): Promise<TalentClient> {
    const response = await api.put(`/talents/${id}`, talent)
    return response.data
  }

  static async deleteTalent(id: string): Promise<void> {
    await api.delete(`/talents/${id}`)
  }

  // Get talent categories (for filtering)
  static async getCategories(): Promise<string[]> {
    const response = await api.get('/talents/categories')
    return response.data
  }
}