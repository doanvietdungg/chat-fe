<template>
  <div class="file-upload-demo">
    <a-card title="File Upload Demo" style="margin: 20px;">
      <div class="demo-section">
        <h3>1. Basic File Upload</h3>
        <FileUpload
          @file-selected="handleFileSelected"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
          :show-preview="true"
          :multiple="false"
        />
      </div>

      <div class="demo-section">
        <h3>2. Drag & Drop Zone</h3>
        <FileUpload
          :show-button="false"
          :show-drop-zone="true"
          :multiple="true"
          drop-zone-text="Kéo thả nhiều file vào đây"
          @file-selected="handleMultipleFiles"
        />
      </div>

      <div class="demo-section">
        <h3>3. Image Only Upload</h3>
        <FileUpload
          :allowed-types="['image']"
          accept="image/*"
          button-text="Chọn hình ảnh"
          @file-selected="handleImageSelected"
        />
      </div>

      <div class="demo-section">
        <h3>4. File Utils Demo</h3>
        <div class="utils-demo">
          <a-input 
            v-model:value="testFileName" 
            placeholder="Nhập tên file để test (vd: photo.jpg)"
            style="margin-bottom: 10px;"
          />
          <div v-if="testFileName" class="file-info">
            <p><strong>File:</strong> {{ testFileName }}</p>
            <p><strong>Extension:</strong> {{ getFileExtension(testFileName) }}</p>
            <p><strong>Type:</strong> {{ detectFileType(testFileName) }}</p>
            <p><strong>Message Type:</strong> {{ getMessageTypeFromFile(testFileName) }}</p>
            <p><strong>Icon:</strong> {{ getFileIcon(testFileName) }}</p>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>5. Upload Results</h3>
        <div v-if="uploadResults.length > 0" class="results">
          <a-list :data-source="uploadResults" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <span :style="{ color: item.success ? 'green' : 'red' }">
                      {{ item.success ? '✅' : '❌' }} {{ item.fileName }}
                    </span>
                  </template>
                  <template #description>
                    <div v-if="item.success">
                      <p>File ID: {{ item.fileData?.id }}</p>
                      <p>URL: {{ item.fileData?.url }}</p>
                      <p>Size: {{ formatFileSize(item.fileData?.size || 0) }}</p>
                      <p>Type: {{ item.messageType }}</p>
                    </div>
                    <div v-else>
                      <p style="color: red;">Error: {{ item.error }}</p>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
        <a-empty v-else description="Chưa có file nào được upload" />
      </div>

      <div class="demo-section">
        <h3>6. Manual Upload Test</h3>
        <a-space>
          <a-button @click="testUpload" :loading="testing">
            Test Upload API
          </a-button>
          <a-button @click="clearResults" type="default">
            Clear Results
          </a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import FileUpload from './FileUpload.vue'
import { fileMessageService } from '../services/fileMessageService.js'
import { 
  getFileExtension, 
  detectFileType, 
  getMessageTypeFromFile, 
  getFileIcon,
  formatFileSize 
} from '../utils/fileUtils.js'

// Reactive data
const testFileName = ref('photo.jpg')
const uploadResults = ref([])
const testing = ref(false)

// Event handlers
function handleFileSelected(files) {
  console.log('Files selected:', files)
  message.info(`Đã chọn ${files.length} file`)
}

function handleMultipleFiles(files) {
  console.log('Multiple files selected:', files)
  message.info(`Đã chọn ${files.length} file để upload`)
  
  // Auto upload multiple files
  uploadMultipleFiles(files)
}

function handleImageSelected(files) {
  console.log('Images selected:', files)
  message.info(`Đã chọn ${files.length} hình ảnh`)
}

function handleUploadSuccess(result) {
  console.log('Upload success:', result)
  uploadResults.value.unshift({
    success: true,
    fileName: result.fileData?.name || 'Unknown',
    fileData: result.fileData,
    messageType: result.messageType,
    fileType: result.fileType
  })
  message.success('Upload thành công!')
}

function handleUploadError(error) {
  console.error('Upload error:', error)
  uploadResults.value.unshift({
    success: false,
    fileName: error.fileName || 'Unknown',
    error: error.message || 'Unknown error'
  })
  message.error('Upload thất bại!')
}

// Upload multiple files
async function uploadMultipleFiles(files) {
  for (const file of files) {
    try {
      const result = await fileMessageService.uploadFile(
        file,
        'demo-chat',
        (progress) => {
          console.log(`Upload progress for ${file.name}: ${progress}%`)
        }
      )
      
      handleUploadSuccess(result)
      
    } catch (error) {
      handleUploadError({ fileName: file.name, message: error.message })
    }
  }
}

// Test upload with dummy file
function testUpload() {
  testing.value = true
  
  // Create a dummy text file for testing
  const dummyContent = `Test file created at ${new Date().toISOString()}\n\nThis is a test file for upload demo.`
  const blob = new Blob([dummyContent], { type: 'text/plain' })
  const file = new File([blob], `test-${Date.now()}.txt`, { type: 'text/plain' })
  
  fileMessageService.uploadFile(file, 'demo-chat')
    .then(handleUploadSuccess)
    .catch((error) => handleUploadError({ fileName: file.name, message: error.message }))
    .finally(() => {
      testing.value = false
    })
}

function clearResults() {
  uploadResults.value = []
  message.info('Đã xóa kết quả')
}
</script>

<style scoped>
.file-upload-demo {
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.demo-section h3 {
  margin-top: 0;
  color: #1890ff;
}

.utils-demo {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.file-info {
  margin-top: 10px;
}

.file-info p {
  margin: 5px 0;
  font-family: monospace;
}

.results {
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border-radius: 6px;
  padding: 10px;
}
</style>