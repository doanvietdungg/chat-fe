import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  pinMessage as apiPinMessage,
  unpinMessage as apiUnpinMessage,
  getPinnedMessages as apiGetPinnedMessages,
  isMessagePinned as apiIsMessagePinned
} from '../services/pinnedMessageService';

export const usePinnedMessagesStore = defineStore('pinnedMessages', () => {
  const pinnedMessages = ref({}); // { chatId: [message1, message2, ...] }
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Pin a message
   * @param {string} chatId - ID of the chat
   * @param {string} messageId - ID of the message to pin
   * @param {number} [displayOrder=0] - Display order of the pinned message
   */
  const pinMessage = async (chatId, messageId, displayOrder = 0) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await apiPinMessage(chatId, { messageId, displayOrder });
      
      // Refresh the pinned messages list to ensure we have the latest data
      await fetchPinnedMessages(chatId);
      
      return response;
    } catch (err) {
      console.error('Failed to pin message:', err);
      error.value = err.response?.data?.message || 'Failed to pin message';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Unpin a message
   * @param {string} chatId - ID of the chat
   * @param {string} messageId - ID of the message to unpin
   */
  const unpinMessage = async (chatId, messageId) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await apiUnpinMessage(chatId, messageId);
      
      // Refresh the pinned messages list
      if (pinnedMessages.value[chatId]) {
        pinnedMessages.value[chatId] = pinnedMessages.value[chatId].filter(
          msg => msg.id !== messageId
        );
      }
      
      return response;
    } catch (err) {
      console.error('Failed to unpin message:', err);
      error.value = err.response?.data?.message || 'Failed to unpin message';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch all pinned messages for a chat
   * @param {string} chatId - ID of the chat
   */
  const fetchPinnedMessages = async (chatId) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await apiGetPinnedMessages(chatId);
      
      // Extract the messages from the response data array
      const messages = response.data || [];
      
      // Transform the data to match our expected format
      const formattedMessages = messages.map(item => ({
        id: item.messageId,
        chatId: item.chatId,
        text: item.message?.text || '',
        type: item.message?.type || 'TEXT',
        authorId: item.message?.authorId,
        createdAt: item.message?.createdAt,
        updatedAt: item.message?.updatedAt,
        pinnedAt: item.pinnedAt,
        pinnedBy: item.pinnedBy,
        displayOrder: item.displayOrder || 0
      }));
      
      pinnedMessages.value[chatId] = formattedMessages;
      
      return formattedMessages;
    } catch (err) {
      console.error('Failed to fetch pinned messages:', err);
      error.value = err.response?.data?.message || 'Failed to fetch pinned messages';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Check if a message is pinned
   * @param {string} chatId - ID of the chat
   * @param {string} messageId - ID of the message to check
   * @returns {boolean} - Whether the message is pinned
   */
  const isMessagePinned = (chatId, messageId) => {
    if (!pinnedMessages.value[chatId]) return false;
    return pinnedMessages.value[chatId].some(msg => msg.id === messageId);
  };

  /**
   * Get all pinned messages for a chat
   * @param {string} chatId - ID of the chat
   * @returns {Array} - List of pinned messages
   */
  const getPinnedMessages = (chatId) => {
    return pinnedMessages.value[chatId] || [];
  };
  
  // Helper to get the full message object including the original message data
  const getPinnedMessageDetails = (chatId, messageId) => {
    if (!pinnedMessages.value[chatId]) return null;
    return pinnedMessages.value[chatId].find(msg => msg.id === messageId) || null;
  };

  return {
    pinnedMessages,
    isLoading,
    error,
    pinMessage,
    unpinMessage,
    fetchPinnedMessages,
    isMessagePinned,
    getPinnedMessages,
    getPinnedMessageDetails
  };
});
