import { ref, computed } from 'vue'
import { useContactsStore } from '../store/contacts.js'

export function useContacts() {
  const contactsStore = useContactsStore()
  
  const isLoading = ref(false)
  const error = ref(null)

  const contacts = computed(() => contactsStore.contacts)
  const contactIds = computed(() => contactsStore.contactIds)
  const contactsCount = computed(() => contactsStore.contactsCount)

  const addContact = async (userId, label = '', isFavorite = false) => {
    isLoading.value = true
    error.value = null

    try {
      const newContact = await contactsStore.addContact(userId, label, isFavorite)
      return newContact
    } catch (err) {
      error.value = err.message
      console.error('Failed to add contact:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeContact = async (userId) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await contactsStore.removeContact(userId)
      return result
    } catch (err) {
      error.value = err.message
      console.error('Failed to remove contact:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateContact = async (userId, updates) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedContact = await contactsStore.updateContact(userId, updates)
      return updatedContact
    } catch (err) {
      error.value = err.message
      console.error('Failed to update contact:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const isContact = (userId) => {
    return contactsStore.isContact(userId)
  }

  const getContact = (userId) => {
    return contactsStore.getContact(userId)
  }

  const toggleFavorite = async (userId) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedContact = await contactsStore.toggleFavorite(userId)
      return updatedContact
    } catch (err) {
      error.value = err.message
      console.error('Failed to toggle favorite:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getFavoriteContacts = () => {
    return contactsStore.getFavoriteContacts()
  }

  const getContactsByLabel = (label) => {
    return contactsStore.getContactsByLabel(label)
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize contacts store
  const init = () => {
    contactsStore.init()
  }

  return {
    // State
    isLoading,
    error,
    contacts,
    contactIds,
    contactsCount,
    
    // Actions
    addContact,
    removeContact,
    updateContact,
    isContact,
    getContact,
    toggleFavorite,
    getFavoriteContacts,
    getContactsByLabel,
    clearError,
    init
  }
}