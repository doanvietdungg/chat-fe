<template>
  <div v-if="files.length > 0" class="file-preview-container">
    <div class="preview-header">
      <span class="preview-title">{{ files.length }} file được chọn</span>
      <a-button size="small" type="text" @click="clearAll" class="clear-btn">
        <template #icon><CloseOutlined /></template>
        Xóa tất cả
      </a-button>
    </div>

    <div class="preview-content">
      <div class="files-list">
        <div
          v-for="(fileItem, index) in files"
          :key="index"
          class="file-item"
        >
          <!-- Image Preview -->
          <div v-if="fileItem.isImage" class="image-preview">
            <img 
              :src="fileItem.preview" 
              :alt="fileItem.file.name"
              class="preview-image"
            />
            <div class="image-overlay">
              <div class="image-info">
                <div class="file-name">{{ fileItem.file.name }}</div>
                <div class="file-size">{{ formatFileSize(fileItem.file.size) }}</div>
              </div>
              <a-button 
                size="small" 
                type="text" 
                danger 
                @click="removeFile(index)"
                class="remove-btn"
              >
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
          </div>

          <!-- File Preview -->
          <div v-else class="file-preview">
            <div class="file-icon">
              {{ getFileIcon(fileItem.file.name) }}
            </div>
            <div class="file-info">
              <div class="file-name">{{ fileItem.file.name }}</div>
              <div class="file-details">
                <span class="file-size">{{ formatFileSize(fileItem.file.size) }}</span>
                <span class="file-type">{{ getFileType(fileItem.file.name).toUpperCase() }}</span>
              </div>
            </div>
            <a-button 
              size="small" 
              type="text" 
              danger 
              @click="removeFile(index)"
              class="remove-btn"
            >
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </div>

          <!-- Upload Progress (if uploading) -->
          <div v-if="fileItem.uploading" class="upload-progress">
            <a-progress 
              :percent="fileItem.progress" 
              :status="fileItem.error ? 'exception' : 'active'"
              size="small"
            />
            <div class="progress-text">
              <span v-if="fileItem.error" class="error-text">
                Lỗi: {{ fileItem.error }}
              </span>
              <span v-else>
                Đang tải... {{ fileItem.progress }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Caption Input -->
      <div class="caption-section">
        <a-textarea
          v-model:value="caption"
          placeholder="Thêm chú thích..."
          :auto-size="{ minRows: 1, maxRows: 3 }"
          class="caption-input"
        />
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <a-button @click="clearAll" class="cancel-btn">
          Hủy
        </a-button>
        <a-button 
          type="primary" 
          @click="sendFiles"
          :loading="sending"
          :disabled="files.some(f => f.uploading) || files.length === 0"
          class="send-btn"
        >
          <template #icon><SendOutlined /></template>
          Gửi {{ files.length }} file
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  CloseOutlined, 
  DeleteOutlined, 
  SendOutlined 
} from '@ant-design/icons-vue'
import { 
  formatFileSize, 
  detectFileType, 
  getFileIcon, 
  createFilePreview 
} from '../utils/fileUtils.js'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'remove-file',
  'clear-all', 
  'send-files',
  'update-caption'
])

// State
const caption = ref('')
const sending = ref(false)

// Computed
const hasImages = computed(() => {
  return props.files.some(f => f.isImage)
})

// Methods
function removeFile(index) {
  emit('remove-file', index)
}

function clearAll() {
  caption.value = ''
  emit('clear-all')
}

function sendFiles() {
  if (props.files.length === 0) return
  
  sending.value = true
  emit('send-files', {
    files: props.files.map(f => f.file),
    caption: caption.value.trim()
  })
  
  // Reset after sending
  setTimeout(() => {
    sending.value = false
    caption.value = ''
  }, 1000)
}

function getFileType(fileName) {
  return detectFileType(fileName)
}

// Watch caption changes
import { watch } from 'vue'
watch(caption, (newCaption) => {
  emit('update-caption', newCaption)
})
</script>

<style scoped>
.file-preview-container {
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.preview-title {
  font-weight: 500;
  color: #262626;
}

.clear-btn {
  color: #ff4d4f;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.files-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  max-height: 200px;
}

.file-item {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  border: 1px solid #d9d9d9;
}

/* Image Preview */
.image-preview {
  position: relative;
  max-height: 120px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 120px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.image-info .file-name {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-info .file-size {
  font-size: 11px;
  opacity: 0.9;
}

/* File Preview */
.file-preview {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 6px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.file-details {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.remove-btn {
  flex-shrink: 0;
  color: #ff4d4f;
}

/* Upload Progress */
.upload-progress {
  padding: 8px 12px;
  background: #f5f5f5;
  border-top: 1px solid #f0f0f0;
}

.progress-text {
  margin-top: 4px;
  font-size: 12px;
  text-align: center;
}

.error-text {
  color: #ff4d4f;
}

/* Caption Section */
.caption-section {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

.caption-input {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn {
  flex: 1;
}

.send-btn {
  flex: 2;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .file-preview-container {
    max-height: 350px;
  }
  
  .files-list {
    max-height: 150px;
  }
  
  .preview-image {
    max-height: 100px;
  }
  
  .file-preview {
    padding: 10px;
  }
  
  .action-buttons {
    padding: 10px 12px;
  }
}

/* Scrollbar */
.files-list::-webkit-scrollbar {
  width: 4px;
}

.files-list::-webkit-scrollbar-track {
  background: transparent;
}

.files-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}

.files-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>