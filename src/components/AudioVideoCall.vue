<template>
  <div class="call-interface" v-if="isCallActive">
    <!-- Call Header -->
    <div class="call-header">
      <div class="call-info">
        <a-avatar :size="40" :src="contact.avatar">
          {{ contact.name?.[0]?.toUpperCase() }}
        </a-avatar>
        <div class="call-details">
          <div class="contact-name">{{ contact.name }}</div>
          <div class="call-status">{{ callStatusText }}</div>
        </div>
      </div>
      
      <div class="call-actions">
        <a-button type="text" @click="minimizeCall" class="minimize-btn">
          <template #icon><MinusOutlined /></template>
        </a-button>
        <a-button type="text" @click="endCall" class="end-call-btn">
          <template #icon><CloseOutlined /></template>
        </a-button>
      </div>
    </div>

    <!-- Video Area -->
    <div class="video-area" v-if="callType === 'video'">
      <!-- Remote Video -->
      <div class="remote-video">
        <video 
          ref="remoteVideo" 
          autoplay 
          playsinline
          :class="{ 'video-off': !remoteVideoEnabled }"
        />
        <div v-if="!remoteVideoEnabled" class="video-placeholder">
          <a-avatar :size="80" :src="contact.avatar">
            {{ contact.name?.[0]?.toUpperCase() }}
          </a-avatar>
          <div class="video-off-text">Camera tắt</div>
        </div>
      </div>
      
      <!-- Local Video -->
      <div class="local-video" :class="{ 'minimized': isLocalVideoMinimized }">
        <video 
          ref="localVideo" 
          autoplay 
          playsinline 
          muted
          :class="{ 'video-off': !localVideoEnabled }"
        />
        <div v-if="!localVideoEnabled" class="video-placeholder small">
          <a-avatar :size="40">
            {{ 'B' }}
          </a-avatar>
        </div>
        <a-button 
          type="text" 
          size="small" 
          @click="toggleLocalVideoSize"
          class="resize-btn"
        >
          <template #icon>
            <ExpandOutlined v-if="isLocalVideoMinimized" />
            <CompressOutlined v-else />
          </template>
        </a-button>
      </div>
    </div>

    <!-- Audio Only Interface -->
    <div class="audio-interface" v-else>
      <div class="audio-avatar">
        <a-avatar :size="120" :src="contact.avatar">
          {{ contact.name?.[0]?.toUpperCase() }}
        </a-avatar>
        <div class="audio-waves" v-if="isConnected">
          <div class="wave" v-for="i in 5" :key="i" :style="{ animationDelay: i * 0.1 + 's' }" />
        </div>
      </div>
      <div class="call-timer">{{ formatCallDuration(callDuration) }}</div>
    </div>

    <!-- Call Controls -->
    <div class="call-controls">
      <a-button 
        :type="isMuted ? 'primary' : 'default'"
        @click="toggleMute"
        class="control-btn"
        :class="{ 'muted': isMuted }"
      >
        <template #icon>
          <AudioMutedOutlined v-if="isMuted" />
          <AudioOutlined v-else />
        </template>
      </a-button>

      <a-button 
        v-if="callType === 'video'"
        :type="!localVideoEnabled ? 'primary' : 'default'"
        @click="toggleVideo"
        class="control-btn"
        :class="{ 'video-off': !localVideoEnabled }"
      >
        <template #icon>
          <VideoCameraOutlined v-if="localVideoEnabled" />
          <VideoCameraAddOutlined v-else />
        </template>
      </a-button>

      <a-button 
        type="text"
        @click="switchCamera"
        class="control-btn"
        v-if="callType === 'video' && isMobile"
      >
        <template #icon><SwapOutlined /></template>
      </a-button>

      <a-button 
        type="text"
        @click="toggleSpeaker"
        class="control-btn"
        :class="{ 'speaker-on': isSpeakerOn }"
      >
        <template #icon>
          <SoundOutlined v-if="isSpeakerOn" />
          <CustomerServiceOutlined v-else />
        </template>
      </a-button>

      <a-button 
        type="primary"
        danger
        @click="endCall"
        class="end-call-btn-main"
      >
        <template #icon><PhoneOutlined class="phone-icon" /></template>
      </a-button>
    </div>

    <!-- Call Stats (Debug) -->
    <div class="call-stats" v-if="showStats">
      <div class="stats-item">
        <span>Kết nối: {{ connectionStatus }}</span>
      </div>
      <div class="stats-item">
        <span>Chất lượng: {{ callQuality }}</span>
      </div>
      <div class="stats-item">
        <span>Độ trễ: {{ latency }}ms</span>
      </div>
    </div>
  </div>

  <!-- Incoming Call Modal -->
  <a-modal
    v-model:open="showIncomingCall"
    :closable="false"
    :footer="null"
    :mask-closable="false"
    class="incoming-call-modal"
    centered
  >
    <div class="incoming-call">
      <div class="incoming-avatar">
        <a-avatar :size="100" :src="incomingCall.avatar">
          {{ incomingCall.name?.[0]?.toUpperCase() }}
        </a-avatar>
      </div>
      
      <div class="incoming-info">
        <div class="caller-name">{{ incomingCall.name }}</div>
        <div class="call-type-text">
          {{ incomingCall.type === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại' }}
        </div>
      </div>
      
      <div class="incoming-actions">
        <a-button 
          type="primary"
          danger
          @click="declineCall"
          class="decline-btn"
          size="large"
        >
          <template #icon><PhoneOutlined class="decline-icon" /></template>
        </a-button>
        
        <a-button 
          type="primary"
          @click="acceptCall"
          class="accept-btn"
          size="large"
        >
          <template #icon><PhoneOutlined /></template>
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  PhoneOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  SoundOutlined,
  CustomerServiceOutlined,
  SwapOutlined,
  MinusOutlined,
  CloseOutlined,
  ExpandOutlined,
  CompressOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  contact: { type: Object, required: true },
  callType: { type: String, default: 'audio' }, // 'audio' | 'video'
  isIncoming: { type: Boolean, default: false }
})

const emit = defineEmits(['call-ended', 'call-accepted', 'call-declined'])

// Call state
const isCallActive = ref(false)
const showIncomingCall = ref(false)
const isConnected = ref(false)
const callDuration = ref(0)
const callStatus = ref('connecting') // connecting, ringing, connected, ended

// Media controls
const isMuted = ref(false)
const localVideoEnabled = ref(true)
const remoteVideoEnabled = ref(true)
const isSpeakerOn = ref(false)
const isLocalVideoMinimized = ref(false)

// UI state
const showStats = ref(false)
const isMobile = ref(window.innerWidth <= 768)

// Mock data
const incomingCall = ref({
  name: 'John Doe',
  avatar: null,
  type: 'video'
})

// Mock stats
const connectionStatus = ref('Tốt')
const callQuality = ref('HD')
const latency = ref(45)

const callStatusText = computed(() => {
  switch (callStatus.value) {
    case 'connecting': return 'Đang kết nối...'
    case 'ringing': return 'Đang gọi...'
    case 'connected': return formatCallDuration(callDuration.value)
    case 'ended': return 'Cuộc gọi đã kết thúc'
    default: return ''
  }
})

// Refs for video elements
const localVideo = ref(null)
const remoteVideo = ref(null)

let callTimer = null

onMounted(() => {
  if (props.isIncoming) {
    showIncomingCall.value = true
  } else {
    startCall()
  }
  
  // Listen for resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  endCall()
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  isMobile.value = window.innerWidth <= 768
}

function startCall() {
  isCallActive.value = true
  callStatus.value = 'connecting'
  
  // Mock connection process
  setTimeout(() => {
    callStatus.value = 'ringing'
  }, 1000)
  
  setTimeout(() => {
    callStatus.value = 'connected'
    isConnected.value = true
    startCallTimer()
  }, 3000)
  
  // Initialize media if video call
  if (props.callType === 'video') {
    initializeMedia()
  }
}

function startCallTimer() {
  callTimer = setInterval(() => {
    callDuration.value++
  }, 1000)
}

function acceptCall() {
  showIncomingCall.value = false
  startCall()
  emit('call-accepted')
}

function declineCall() {
  showIncomingCall.value = false
  emit('call-declined')
}

function endCall() {
  isCallActive.value = false
  isConnected.value = false
  callStatus.value = 'ended'
  
  if (callTimer) {
    clearInterval(callTimer)
    callTimer = null
  }
  
  // Stop media streams
  stopMedia()
  
  emit('call-ended')
}

function toggleMute() {
  isMuted.value = !isMuted.value
  // In real implementation, mute/unmute audio track
}

function toggleVideo() {
  localVideoEnabled.value = !localVideoEnabled.value
  // In real implementation, enable/disable video track
}

function toggleSpeaker() {
  isSpeakerOn.value = !isSpeakerOn.value
  // In real implementation, switch audio output
}

function switchCamera() {
  // In real implementation, switch between front/back camera
  console.log('Switching camera...')
}

function toggleLocalVideoSize() {
  isLocalVideoMinimized.value = !isLocalVideoMinimized.value
}

function minimizeCall() {
  // In real implementation, minimize to floating window
  console.log('Minimizing call...')
}

async function initializeMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: props.callType === 'video',
      audio: true
    })
    
    if (localVideo.value) {
      localVideo.value.srcObject = stream
    }
    
    // Mock remote stream
    setTimeout(() => {
      // In real implementation, this would be the remote peer's stream
    }, 2000)
    
  } catch (error) {
    console.error('Error accessing media devices:', error)
  }
}

function stopMedia() {
  if (localVideo.value?.srcObject) {
    const tracks = localVideo.value.srcObject.getTracks()
    tracks.forEach(track => track.stop())
  }
  
  if (remoteVideo.value?.srcObject) {
    const tracks = remoteVideo.value.srcObject.getTracks()
    tracks.forEach(track => track.stop())
  }
}

function formatCallDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.call-interface {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  color: white;
}

.call-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.call-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.call-details {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.call-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.call-actions {
  display: flex;
  gap: 8px;
}

.minimize-btn,
.end-call-btn {
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.end-call-btn {
  background: rgba(255, 77, 79, 0.8);
}

.video-area {
  flex: 1;
  position: relative;
  background: #000;
}

.remote-video {
  width: 100%;
  height: 100%;
  position: relative;
}

.remote-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.video-off-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.local-video {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.local-video.minimized {
  width: 120px;
  height: 90px;
}

.local-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resize-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.audio-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.audio-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-waves {
  position: absolute;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.wave {
  width: 4px;
  height: 20px;
  background: rgba(24, 144, 255, 0.6);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { height: 20px; }
  50% { height: 40px; }
}

.call-timer {
  font-size: 24px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
}

.call-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.control-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.control-btn.muted,
.control-btn.video-off {
  background: rgba(255, 77, 79, 0.8);
}

.control-btn.speaker-on {
  background: rgba(24, 144, 255, 0.8);
}

.end-call-btn-main {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ff4d4f;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.phone-icon {
  transform: rotate(135deg);
}

.call-stats {
  position: absolute;
  top: 80px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
}

.stats-item {
  margin-bottom: 4px;
}

/* Incoming Call Modal */
.incoming-call {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px;
  text-align: center;
}

.incoming-avatar {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.caller-name {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.call-type-text {
  font-size: 16px;
  color: #8c8c8c;
}

.incoming-actions {
  display: flex;
  gap: 40px;
  align-items: center;
}

.decline-btn,
.accept-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
}

.decline-icon {
  transform: rotate(135deg);
}

.accept-btn {
  background: #52c41a;
  border-color: #52c41a;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .call-header {
    padding: 12px 16px;
  }
  
  .contact-name {
    font-size: 16px;
  }
  
  .local-video {
    width: 120px;
    height: 90px;
    top: 16px;
    right: 16px;
  }
  
  .local-video.minimized {
    width: 80px;
    height: 60px;
  }
  
  .call-controls {
    gap: 16px;
    padding: 20px 16px;
  }
  
  .control-btn {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
  
  .end-call-btn-main {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }
  
  .incoming-actions {
    gap: 30px;
  }
  
  .decline-btn,
  .accept-btn {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }
}

/* Animations */
.call-interface {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.control-btn:active {
  transform: scale(0.95);
}
</style>