<template>
  <a-modal
    v-model:open="visible"
    title="Media Gallery"
    :width="800"
    :footer="null"
    class="media-gallery-modal"
  >
    <!-- Tabs -->
    <a-tabs v-model:activeKey="activeTab" class="media-tabs">
      <a-tab-pane key="photos" tab="Photos">
        <div class="media-grid">
          <div 
            v-for="photo in photos" 
            :key="photo.id"
            class="media-item photo-item"
            @click="openLightbox(photo, 'photo')"
          >
            <img :src="photo.thumbnail" :alt="photo.name" />
            <div class="media-overlay">
              <div class="media-info">
                <span class="media-date">{{ formatDate(photo.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="videos" tab="Videos">
        <div class="media-grid">
          <div 
            v-for="video in videos" 
            :key="video.id"
            class="media-item video-item"
            @click="openLightbox(video, 'video')"
          >
            <div class="video-thumbnail">
              <img :src="video.thumbnail" :alt="video.name" />
              <div class="play-button">
                <PlayCircleOutlined />
              </div>
              <div class="video-duration">{{ video.duration }}</div>
            </div>
            <div class="media-overlay">
              <div class="media-info">
                <span class="media-date">{{ formatDate(video.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="files" tab="Files">
        <div class="files-list">
          <div 
            v-for="file in files" 
            :key="file.id"
            class="file-item"
            @click="downloadFile(file)"
          >
            <div class="file-icon">
              <FileOutlined v-if="file.type === 'document'" />
              <FileImageOutlined v-else-if="file.type === 'image'" />
              <FileVideoOutlined v-else-if="file.type === 'video'" />
              <FileAudioOutlined v-else-if="file.type === 'audio'" />
              <FileZipOutlined v-else-if="file.type === 'archive'" />
              <FileOutlined v-else />
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-date">{{ formatDate(file.date) }}</span>
              </div>
            </div>
            <div class="file-actions">
              <a-button type="text" size="small" @click.stop="downloadFile(file)">
                <DownloadOutlined />
              </a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="links" tab="Links">
        <div class="links-list">
          <div 
            v-for="link in links" 
            :key="link.id"
            class="link-item"
            @click="openLink(link.url)"
          >
            <div class="link-preview">
              <img v-if="link.image" :src="link.image" :alt="link.title" />
              <div v-else class="link-placeholder">
                <LinkOutlined />
              </div>
            </div>
            <div class="link-info">
              <div class="link-title">{{ link.title }}</div>
              <div class="link-description">{{ link.description }}</div>
              <div class="link-url">{{ link.url }}</div>
              <div class="link-date">{{ formatDate(link.date) }}</div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- Empty State -->
    <div v-if="isEmpty" class="empty-state">
      <div class="empty-icon">📁</div>
      <p>No {{ activeTab }} found</p>
    </div>
  </a-modal>

  <!-- Lightbox -->
  <a-modal
    v-model:open="lightboxVisible"
    :title="null"
    :footer="null"
    :width="'90vw'"
    :style="{ top: '20px' }"
    class="lightbox-modal"
  >
    <div class="lightbox-content">
      <img 
        v-if="currentMedia && currentMediaType === 'photo'" 
        :src="currentMedia.url" 
        :alt="currentMedia.name"
        class="lightbox-image"
      />
      <video 
        v-else-if="currentMedia && currentMediaType === 'video'"
        :src="currentMedia.url"
        controls
        class="lightbox-video"
      >
        Your browser does not support the video tag.
      </video>
    </div>
    
    <div class="lightbox-info">
      <h4>{{ currentMedia?.name }}</h4>
      <p>{{ formatDate(currentMedia?.date) }}</p>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  PlayCircleOutlined,
  FileOutlined,
  FileImageOutlined,
  FileVideoOutlined,
  FileAudioOutlined,
  FileZipOutlined,
  DownloadOutlined,
  LinkOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  chatId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

// Reactive data
const activeTab = ref('photos')
const lightboxVisible = ref(false)
const currentMedia = ref(null)
const currentMediaType = ref(null)

// Mock data - in real app, this would come from API
const photos = ref([
  {
    id: 1,
    name: 'IMG_001.jpg',
    thumbnail: 'https://via.placeholder.com/150x150/1890ff/ffffff?text=Photo1',
    url: 'https://via.placeholder.com/800x600/1890ff/ffffff?text=Photo1',
    date: new Date('2024-01-15'),
    size: 2048576
  },
  {
    id: 2,
    name: 'IMG_002.jpg',
    thumbnail: 'https://via.placeholder.com/150x150/52c41a/ffffff?text=Photo2',
    url: 'https://via.placeholder.com/800x600/52c41a/ffffff?text=Photo2',
    date: new Date('2024-01-14'),
    size: 1536000
  },
  {
    id: 3,
    name: 'IMG_003.jpg',
    thumbnail: 'https://via.placeholder.com/150x150/faad14/ffffff?text=Photo3',
    url: 'https://via.placeholder.com/800x600/faad14/ffffff?text=Photo3',
    date: new Date('2024-01-13'),
    size: 2560000
  }
])

const videos = ref([
  {
    id: 1,
    name: 'VID_001.mp4',
    thumbnail: 'https://via.placeholder.com/150x150/f5222d/ffffff?text=Video1',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    duration: '0:45',
    date: new Date('2024-01-12'),
    size: 5242880
  },
  {
    id: 2,
    name: 'VID_002.mp4',
    thumbnail: 'https://via.placeholder.com/150x150/722ed1/ffffff?text=Video2',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    duration: '1:20',
    date: new Date('2024-01-11'),
    size: 8388608
  }
])

const files = ref([
  {
    id: 1,
    name: 'document.pdf',
    type: 'document',
    size: 1048576,
    date: new Date('2024-01-10'),
    url: '#'
  },
  {
    id: 2,
    name: 'presentation.pptx',
    type: 'document',
    size: 2097152,
    date: new Date('2024-01-09'),
    url: '#'
  },
  {
    id: 3,
    name: 'archive.zip',
    type: 'archive',
    size: 5242880,
    date: new Date('2024-01-08'),
    url: '#'
  }
])

const links = ref([
  {
    id: 1,
    title: 'Vue.js Documentation',
    description: 'The Progressive JavaScript Framework',
    url: 'https://vuejs.org',
    image: 'https://via.placeholder.com/60x60/4fc08d/ffffff?text=Vue',
    date: new Date('2024-01-07')
  },
  {
    id: 2,
    title: 'Ant Design Vue',
    description: 'An enterprise-class UI design language and React UI library',
    url: 'https://antdv.com',
    image: 'https://via.placeholder.com/60x60/1890ff/ffffff?text=Ant',
    date: new Date('2024-01-06')
  }
])

// Computed
const isEmpty = computed(() => {
  switch (activeTab.value) {
    case 'photos':
      return photos.value.length === 0
    case 'videos':
      return videos.value.length === 0
    case 'files':
      return files.value.length === 0
    case 'links':
      return links.value.length === 0
    default:
      return true
  }
})

// Methods
function openLightbox(media, type) {
  currentMedia.value = media
  currentMediaType.value = type
  lightboxVisible.value = true
}

function downloadFile(file) {
  message.info(`Downloading ${file.name}`)
  // In real app, this would trigger actual download
}

function openLink(url) {
  window.open(url, '_blank')
}

function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  // Load media data for specific chat
  if (props.chatId) {
    console.log('Loading media for chat:', props.chatId)
    // In real app, make API call here
  }
})
</script>

<style scoped>
.media-gallery-modal :deep(.ant-modal-body) {
  padding: 0;
}

.media-tabs {
  min-height: 400px;
}

.media-tabs :deep(.ant-tabs-content-holder) {
  padding: 16px;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.media-item:hover {
  transform: scale(1.02);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-info {
  color: white;
  font-size: 12px;
}

/* Video specific */
.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* Files List */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 12px;
}

.file-item:hover {
  background: #fafafa;
}

.file-icon {
  font-size: 24px;
  color: #1890ff;
  width: 32px;
  display: flex;
  justify-content: center;
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
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.file-actions {
  flex-shrink: 0;
}

/* Links List */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 12px;
}

.link-item:hover {
  background: #fafafa;
}

.link-preview {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-placeholder {
  font-size: 24px;
  color: #8c8c8c;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-description {
  font-size: 13px;
  color: #595959;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-url {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-date {
  font-size: 12px;
  color: #8c8c8c;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Lightbox */
.lightbox-modal :deep(.ant-modal-body) {
  padding: 0;
}

.lightbox-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #000;
}

.lightbox-image,
.lightbox-video {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.lightbox-info {
  padding: 16px;
  text-align: center;
  background: white;
}

.lightbox-info h4 {
  margin: 0 0 8px 0;
  color: #262626;
}

.lightbox-info p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .file-item,
  .link-item {
    padding: 8px;
  }
  
  .link-preview {
    width: 48px;
    height: 48px;
  }
}
</style>