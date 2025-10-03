import api from './api'
import { Schedule, PaginatedResponse, ScheduleFilters } from '../types'

export interface ScheduleAgentSplit {
  id?: string
  agentName: string
  agentId?: string | null
  splitPercent: number
  splitAmount: number
  scheduleId?: string
  createdAt?: string
  updatedAt?: string
}

export class ScheduleService {
  static async getSchedules(filters: ScheduleFilters = {}): Promise<PaginatedResponse<Schedule>> {
    const params = new URLSearchParams()

    if (filters.dealId) params.append('dealId', filters.dealId)
    if (filters.productId) params.append('productId', filters.productId)
    if (filters.scheduleStatus) params.append('scheduleStatus', filters.scheduleStatus)
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/schedules?${params.toString()}`)
    return response.data
  }

  static async getSchedule(id: string): Promise<Schedule> {
    const response = await api.get(`/schedules/${id}`)
    return response.data
  }

  static async createSchedule(schedule: Partial<Schedule>): Promise<Schedule> {
    const response = await api.post('/schedules', schedule)
    return response.data
  }

  static async updateSchedule(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
    const response = await api.put(`/schedules/${id}`, schedule)
    return response.data
  }

  static async deleteSchedule(id: string): Promise<void> {
    await api.delete(`/schedules/${id}`)
  }

  static async getSchedulesByDeal(dealId: string, page?: number, limit?: number): Promise<PaginatedResponse<Schedule>> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const response = await api.get(`/schedules/by-deal/${dealId}?${params.toString()}`)
    return response.data
  }

  static async getSchedulesByProduct(productId: string, page?: number, limit?: number): Promise<PaginatedResponse<Schedule>> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const response = await api.get(`/schedules/by-product/${productId}?${params.toString()}`)
    return response.data
  }

  // ===== Schedule Agent Splits =====

  static async getScheduleSplits(scheduleId: string): Promise<ScheduleAgentSplit[]> {
    const response = await api.get(`/schedules/${scheduleId}/splits`)
    return response.data
  }

  static async createScheduleSplit(scheduleId: string, split: Omit<ScheduleAgentSplit, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>): Promise<ScheduleAgentSplit> {
    const response = await api.post(`/schedules/${scheduleId}/splits`, split)
    return response.data
  }

  static async updateScheduleSplit(scheduleId: string, splitId: string, split: Partial<ScheduleAgentSplit>): Promise<ScheduleAgentSplit> {
    const response = await api.put(`/schedules/${scheduleId}/splits/${splitId}`, split)
    return response.data
  }

  static async deleteScheduleSplit(scheduleId: string, splitId: string): Promise<void> {
    await api.delete(`/schedules/${scheduleId}/splits/${splitId}`)
  }

  static async batchUpdateScheduleSplits(scheduleId: string, splits: Omit<ScheduleAgentSplit, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>[]): Promise<ScheduleAgentSplit[]> {
    const response = await api.put(`/schedules/${scheduleId}/splits/batch`, { splits })
    return response.data
  }
}