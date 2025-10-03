import api from './api'
import { Deal, PaginatedResponse, DealFilters } from '../types'

export class DealService {
  static async getDeals(filters: DealFilters = {}): Promise<PaginatedResponse<Deal>> {
    const params = new URLSearchParams()

    if (filters.status) params.append('status', filters.status)
    if (filters.stage) params.append('stage', filters.stage)
    if (filters.brand) params.append('brand', filters.brand)
    if (filters.agent) params.append('agent', filters.agent)
    if (filters.division) params.append('division', filters.division)
    if (filters.search) params.append('search', filters.search)
    if (filters.costCenter) params.append('costCenter', filters.costCenter)
    if (filters.costCenterGroup) params.append('costCenterGroup', filters.costCenterGroup)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/deals?${params.toString()}`)
    return response.data
  }

  static async getDeal(id: string): Promise<Deal> {
    const response = await api.get(`/deals/${id}`)
    return response.data.data
  }

  static async createDeal(deal: Partial<Deal>): Promise<Deal> {
    const response = await api.post('/deals', deal)
    return response.data.data
  }

  static async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    const response = await api.put(`/deals/${id}`, deal)
    return response.data.data
  }

  static async deleteDeal(id: string): Promise<void> {
    await api.delete(`/deals/${id}`)
  }
}