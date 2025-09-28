import api from './api'
import { SearchResult, TalentClient, Brand, Agent, Deal } from '../types'

export class SearchService {
  static async globalSearch(query: string): Promise<SearchResult[]> {
    const params = new URLSearchParams()
    params.append('q', query)

    const response = await api.get(`/search?${params.toString()}`)
    const { data } = response.data

    // Flatten the response into a single array of SearchResult objects
    const results: SearchResult[] = []

    // Process talents
    if (data.talents) {
      data.talents.forEach((talent: TalentClient) => {
        results.push({
          id: talent.id,
          type: 'talent',
          title: talent.name,
          subtitle: talent.location || talent.sport,
          category: talent.category,
        })
      })
    }

    // Process brands
    if (data.brands) {
      data.brands.forEach((brand: Brand) => {
        results.push({
          id: brand.id,
          type: 'brand',
          title: brand.name,
          subtitle: brand.industry,
          category: brand.type,
        })
      })
    }

    // Process agents
    if (data.agents) {
      data.agents.forEach((agent: Agent) => {
        results.push({
          id: agent.id,
          type: 'agent',
          title: agent.name,
          subtitle: agent.email,
          category: agent.title || 'Agent',
        })
      })
    }

    // Process deals
    if (data.deals) {
      data.deals.forEach((deal: Deal) => {
        results.push({
          id: deal.id,
          type: 'deal',
          title: deal.name,
          subtitle: deal.brand?.name || 'Deal',
          category: deal.status,
        })
      })
    }

    return results
  }

  static async getSuggestions(query?: string): Promise<SearchResult[]> {
    const params = new URLSearchParams()
    if (query) params.append('q', query)

    const response = await api.get(`/search/suggestions?${params.toString()}`)

    // If suggestions return the same format as global search, process them similarly
    if (response.data?.data) {
      const { data } = response.data
      const results: SearchResult[] = []

      // Process using the same logic as globalSearch
      if (data.talents) {
        data.talents.forEach((talent: TalentClient) => {
          results.push({
            id: talent.id,
            type: 'talent',
            title: talent.name,
            subtitle: talent.location || talent.sport,
            category: talent.category,
          })
        })
      }

      if (data.brands) {
        data.brands.forEach((brand: Brand) => {
          results.push({
            id: brand.id,
            type: 'brand',
            title: brand.name,
            subtitle: brand.industry,
            category: brand.type,
          })
        })
      }

      if (data.agents) {
        data.agents.forEach((agent: Agent) => {
          results.push({
            id: agent.id,
            type: 'agent',
            title: agent.name,
            subtitle: agent.email,
            category: agent.title || 'Agent',
          })
        })
      }

      if (data.deals) {
        data.deals.forEach((deal: Deal) => {
          results.push({
            id: deal.id,
            type: 'deal',
            title: deal.name,
            subtitle: deal.brand?.name || 'Deal',
            category: deal.status,
          })
        })
      }

      return results
    }

    // Fallback if response.data is already an array
    return Array.isArray(response.data) ? response.data : []
  }
}