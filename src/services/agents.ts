import api from './api'
import { Agent, PaginatedResponse, AgentFilters } from '../types'

export class AgentService {
  static async getAgents(filters: AgentFilters = {}): Promise<PaginatedResponse<Agent>> {
    const params = new URLSearchParams()

    if (filters.company) params.append('company', filters.company)
    if (filters.division) params.append('division', filters.division)
    if (filters.search) params.append('search', filters.search)
    if (filters.hasDeals) params.append('hasDeals', 'true')
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/agents?${params.toString()}`)
    return response.data
  }

  static async getAgent(id: string): Promise<Agent> {
    const response = await api.get(`/agents/${id}`)
    return response.data
  }

  static async createAgent(agent: Partial<Agent>): Promise<Agent> {
    const response = await api.post('/agents', agent)
    return response.data
  }

  static async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent> {
    const response = await api.put(`/agents/${id}`, agent)
    return response.data
  }

  static async deleteAgent(id: string): Promise<void> {
    await api.delete(`/agents/${id}`)
  }
}