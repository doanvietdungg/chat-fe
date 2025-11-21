import { ref, onUnmounted } from 'vue'
import { useChatStore } from '../store/chat'

export function useTypingIndicator(chatId) {
  const chatStore = useChatStore()

  let typingTimeout = null
  const isTyping = ref(false)
  const TYPING_TIMEOUT = 10000 // 10 seconds

  // Start typing
  function startTyping() {
    const currentChatId = chatId?.value || chatId
    
    if (!currentChatId || isTyping.value) {
      console.log('⏭️ Skipping startTyping:', { currentChatId, isTyping: isTyping.value })
      return
    }

    console.log("🔤 Starting typing for chat:", currentChatId)
    isTyping.value = true
    chatStore.startTyping(currentChatId)

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Auto stop typing after timeout
    typingTimeout = setTimeout(() => {
      stopTyping()
    }, TYPING_TIMEOUT)
  }

  // Stop typing
  function stopTyping() {
    if (!isTyping.value) return

    const currentChatId = chatId?.value || chatId
    console.log("🔤 Stopping typing for chat:", currentChatId)
    
    isTyping.value = false
    chatStore.stopTyping(currentChatId)

    // Clear timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      typingTimeout = null
    }
  }

  // Handle input change
  function handleInputChange(value) {
    if (value && value.trim().length > 0) {
      console.log(value);

      startTyping()
    } else {
      stopTyping()
    }
  }

  // Handle key events
  function handleKeyDown(event) {
    // Start typing on any key except Enter, Escape, Tab
    const ignoredKeys = ['Enter', 'Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta']

    if (!ignoredKeys.includes(event.key)) {
      startTyping()
    }
  }

  function handleKeyUp(event) {
    // Stop typing on Enter (message sent)
    if (event.key === 'Enter' && !event.shiftKey) {
      stopTyping()
    }
  }

  // Debounced typing handler
  let debounceTimeout = null
  const DEBOUNCE_DELAY = 10000 // 2 seconds - longer delay for better UX

  function handleTypingDebounced() {
    // Clear existing debounce
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // Start typing immediately
    startTyping()

    // Set debounce to stop typing after user stops typing for 2 seconds
    debounceTimeout = setTimeout(() => {
      stopTyping()
    }, DEBOUNCE_DELAY)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopTyping()

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
  })

  return {
    isTyping,
    startTyping,
    stopTyping,
    handleInputChange,
    handleKeyDown,
    handleKeyUp,
    handleTypingDebounced
  }
}