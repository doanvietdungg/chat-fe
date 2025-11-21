<template>
  <div v-if="files.length > 0" class="file-preview-container">
    <div class="preview-header">
      <div class="header-content">
        <FileOutlined class="header-icon" />
        <span class="preview-title">{{ files.length }} tệp đính kèm</span>
      </div>
      <a-button size="small" type="text" @click="clearAll" class="clear-btn">
        <CloseOutlined />
      </a-button>
    </div>

    <div class="preview-content">
      <!-- Files Grid for Images -->
      <div v-if="hasImages" class="images-grid">
        <div
          v-for="(fileItem, index) in files.filter(f => f.isImage)"
          :key="index"
          class="image-item"
        >
          <div class="image-wrapper">
            <img 
              :src="fileItem.preview" 
              :alt="fileItem.file.name"
              class="preview-image"
            />
            <div class="image-actions">
              <a-button 
                size="small" 
                shape="circle"
                danger
                @click="removeFile(files.indexOf(fileItem))"
                class="remove-image-btn"
              >
                <DeleteOutlined />
              </a-button>
            </div>
            <div class="image-name">{{ fileItem.file.name }}</div>
          </div>
        </div>
      </div>

      <!-- Files List for Documents -->
      <div v-if="files.some(f => !f.isImage)" class="files-list">
        <div
          v-for="(fileItem, index) in files.filter(f => !f.isImage)"
          :key="index"
          class="file-item"
        >
          <div class="file-icon-wrapper">
            <div class="file-icon" :class="getFileTypeClass(fileItem.file.name)">
              <component :is="getFileIconComponent(fileItem.file.name)" />
            </div>
          </div>
          <div class="file-info">
            <div class="file-name">{{ fileItem.file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(fileItem.file.size) }}</span>
              <span class="file-type-badge">{{ getFileType(fileItem.file.name).toUpperCase() }}</span>
            </div>
          </div>
          <a-button 
            size="small" 
            type="text"
            shape="circle"
            @click="removeFile(files.indexOf(fileItem))"
            class="remove-file-btn"
          >
            <CloseCircleOutlined />
          </a-button>

          <!-- Upload Progress -->
          <div v-if="fileItem.uploading" class="upload-progress-bar">
            <a-progress 
              :percent="fileItem.progress" 
              :status="fileItem.error ? 'exception' : 'active'"
              :show-info="false"
              stroke-color="#1890ff"
            />
          </div>
        </div>
      </div>

      <!-- Caption Input -->
      <div class="caption-section">
        <a-input
          v-model:value="caption"
          placeholder="Thêm chú thích cho tệp đính kèm..."
          class="caption-input"
          size="large"
        >
          <template #prefix>
            <EditOutlined class="caption-icon" />
          </template>
        </a-input>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <a-button size="large" @click="clearAll" class="cancel-btn">
          <CloseOutlined /> Hủy
        </a-button>
        <a-button 
          type="primary"
          size="large"
          @click="sendFiles"
          :loading="sending"
          :disabled="files.some(f => f.uploading) || files.length === 0"
          class="send-btn"
        >
          <SendOutlined /> Gửi
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
  SendOutlined,
  FileOutlined,
  EditOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileZipOutlined,
  FileImageOutlined
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

function getFileTypeClass(fileName) {
  const type = detectFileType(fileName)
  return `file-type-${type}`
}

function getFileIconComponent(fileName) {
  const type = detectFileType(fileName)
  const iconMap = {
    'pdf': FilePdfOutlined,
    'word': FileWordOutlined,
    'excel': FileExcelOutlined,
    'powerpoint': FilePptOutlined,
    'text': FileTextOutlined,
    'zip': FileZipOutlined,
    'image': FileImageOutlined,
    'default': FileOutlined
  }
  return iconMap[type] || iconMap.default
}

// Watch caption changes
import { watch } from 'vue'
watch(caption, (newCaption) => {
  emit('update-caption', newCaption)
})
</script>

<style scoped>
.file-preview-container {
  background: linear-gradient(to bottom, #ffffff, #f8f9fa);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  max-height: 450px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 18px;
  opacity: 0.9;
}

.preview-title {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.3px;
}

.clear-btn {
  color: white !important;
  opacity: 0.9;
  transition: all 0.2s;
}

.clear-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15) !important;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

/* Images Grid */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
  max-height: 220px;
  background: #fafafa;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: scale(1.02);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.remove-image-btn {
  background: rgba(255, 77, 79, 0.95) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.remove-image-btn:hover {
  background: #ff4d4f !important;
  transform: scale(1.1);
}

.image-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  color: white;
  padding: 8px 10px 10px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Files List */
.files-list {
  padding: 12px 16px;
  overflow-y: auto;
  max-height: 200px;
  background: white;
}

.file-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  transition: all 0.2s;
}

.file-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
  transform: translateX(2px);
}

.file-icon-wrapper {
  flex-shrink: 0;
}

.file-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.file-type-pdf .file-icon {
  background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
}

.file-type-word .file-icon {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.file-type-excel .file-icon {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
}

.file-type-powerpoint .file-icon {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.file-type-zip .file-icon {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
}

.file-type-text .file-icon {
  background: linear-gradient(135deg, #607d8b 0%, #455a64 100%);
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #262626;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
  line-height: 1.3;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-size {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.file-type-badge {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.remove-file-btn {
  flex-shrink: 0;
  color: #ff4d4f !important;
  font-size: 18px;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  color: #ff7875 !important;
  background: #fff1f0 !important;
  transform: rotate(90deg);
}

.upload-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 16px 8px;
}

/* Caption Section */
.caption-section {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.caption-input {
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
}

.caption-input:focus,
.caption-input:hover {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.caption-icon {
  color: #8c8c8c;
  font-size: 16px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  border: 2px solid #d9d9d9;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background: #fff1f0;
}

.send-btn {
  flex: 2;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.send-btn:active {
  transform: translateY(0);
}

/* Scrollbar */
.files-list::-webkit-scrollbar,
.images-grid::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.files-list::-webkit-scrollbar-track,
.images-grid::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb,
.images-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb:hover,
.images-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .file-preview-container {
    max-height: 380px;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
    padding: 12px;
    max-height: 180px;
  }
  
  .files-list {
    max-height: 160px;
    padding: 8px 12px;
  }
  
  .file-item {
    padding: 12px;
    gap: 10px;
  }
  
  .file-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .action-buttons {
    padding: 12px 16px;
    gap: 10px;
  }
  
  .cancel-btn,
  .send-btn {
    height: 38px;
  }
}

/* Animations */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.file-preview-container {
  animation: slideUp 0.3s ease-out;
}

.file-item {
  animation: slideUp 0.2s ease-out;
}

.image-item {
  animation: slideUp 0.2s ease-out;
}
</style>