import api from './api'
import { Agent, PaginatedResponse, AgentFilters } from '../types'

export class AgentService {
  static async getAgents(filters: AgentFilters = {}): Promise<PaginatedResponse<Agent>> {
    const params = new URLSearchParams()

    if (filters.company) params.append('company', filters.company)
    if (filters.division) params.append('division', filters.division)
    if (filters.search) params.append('search', filters.search)
    if (filters.hasDeals) params.append('hasDeals', 'true')
    if (filters.costCenter) params.append('costCenter', filters.costCenter)
    if (filters.costCenterGroup) params.append('costCenterGroup', filters.costCenterGroup)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/agents?${params.toString()}`)
    return response.data
  }

  static async getAgent(id: string): Promise<Agent> {
    const response = await api.get(`/agents/${id}`)
    // API returns { success: true, data: {...} }
    const agentData = response.data.data || response.data

    // Transform the data structure to match our Agent type
    // The API returns clients as TalentAgent[] (relationship objects with nested talentClient)
    // We need to extract the talentClient and transform deals
    if (agentData.clients && Array.isArray(agentData.clients)) {
      agentData.clients = agentData.clients.map((tc: any) => {
        const client = tc.talentClient

        // Transform deals from DealClient[] to Deal[]
        if (client.deals && Array.isArray(client.deals)) {
          client.deals = client.deals.map((dc: any) => ({
            ...dc.deal,
            // Preserve the split percentage from the relationship
            splitPercent: dc.splitPercent
          }))
        }

        return client
      })
    }

    return agentData
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