import api from './api'

export interface Contact {
  id: string
  email?: string
  phone?: string
  website?: string
  address?: string
  instagram?: string
  twitter?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  twitch?: string
  spotify?: string
  soundcloud?: string
  talentClientId?: string
  brandId?: string
  createdAt: string
  updatedAt: string
}

export class ContactService {
  static async createContact(contact: Partial<Contact>): Promise<Contact> {
    const response = await api.post('/contacts', contact)
    return response.data.data
  }

  static async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    const response = await api.put(`/contacts/${id}`, contact)
    return response.data.data
  }

  static async getContactByTalentId(talentId: string): Promise<Contact> {
    const response = await api.get(`/contacts/talent/${talentId}`)
    return response.data.data
  }

  static async deleteContact(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`)
  }

  static async upsertContactForTalent(talentId: string, contactData: Partial<Contact>): Promise<Contact> {
    try {
      // Try to get existing contact
      const existingContact = await this.getContactByTalentId(talentId)
      // Update if exists
      return await this.updateContact(existingContact.id, contactData)
    } catch (error) {
      // Create if doesn't exist
      return await this.createContact({
        ...contactData,
        talentClientId: talentId
      })
    }
  }
}
