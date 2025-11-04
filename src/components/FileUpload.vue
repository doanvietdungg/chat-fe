<template>
  <div class="file-upload">
    <!-- File Input (Hidden) -->
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- Upload Button -->
    <a-button
      v-if="showButton"
      :icon="icon"
      :loading="uploading"
      :disabled="disabled"
      @click="triggerFileSelect"
      :type="buttonType"
      :size="buttonSize"
    >
      {{ buttonText }}
    </a-button>

    <!-- Drag & Drop Area -->
    <div
      v-if="showDropZone"
      :class="['drop-zone', { 'drag-over': isDragOver, 'uploading': uploading }]"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileSelect"
    >
      <div class="drop-zone-content">
        <div class="drop-zone-icon">
          <FileOutlined v-if="!uploading" />
          <LoadingOutlined v-else />
        </div>
        <div class="drop-zone-text">
          <p v-if="!uploading">{{ dropZoneText }}</p>
          <p v-else>Đang tải lên... {{ uploadProgress }}%</p>
        </div>
        <div v-if="!uploading" class="drop-zone-hint">
          Hoặc click để chọn file
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading && showProgress" class="upload-progress">
      <a-progress :percent="uploadProgress" :status="uploadStatus" />
      <div class="upload-info">
        <span>{{ currentFileName }}</span>
        <a-button size="small" @click="cancelUpload" type="text" danger>
          Hủy
        </a-button>
      </div>
    </div>

    <!-- File Preview -->
    <div v-if="selectedFiles.length > 0 && showPreview" class="file-preview">
      <div class="preview-header">
        <span>{{ selectedFiles.length }} file được chọn</span>
        <a-button size="small" @click="clearFiles" type="text">
          Xóa tất cả
        </a-button>
      </div>
      <div class="preview-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="preview-item"
        >
          <div class="preview-icon">
            <img v-if="file.preview" :src="file.preview" alt="Preview" />
            <FileOutlined v-else />
          </div>
          <div class="preview-info">
            <div class="preview-name">{{ file.name }}</div>
            <div class="preview-size">{{ formatFileSize(file.size) }}</div>
          </div>
          <a-button
            size="small"
            @click="removeFile(index)"
            type="text"
            danger
          >
            <DeleteOutlined />
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  FileOutlined, 
  LoadingOutlined, 
  DeleteOutlined 
} from '@ant-design/icons-vue'
import { formatFileSize, createFilePreview, validateFile } from '../utils/fileUtils.js'
import { message } from 'ant-design-vue'

const props = defineProps({
  // Appearance
  showButton: { type: Boolean, default: true },
  showDropZone: { type: Boolean, default: false },
  showProgress: { type: Boolean, default: true },
  showPreview: { type: Boolean, default: true },
  
  // Button props
  buttonText: { type: String, default: 'Chọn file' },
  buttonType: { type: String, default: 'default' },
  buttonSize: { type: String, default: 'default' },
  icon: { type: Object, default: () => FileOutlined },
  
  // File props
  multiple: { type: Boolean, default: false },
  accept: { type: String, default: '' },
  
  // Drop zone
  dropZoneText: { type: String, default: 'Kéo thả file vào đây' },
  
  // Validation
  maxSize: { type: Number, default: 50 * 1024 * 1024 }, // 50MB
  allowedTypes: { type: Array, default: null },
  
  // State
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits([
  'file-selected',
  'upload-start',
  'upload-progress', 
  'upload-success',
  'upload-error',
  'upload-cancel'
])

// Refs
const fileInput = ref(null)
const selectedFiles = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const currentFileName = ref('')
const isDragOver = ref(false)

// Computed
const uploadStatus = computed(() => {
  if (uploadProgress.value === 100) return 'success'
  if (uploading.value) return 'active'
  return 'normal'
})

// Methods
function triggerFileSelect() {
  if (disabled || uploading.value) return
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])
  processFiles(files)
  // Clear input to allow selecting same file again
  event.target.value = ''
}

function handleDragOver(event) {
  if (disabled || uploading.value) return
  isDragOver.value = true
}

function handleDragLeave(event) {
  isDragOver.value = false
}

function handleDrop(event) {
  if (disabled || uploading.value) return
  
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files || [])
  processFiles(files)
}

function processFiles(files) {
  if (!files || files.length === 0) return
  
  const validFiles = []
  
  for (const file of files) {
    // Validate file
    const validation = validateFile(file, {
      maxSize: props.maxSize,
      allowedTypes: props.allowedTypes
    })
    
    if (!validation.valid) {
      message.error(`${file.name}: ${validation.error}`)
      continue
    }
    
    // Create preview if image
    const preview = createFilePreview(file)
    
    validFiles.push({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview
    })
  }
  
  if (validFiles.length === 0) return
  
  // Handle multiple files
  if (props.multiple) {
    selectedFiles.value.push(...validFiles)
  } else {
    selectedFiles.value = [validFiles[0]]
  }
  
  emit('file-selected', validFiles.map(f => f.file))
}

function removeFile(index) {
  const removed = selectedFiles.value.splice(index, 1)[0]
  if (removed.preview) {
    URL.revokeObjectURL(removed.preview)
  }
}

function clearFiles() {
  selectedFiles.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  })
  selectedFiles.value = []
}

function startUpload(fileName) {
  uploading.value = true
  uploadProgress.value = 0
  currentFileName.value = fileName
  emit('upload-start', fileName)
}

function updateProgress(percent) {
  uploadProgress.value = percent
  emit('upload-progress', percent)
}

function finishUpload(success, result = null) {
  uploading.value = false
  uploadProgress.value = success ? 100 : 0
  
  if (success) {
    emit('upload-success', result)
    // Clear files after successful upload
    setTimeout(() => {
      clearFiles()
    }, 1000)
  } else {
    emit('upload-error', result)
  }
}

function cancelUpload() {
  uploading.value = false
  uploadProgress.value = 0
  currentFileName.value = ''
  emit('upload-cancel')
}

// Expose methods for parent component
defineExpose({
  triggerFileSelect,
  clearFiles,
  startUpload,
  updateProgress,
  finishUpload,
  cancelUpload,
  selectedFiles: computed(() => selectedFiles.value.map(f => f.file))
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.drop-zone:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.drop-zone.drag-over {
  border-color: #1890ff;
  background: #e6f7ff;
  transform: scale(1.02);
}

.drop-zone.uploading {
  cursor: not-allowed;
  opacity: 0.6;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-zone-icon {
  font-size: 32px;
  color: #8c8c8c;
}

.drop-zone-text p {
  margin: 0;
  font-size: 16px;
  color: #262626;
  font-weight: 500;
}

.drop-zone-hint {
  font-size: 14px;
  color: #8c8c8c;
}

.upload-progress {
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.upload-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
}

.file-preview {
  margin-top: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #d9d9d9;
  font-weight: 500;
}

.preview-list {
  max-height: 200px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.preview-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-weight: 500;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-size {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .drop-zone {
    padding: 16px;
  }
  
  .drop-zone-icon {
    font-size: 24px;
  }
  
  .drop-zone-text p {
    font-size: 14px;
  }
  
  .preview-item {
    padding: 8px 12px;
  }
  
  .preview-icon {
    width: 32px;
    height: 32px;
  }
}
</style>