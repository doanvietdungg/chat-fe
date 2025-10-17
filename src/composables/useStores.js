// Centralized store management composable
import { useChatStore } from '../store/chat'
import { useChatsStore } from '../store/chats'
import { useMessagesStore } from '../store/messages'
import { useUIStore } from '../store/ui'

export function useStores() {
  const chatStore = useChatStore()
  const chatsStore = useChatsStore()
  const messagesStore = useMessagesStore()
  const uiStore = useUIStore()

  // Sync current chat between stores
  function setActiveChat(chatId) {
    chatsStore.setActive(chatId)
    chatStore.setCurrentChat(chatId)
    messagesStore.state.currentChatId = chatId
  }

  // Enhanced send message with all features
  function sendMessage(text, options = {}) {
    return chatStore.sendMessage(text, {
      ...options,
      replyTo: messagesStore.state.replyingTo
    })
  }

  // Quick access to common operations
  function addReaction(messageId, emoji) {
    return messagesStore.addReaction(messageId, emoji)
  }

  function replyToMessage(message) {
    messagesStore.setReplyTo(message)
  }

  function editMessage(messageId, newText) {
    return messagesStore.editMessage(messageId, newText)
  }

  function deleteMessage(messageId) {
    return messagesStore.deleteMessage(messageId)
  }

  function forwardMessages(messageIds, targetChatIds) {
    return messagesStore.forwardMessages(messageIds, targetChatIds)
  }

  function showContextMenu(event, messageId) {
    event.preventDefault()
    
    const message = messagesStore.getMessageById(messageId)
    if (!message) return

    const isOwnMessage = message.authorId === messagesStore.state.currentUser.id
    
    const options = [
      { label: 'Reply', action: 'reply', icon: 'ReplyOutlined' },
      { label: 'Forward', action: 'forward', icon: 'ShareAltOutlined' },
      { label: 'React', action: 'react', icon: 'SmileOutlined' }
    ]

    if (isOwnMessage) {
      options.push(
        { label: 'Edit', action: 'edit', icon: 'EditOutlined' },
        { label: 'Delete', action: 'delete', icon: 'DeleteOutlined', danger: true }
      )
    }

    uiStore.showContextMenu(event.clientX, event.clientY, messageId, options)
  }

  function handleContextMenuAction(action, messageId) {
    const message = messagesStore.getMessageById(messageId)
    if (!message) return

    switch (action) {
      case 'reply':
        replyToMessage(message)
        break
      case 'forward':
        uiStore.setForwardMessages([messageId])
        uiStore.openModal('forward')
        break
      case 'react':
        uiStore.openModal('reactions', { messageId })
        break
      case 'edit':
        messagesStore.startEdit(messageId)
        break
      case 'delete':
        deleteMessage(messageId)
        uiStore.addNotification({
          type: 'success',
          message: 'Message deleted',
          duration: 3000
        })
        break
    }

    uiStore.hideContextMenu()
  }

  // Search functionality
  function searchMessages(query, filters = {}) {
    uiStore.setSearching(true)
    const results = messagesStore.searchMessages(query, filters)
    uiStore.setSearchResults(results)
    return results
  }

  // Keyboard shortcuts handler
  function handleKeyboardShortcut(event) {
    return uiStore.handleKeyboardShortcut(event)
  }

  return {
    // Store instances
    chatStore,
    chatsStore,
    messagesStore,
    uiStore,

    // Enhanced operations
    setActiveChat,
    sendMessage,
    addReaction,
    replyToMessage,
    editMessage,
    deleteMessage,
    forwardMessages,
    showContextMenu,
    handleContextMenuAction,
    searchMessages,
    handleKeyboardShortcut
  }
}