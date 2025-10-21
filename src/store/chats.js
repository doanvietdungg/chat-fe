import { reactive, computed } from 'vue'

const state = reactive({
  query: '',
  chats: [
    // Dữ liệu giả mô phỏng API
    { id: 'api-1', type: 'private', title: 'Nguyễn Văn A', last: 'Xin chào!', unread: 1, pinned: false, muted: false },
    { id: 'api-2', type: 'group', title: 'Dự án ABC', last: 'Cần báo cáo tiến độ', unread: 3, pinned: true, muted: false },
    // Dữ liệu cũ
    { id: 'pinned-1', type: 'channel', title: 'Announcements', last: 'Welcome to Vue Chat', unread: 2, pinned: true, muted: false, notificationLevel: 'mentions' },
    { id: 'friend-1', type: 'private', title: 'Linh', last: 'Cafe chiều nhé?', unread: 0, pinned: false, muted: false, notificationLevel: 'all' },
    { id: 'group-1', type: 'group', title: 'Team Alpha', last: 'Deploy xong rồi', unread: 5, pinned: false, muted: true, notificationLevel: 'none' },
  ],
  activeChatId: 'friend-1',
})

export function useChatsStore() {
  function setActive(id) {
    if (!id) return
    state.activeChatId = id
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.unread = 0
  }

  function createGroup(title = 'New Group') {
    const id = `group-${Date.now()}`
    state.chats.unshift({ id, type: 'group', title, last: 'Group created', unread: 0, pinned: false, muted: false, notificationLevel: 'all' })
    state.activeChatId = id
  }

  function createChannel(title = 'New Channel') {
    const id = `channel-${Date.now()}`
    state.chats.unshift({ id, type: 'channel', title, last: 'Channel created', unread: 0, pinned: true, muted: false, notificationLevel: 'mentions' })
    state.activeChatId = id
  }

  function togglePin(id) {
    if (!id) return
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.pinned = !c.pinned
  }

  function toggleMute(id) {
    if (!id) return
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.muted = !c.muted
  }

  function setNotificationLevel(id, level) {
    if (!id) return
    const c = state.chats.find(x => x && x.id === id)
    if (c) c.notificationLevel = level
  }

  function setSearch(q) {
    state.query = q
  }

  function addChat(chat) {
    if (!chat || !chat.id) return
    const existingIndex = state.chats.findIndex(c => c && c.id === chat.id)
    if (existingIndex !== -1) {
      // Update existing chat
      state.chats[existingIndex] = { ...state.chats[existingIndex], ...chat }
    } else {
      // Add new chat to the beginning
      state.chats.unshift(chat)
    }
  }

  // Replace a draft chat with a real chat from API (preserve ordering and active state)
  function replaceChat(oldId, newChat) {
    if (!oldId || !newChat || !newChat.id) return
    const index = state.chats.findIndex(c => c && c.id === oldId)
    if (index !== -1) {
      state.chats.splice(index, 1, newChat)
    } else {
      state.chats.unshift(newChat)
    }
    if (state.activeChatId === oldId) {
      state.activeChatId = newChat.id
    }
  }

  function findChatByUserId(userId) {
    return state.chats.find(chat => 
      chat && 
      chat.type === 'private' && 
      chat.participants && 
      chat.participants.includes(userId) && 
      chat.participants.includes('current_user')
    )
  }

  function setActiveChat(chatId) {
    setActive(chatId)
  }

  function removeChat(chatId) {
    const index = state.chats.findIndex(c => c && c.id === chatId)
    if (index !== -1) {
      state.chats.splice(index, 1)
      if (state.activeChatId === chatId) {
        state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null
      }
    }
  }

  const filtered = computed(() => {
    const q = state.query.trim().toLowerCase()
    const validChats = state.chats.filter(c => c && c.id && c.title)
    const items = q
      ? validChats.filter(c => c.title.toLowerCase().includes(q))
      : validChats.slice()
    // pinned first then by unread desc
    return items.sort((a, b) => ((b.pinned || 0) - (a.pinned || 0)) || ((b.unread || 0) - (a.unread || 0)))
  })

  const activeChat = computed(() => state.chats.find(c => c && c.id === state.activeChatId))

  return { 
    state, 
    filtered, 
    activeChat, 
    setActive, 
    createGroup, 
    createChannel, 
    togglePin, 
    toggleMute, 
    setNotificationLevel, 
    setSearch,
    addChat,
    replaceChat,
    findChatByUserId,
    setActiveChat,
    removeChat
  }
}


