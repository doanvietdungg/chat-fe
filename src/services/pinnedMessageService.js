import axios from 'axios';
import { config } from '../config/env';

const PINNED_MESSAGES_API = `${config.API_BASE_URL}/api/v1/chats`;

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

/**
 * Pin a message
 * @param {string} chatId - ID of the chat
 * @param {Object} data - Pin data
 * @param {string} data.messageId - ID of the message to pin
 * @param {number} [data.displayOrder=0] - Display order of the pinned message
 * @returns {Promise<Object>} - Pinned message data
 */
export const pinMessage = async (chatId, { messageId, displayOrder = 0 }) => {
  try {
    const response = await api.post(
      `${PINNED_MESSAGES_API}/${chatId}/pinned-messages`,
      { messageId, displayOrder }
    );
    return response.data;
  } catch (error) {
    console.error('Error pinning message:', error);
    throw error;
  }
};

/**
 * Unpin a message
 * @param {string} chatId - ID of the chat
 * @param {string} messageId - ID of the message to unpin
 * @returns {Promise<Object>} - Response data
 */
export const unpinMessage = async (chatId, messageId) => {
  try {
    const response = await api.delete(
      `${PINNED_MESSAGES_API}/${chatId}/pinned-messages/${messageId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error unpinning message:', error);
    throw error;
  }
};

/**
 * Get all pinned messages for a chat
 * @param {string} chatId - ID of the chat
 * @returns {Promise<Array>} - List of pinned messages
 */
export const getPinnedMessages = async (chatId) => {
  try {
    const response = await api.get(
      `${PINNED_MESSAGES_API}/${chatId}/pinned-messages`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching pinned messages:', error);
    throw error;
  }
};

/**
 * Check if a message is pinned
 * @param {string} chatId - ID of the chat
 * @param {string} messageId - ID of the message to check
 * @returns {Promise<boolean>} - Whether the message is pinned
 */
export const isMessagePinned = async (chatId, messageId) => {
  try {
    const response = await api.get(
      `${PINNED_MESSAGES_API}/${chatId}/pinned-messages/${messageId}/is-pinned`
    );
    return response.data.isPinned;
  } catch (error) {
    console.error('Error checking if message is pinned:', error);
    throw error;
  }
};

export default {
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  isMessagePinned
};
