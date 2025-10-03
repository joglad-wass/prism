import api from './api'
import { Payment } from '../types'

export class PaymentService {
  static async getPaymentsByDeal(dealId: string): Promise<Payment[]> {
    const response = await api.get(`/deals/${dealId}/payments`)
    return response.data.data
  }

  static async getPayment(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`)
    return response.data.data
  }
}
