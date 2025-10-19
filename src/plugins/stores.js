import { useUserSearchStore } from '../store/userSearch.js'
import { useContactsStore } from '../store/contacts.js'
import { useUsersStore } from '../store/users.js'
import { useAuthStore } from '../store/auth.js'

export function initializeStores() {
  // Initialize all stores
  const authStore = useAuthStore()
  const userSearchStore = useUserSearchStore()
  const contactsStore = useContactsStore()
  const usersStore = useUsersStore()

  // Initialize stores with their init methods
  // Auth store is initialized in App.vue before this
  userSearchStore.init()
  contactsStore.init()
  usersStore.init()

  return {
    authStore,
    userSearchStore,
    contactsStore,
    usersStore
  }
}