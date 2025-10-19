import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContactsStore = defineStore('contacts', () => {
  // State
  const contacts = ref([])
  const isLoading = ref(false)

  // Computed
  const contactIds = computed(() => contacts.value.map(contact => contact.contactUserId))
  const contactsCount = computed(() => contacts.value.length)

  // Mock contacts data
  const mockContacts = [
    {
      id: 'contact_1',
      userId: 'current_user',
      contactUserId: '2',
      addedAt: '2024-01-10T09:00:00Z',
      label: 'Work',
      isFavorite: true
    },
    {
      id: 'contact_2',
      userId: 'current_user',
      contactUserId: '4',
      addedAt: '2024-01-12T14:30:00Z',
      label: 'Friends',
      isFavorite: false
    }
  ]

  // Actions
  const loadContacts = async () => {
    isLoading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Load from localStorage or use mock data
      const saved = localStorage.getItem('userContacts')
      if (saved) {
        contacts.value = JSON.parse(saved)
      } else {
        contacts.value = mockContacts
        saveContacts()
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
      contacts.value = mockContacts
    } finally {
      isLoading.value = false
    }
  }

  const saveContacts = () => {
    try {
      localStorage.setItem('userContacts', JSON.stringify(contacts.value))
    } catch (error) {
      console.error('Failed to save contacts:', error)
    }
  }

  const addContact = async (userId, label = '', isFavorite = false) => {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new Error('Valid user ID is required')
    }

    if (userId === 'current_user') {
      throw new Error('Cannot add yourself as a contact')
    }

    // Check if already a contact
    if (isContact(userId)) {
      throw new Error('User is already in your contacts')
    }

    // Validate label if provided
    if (label && typeof label === 'string') {
      if (label.length > 50) {
        throw new Error('Contact label is too long (maximum 50 characters)')
      }
      
      // Sanitize label
      label = label.trim().replace(/[<>\"'&]/g, '')
    }

    // Check contact limit (e.g., max 1000 contacts)
    if (contacts.value.length >= 1000) {
      throw new Error('Contact limit reached (maximum 1000 contacts)')
    }

    const newContact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user',
      contactUserId: userId,
      addedAt: new Date().toISOString(),
      label: label || '',
      isFavorite: Boolean(isFavorite)
    }

    contacts.value.push(newContact)
    saveContacts()

    return newContact
  }

  const removeContact = async (userId) => {
    const index = contacts.value.findIndex(contact => contact.contactUserId === userId)
    if (index !== -1) {
      contacts.value.splice(index, 1)
      saveContacts()
      return true
    }
    return false
  }

  const updateContact = async (userId, updates) => {
    const contact = contacts.value.find(contact => contact.contactUserId === userId)
    if (contact) {
      Object.assign(contact, updates)
      saveContacts()
      return contact
    }
    throw new Error('Contact not found')
  }

  const isContact = (userId) => {
    return contactIds.value.includes(userId)
  }

  const getContact = (userId) => {
    return contacts.value.find(contact => contact.contactUserId === userId)
  }

  const getFavoriteContacts = () => {
    return contacts.value.filter(contact => contact.isFavorite)
  }

  const getContactsByLabel = (label) => {
    return contacts.value.filter(contact => contact.label === label)
  }

  const toggleFavorite = async (userId) => {
    const contact = getContact(userId)
    if (contact) {
      contact.isFavorite = !contact.isFavorite
      saveContacts()
      return contact
    }
    throw new Error('Contact not found')
  }

  // Initialize store
  const init = () => {
    loadContacts()
  }

  return {
    // State
    contacts,
    isLoading,
    
    // Computed
    contactIds,
    contactsCount,
    
    // Actions
    loadContacts,
    addContact,
    removeContact,
    updateContact,
    isContact,
    getContact,
    getFavoriteContacts,
    getContactsByLabel,
    toggleFavorite,
    init
  }
})