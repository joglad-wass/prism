import api from './api'
import { SearchResult, TalentClient, Brand, Agent, Deal } from '../types'

interface SearchFilters {
  costCenter?: string | null
  costCenterGroup?: string | null
}

export class SearchService {
  static async globalSearch(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const params = new URLSearchParams()
    params.append('q', query)

    if (filters?.costCenter) {
      params.append('costCenter', filters.costCenter)
    }
    if (filters?.costCenterGroup) {
      params.append('costCenterGroup', filters.costCenterGroup)
    }

    const response = await api.get(`/search?${params.toString()}`)
    const { data } = response.data

    // Flatten the response into a single array of SearchResult objects
    const results: SearchResult[] = []

    // Process talents
    if (data.talents) {
      data.talents.forEach((talent: any) => {
        results.push({
          id: talent.id,
          type: 'talent',
          title: talent.Name,
          subtitle: talent.location || talent.sport,
          category: talent.category,
          sport: talent.sport,
          team: talent.team,
          status: talent.status,
          agents: talent.agents,
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
          industry: brand.industry,
          status: brand.status,
          owner: brand.owner,
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
          email: agent.email,
          company: agent.company,
          division: agent.division,
          jobTitle: agent.title,
        })
      })
    }

    // Process deals
    if (data.deals) {
      data.deals.forEach((deal: any) => {
        results.push({
          id: deal.id,
          type: 'deal',
          title: deal.Name,
          subtitle: deal.brand?.name || 'Deal',
          category: deal.Status__c,
          status: deal.Status__c,
          stage: deal.StageName,
          amount: deal.Amount,
          brand: deal.brand,
          owner: deal.owner,
        })
      })
    }

    return results
  }

  static async getSuggestions(query?: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const params = new URLSearchParams()
    if (query) params.append('q', query)

    if (filters?.costCenter) {
      params.append('costCenter', filters.costCenter)
    }
    if (filters?.costCenterGroup) {
      params.append('costCenterGroup', filters.costCenterGroup)
    }

    const response = await api.get(`/search/suggestions?${params.toString()}`)
    const data = response.data?.data || response.data

    // If data is already an array (flat format from suggestions endpoint)
    if (Array.isArray(data)) {
      const results: SearchResult[] = []

      data.forEach((item: any) => {
        if (item.type === 'talent') {
          results.push({
            id: item.id,
            type: 'talent',
            title: item.Name,
            subtitle: item.location || item.sport,
            category: item.category,
            sport: item.sport,
            team: item.team,
            status: item.status,
            agents: item.agents,
          })
        } else if (item.type === 'brand') {
          results.push({
            id: item.id,
            type: 'brand',
            title: item.name,
            subtitle: item.industry,
            category: item.type,
            industry: item.industry,
            status: item.status,
            owner: item.owner,
          })
        } else if (item.type === 'agent') {
          results.push({
            id: item.id,
            type: 'agent',
            title: item.name,
            subtitle: item.email,
            category: item.title || 'Agent',
            email: item.email,
            company: item.company,
            division: item.division,
            jobTitle: item.title,
          })
        } else if (item.type === 'deal') {
          results.push({
            id: item.id,
            type: 'deal',
            title: item.Name,
            subtitle: item.brand?.name || 'Deal',
            category: item.Status__c,
            status: item.Status__c,
            stage: item.StageName,
            amount: item.Amount,
            brand: item.brand,
            owner: item.owner,
          })
        }
      })

      return results
    }

    // Fallback for nested format (talents, brands, agents, deals)
    if (data && typeof data === 'object') {
      const results: SearchResult[] = []

      if (data.talents) {
        data.talents.forEach((talent: any) => {
          results.push({
            id: talent.id,
            type: 'talent',
            title: talent.Name,
            subtitle: talent.location || talent.sport,
            category: talent.category,
            sport: talent.sport,
            team: talent.team,
            status: talent.status,
            agents: talent.agents,
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
            industry: brand.industry,
            status: brand.status,
            owner: brand.owner,
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
            email: agent.email,
            company: agent.company,
            division: agent.division,
            jobTitle: agent.title,
          })
        })
      }

      if (data.deals) {
        data.deals.forEach((deal: any) => {
          results.push({
            id: deal.id,
            type: 'deal',
            title: deal.Name,
            subtitle: deal.brand?.name || 'Deal',
            category: deal.Status__c,
            status: deal.Status__c,
            stage: deal.StageName,
            amount: deal.Amount,
            brand: deal.brand,
            owner: deal.owner,
          })
        })
      }

      return results
    }

    return []
  }
}