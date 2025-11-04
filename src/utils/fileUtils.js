// File utilities for handling file uploads and type detection

// Image file extensions
const IMAGE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'
]

// Video file extensions  
const VIDEO_EXTENSIONS = [
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv'
]

// Audio file extensions
const AUDIO_EXTENSIONS = [
  'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus'
]

// Document file extensions
const DOCUMENT_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'
]

// Archive file extensions
const ARCHIVE_EXTENSIONS = [
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'
]

/**
 * Get file extension from filename
 * @param {string} filename 
 * @returns {string} extension in lowercase
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return ''
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot + 1).toLowerCase()
}

/**
 * Detect file type based on extension
 * @param {string} filename 
 * @returns {string} 'image' | 'video' | 'audio' | 'document' | 'archive' | 'file'
 */
export function detectFileType(filename) {
  const extension = getFileExtension(filename)
  
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image'
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video'
  if (AUDIO_EXTENSIONS.includes(extension)) return 'audio'
  if (DOCUMENT_EXTENSIONS.includes(extension)) return 'document'
  if (ARCHIVE_EXTENSIONS.includes(extension)) return 'archive'
  
  return 'file' // Default type
}

/**
 * Get message type for chat based on file type
 * @param {string} filename 
 * @returns {string} message type for API
 */
export function getMessageTypeFromFile(filename) {
  const fileType = detectFileType(filename)
  
  switch (fileType) {
    case 'image': return 'IMAGE'
    case 'video': return 'VIDEO'
    case 'audio': return 'AUDIO'
    case 'document': return 'DOCUMENT'
    case 'archive': return 'FILE'
    default: return 'FILE'
  }
}

/**
 * Format file size to human readable string
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file before upload
 * @param {File} file 
 * @param {Object} options - validation options
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = null, // null means all types allowed
    maxNameLength = 255
  } = options
  
  // Check file exists
  if (!file) {
    return { valid: false, error: 'Không có file được chọn' }
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File quá lớn. Kích thước tối đa: ${formatFileSize(maxSize)}` 
    }
  }
  
  // Check file name length
  if (file.name.length > maxNameLength) {
    return { 
      valid: false, 
      error: `Tên file quá dài. Tối đa ${maxNameLength} ký tự` 
    }
  }
  
  // Check allowed types
  if (allowedTypes && Array.isArray(allowedTypes)) {
    const fileType = detectFileType(file.name)
    if (!allowedTypes.includes(fileType)) {
      return { 
        valid: false, 
        error: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}` 
      }
    }
  }
  
  return { valid: true }
}

/**
 * Create file preview URL for images
 * @param {File} file 
 * @returns {string|null}
 */
export function createFilePreview(file) {
  if (!file) return null
  
  const fileType = detectFileType(file.name)
  if (fileType === 'image') {
    return URL.createObjectURL(file)
  }
  
  return null
}

/**
 * Get file icon based on type
 * @param {string} filename 
 * @returns {string} icon name or emoji
 */
export function getFileIcon(filename) {
  const fileType = detectFileType(filename)
  
  switch (fileType) {
    case 'image': return '🖼️'
    case 'video': return '🎥'
    case 'audio': return '🎵'
    case 'document': return '📄'
    case 'archive': return '📦'
    default: return '📎'
  }
}