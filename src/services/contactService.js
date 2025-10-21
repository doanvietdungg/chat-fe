import { contactsAPI } from './api.js'

export const contactService = {
  // Get contacts with optional filters and pagination
  async getContacts({ q, type, participantIds, page = 0, size = 20, sort } = {}) {
    try {
      const params = {}
      if (q) params.q = q
      if (q) params.keyword = q
      if (type) params.type = type
      if (participantIds && participantIds.length) params.participantIds = participantIds
      if (page !== undefined) params.page = page
      if (size !== undefined) params.size = size
      if (sort) params.sort = sort

      // trace
      try { console.debug('[contactService] getContacts params:', params) } catch (_) {}

      const response = await contactsAPI.getContacts(params)
      try { console.debug('[contactService] getContacts response:', response) } catch (_) {}
      return response.data
    } catch (error) {
      try { console.error('[contactService] getContacts error:', error) } catch (_) {}
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Không thể tải danh sách liên hệ'
      throw new Error(message)
    }
  },

  // Search convenience wrapper
  async searchContacts(q, extraParams = {}) {
    try {
      const response = await contactsAPI.searchContacts(q, { keyword: q, ...extraParams })
      try { console.debug('[contactService] searchContacts q:', q, 'extra:', extraParams, 'response:', response) } catch (_) {}
      return response.data
    } catch (error) {
      try { console.error('[contactService] searchContacts error:', error) } catch (_) {}
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Không thể tìm kiếm liên hệ'
      throw new Error(message)
    }
  }
}
