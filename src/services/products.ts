import api from './api'
import { Product, PaginatedResponse, ProductFilters, Schedule } from '../types'

export class ProductService {
  static async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams()

    if (filters.dealId) params.append('dealId', filters.dealId)
    if (filters.productCode) params.append('productCode', filters.productCode)
    if (filters.productName) params.append('productName', filters.productName)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/products?${params.toString()}`)
    return response.data
  }

  static async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`)
    return response.data
  }

  static async createProduct(product: Partial<Product>): Promise<Product> {
    const response = await api.post('/products', product)
    return response.data
  }

  static async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, product)
    return response.data
  }

  static async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  }

  static async getProductSchedules(id: string, page?: number, limit?: number): Promise<PaginatedResponse<Schedule>> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const response = await api.get(`/products/${id}/schedules?${params.toString()}`)
    return response.data
  }
}