import { fileAPI } from './api.js'
import { detectFileType, getMessageTypeFromFile, validateFile } from '../utils/fileUtils.js'

/**
 * Service for handling file uploads and sending file messages
 */
export const fileMessageService = {
  /**
   * Upload file and prepare message data (does not send message)
   * @param {File} file - File to upload
   * @param {string} chatId - Chat ID for message context
   * @param {Function} onProgress - Progress callback (percent)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result with message data
   */
  async uploadFile(file, chatId, onProgress = null, options = {}) {
    const {
      caption = '', // Optional caption text
      validateOptions = {},
      recipientId = null
    } = options

    try {
      // 1. Validate file
      const validation = validateFile(file, validateOptions)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      console.log('📎 Starting file upload:', {
        name: file.name,
        size: file.size,
        type: file.type,
        chatId
      })

      // 2. Upload file to server
      const uploadResponse = await fileAPI.uploadFile(file, onProgress)
      
      console.log('📎 Upload response:', uploadResponse.data)
      
      // Handle nested response structure: { data: { id, name, url, ... } }
      const fileData = uploadResponse.data?.data || uploadResponse.data
      
      if (!fileData || !fileData.id) {
        throw new Error('Invalid upload response - missing file data')
      }

      // 3. Determine message type based on file
      const messageType = getMessageTypeFromFile(file.name)
      const fileType = detectFileType(file.name)

      console.log('📎 File uploaded successfully:', {
        fileId: fileData.id,
        fileName: fileData.name,
        fileUrl: fileData.url,
        messageType,
        fileType
      })

      // 4. Prepare message data
      const messageData = {
        chatId,
        recipientId,
        type: messageType,
        text: caption || '', // Caption text (can be empty)
        fileId: fileData.id,
        fileName: fileData.name,
        fileUrl: fileData.url,
        fileSize: fileData.size,
        contentType: fileData.contentType
      }

      return {
        success: true,
        fileData,
        messageData,
        messageType,
        fileType
      }

    } catch (error) {
      console.error('📎 File upload failed:', error)
      throw error
    }
  },

  /**
   * Upload multiple files
   * @param {FileList|Array} files - Files to upload
   * @param {string} chatId - Chat ID
   * @param {Function} onProgress - Progress callback
   * @param {Object} options - Options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleFiles(files, chatId, onProgress = null, options = {}) {
    const fileArray = Array.from(files)
    const results = []
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      
      try {
        const progressCallback = onProgress ? 
          (percent) => onProgress(i, percent, fileArray.length) : 
          null

        const result = await this.uploadFile(file, chatId, progressCallback, options)
        results.push(result)
        
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          fileName: file.name
        })
      }
    }
    
    return results
  },

  /**
   * Create file message data for optimistic UI update
   * @param {File} file - Original file
   * @param {string} chatId - Chat ID
   * @param {string} caption - Caption text
   * @returns {Object} Temporary message data
   */
  createOptimisticFileMessage(file, chatId, caption = '') {
    const messageType = getMessageTypeFromFile(file.name)
    const fileType = detectFileType(file.name)
    
    return {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      type: messageType,
      text: caption,
      authorId: 'current_user', // Will be replaced with actual user ID
      timestamp: new Date().toISOString(),
      uploading: true,
      uploadProgress: 0,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        preview: fileType === 'image' ? URL.createObjectURL(file) : null
      }
    }
  },

  /**
   * Update optimistic message with upload result
   * @param {Object} optimisticMessage - Temporary message
   * @param {Object} uploadResult - Upload result
   * @returns {Object} Updated message
   */
  updateOptimisticMessage(optimisticMessage, uploadResult) {
    if (uploadResult.success) {
      return {
        ...optimisticMessage,
        uploading: false,
        uploadProgress: 100,
        fileId: uploadResult.fileData.id,
        fileName: uploadResult.fileData.name,
        fileUrl: uploadResult.fileData.url,
        fileSize: uploadResult.fileData.size,
        contentType: uploadResult.fileData.contentType,
        file: {
          ...optimisticMessage.file,
          id: uploadResult.fileData.id,
          url: uploadResult.fileData.url
        }
      }
    } else {
      return {
        ...optimisticMessage,
        uploading: false,
        uploadFailed: true,
        error: uploadResult.error
      }
    }
  }
}