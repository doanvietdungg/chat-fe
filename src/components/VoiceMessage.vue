<template>
  <div class="voice-message" :class="{ 'own-voice': isOwn }">
    <div class="voice-controls">
      <a-button 
        type="text" 
        :icon="isPlaying ? h(PauseCircleOutlined) : h(PlayCircleOutlined)"
        @click="togglePlay"
        class="play-button"
        :class="{ 'playing': isPlaying }"
      />
      
      <div class="voice-waveform" @click="seekTo">
        <div class="waveform-container">
          <div 
            v-for="(bar, index) in waveformBars" 
            :key="index"
            class="waveform-bar"
            :style="{ 
              height: bar.height + '%',
              backgroundColor: index <= currentProgress ? (isOwn ? '#ffffff' : '#1890ff') : '#d9d9d9'
            }"
          />
        </div>
        <div class="progress-line" :style="{ width: progressPercent + '%' }" />
      </div>
      
      <div class="voice-duration">
        {{ formatDuration(isPlaying ? currentTime : duration) }}
      </div>
    </div>
    
    <div class="voice-info">
      <div class="voice-size">{{ formatFileSize(fileSize) }}</div>
      <div v-if="isOwn" class="voice-status">
        <CheckOutlined v-if="status === 'sent'" />
        <CheckOutlined v-else-if="status === 'delivered'" class="double-check" />
        <CheckOutlined v-else-if="status === 'read'" class="read-check" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  CheckOutlined 
} from '@ant-design/icons-vue'

const props = defineProps({
  audioUrl: { type: String, required: true },
  duration: { type: Number, default: 0 },
  fileSize: { type: Number, default: 0 },
  isOwn: { type: Boolean, default: false },
  status: { type: String, default: 'sent' } // sent, delivered, read
})

const isPlaying = ref(false)
const currentTime = ref(0)
const currentProgress = ref(0)

// Mock waveform data
const waveformBars = ref(Array.from({ length: 40 }, () => ({
  height: Math.random() * 80 + 20
})))

const progressPercent = computed(() => {
  return props.duration > 0 ? (currentTime.value / props.duration) * 100 : 0
})

function togglePlay() {
  isPlaying.value = !isPlaying.value
  
  if (isPlaying.value) {
    // Mock playback
    const interval = setInterval(() => {
      currentTime.value += 0.1
      currentProgress.value = Math.floor((currentTime.value / props.duration) * waveformBars.value.length)
      
      if (currentTime.value >= props.duration) {
        clearInterval(interval)
        isPlaying.value = false
        currentTime.value = 0
        currentProgress.value = 0
      }
    }, 100)
  }
}

function seekTo(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percent = clickX / rect.width
  currentTime.value = percent * props.duration
  currentProgress.value = Math.floor(percent * waveformBars.value.length)
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.voice-message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f0f0;
  border-radius: 18px;
  max-width: 280px;
  min-width: 200px;
}

.voice-message.own-voice {
  background: #1890ff;
  color: white;
}

.voice-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-button {
  font-size: 24px;
  color: #1890ff;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.own-voice .play-button {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.play-button.playing {
  background: rgba(24, 144, 255, 0.1);
}

.own-voice .play-button.playing {
  background: rgba(255, 255, 255, 0.3);
}

.voice-waveform {
  flex: 1;
  height: 32px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.waveform-container {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  width: 100%;
}

.waveform-bar {
  width: 3px;
  background: #d9d9d9;
  border-radius: 2px;
  transition: background-color 0.2s;
  min-height: 4px;
}

.progress-line {
  position: absolute;
  top: 50%;
  left: 0;
  height: 2px;
  background: #1890ff;
  transform: translateY(-50%);
  border-radius: 1px;
  transition: width 0.1s;
}

.own-voice .progress-line {
  background: white;
}

.voice-duration {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

.own-voice .voice-duration {
  color: rgba(255, 255, 255, 0.8);
}

.voice-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voice-size {
  font-size: 11px;
  color: #8c8c8c;
}

.own-voice .voice-size {
  color: rgba(255, 255, 255, 0.7);
}

.voice-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.double-check::after {
  content: '✓';
  margin-left: -6px;
}

.read-check {
  color: #52c41a;
}

/* Animations */
.play-button:hover {
  transform: scale(1.1);
}

.waveform-bar:hover {
  opacity: 0.8;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .voice-message {
    max-width: 240px;
    min-width: 180px;
  }
  
  .voice-controls {
    gap: 8px;
  }
  
  .waveform-bar {
    width: 2px;
    gap: 1px;
  }
}
</style>