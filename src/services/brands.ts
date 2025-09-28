import api from './api'
import { Brand, PaginatedResponse, BrandFilters } from '../types'

export class BrandService {
  static async getBrands(filters: BrandFilters = {}): Promise<PaginatedResponse<Brand>> {
    const params = new URLSearchParams()

    if (filters.status) params.append('status', filters.status)
    if (filters.type) params.append('type', filters.type)
    if (filters.industry) params.append('industry', filters.industry)
    if (filters.owner) params.append('owner', filters.owner)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/brands?${params.toString()}`)
    return response.data
  }

  static async getBrand(id: string): Promise<Brand> {
    const response = await api.get(`/brands/${id}`)
    return response.data
  }

  static async createBrand(brand: Partial<Brand>): Promise<Brand> {
    const response = await api.post('/brands', brand)
    return response.data
  }

  static async updateBrand(id: string, brand: Partial<Brand>): Promise<Brand> {
    const response = await api.put(`/brands/${id}`, brand)
    return response.data
  }

  static async deleteBrand(id: string): Promise<void> {
    await api.delete(`/brands/${id}`)
  }

  // Get brand industries (for filtering)
  static async getIndustries(): Promise<string[]> {
    const response = await api.get('/brands/industries')
    return response.data
  }
}