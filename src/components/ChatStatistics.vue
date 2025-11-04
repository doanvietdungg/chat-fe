<template>
  <div class="chat-statistics">
    <div class="stats-header">
      <h3 class="stats-title">Thống kê cuộc trò chuyện</h3>
      <a-button type="text" @click="refreshStats" :loading="loading">
        <template #icon><ReloadOutlined /></template>
      </a-button>
    </div>

    <div class="stats-content">
      <!-- Overview Cards -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <MessageOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ formatNumber(stats.totalMessages) }}</div>
            <div class="stat-label">Tổng tin nhắn</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <FileImageOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ formatNumber(stats.totalMedia) }}</div>
            <div class="stat-label">File đa phương tiện</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <ClockCircleOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.avgResponseTime }}</div>
            <div class="stat-label">Thời gian phản hồi TB</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <CalendarOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.activeDays }}</div>
            <div class="stat-label">Ngày hoạt động</div>
          </div>
        </div>
      </div>

      <!-- Message Activity Chart -->
      <div class="stats-section">
        <h4 class="section-title">Hoạt động tin nhắn (7 ngày qua)</h4>
        <div class="activity-chart">
          <div 
            v-for="(day, index) in stats.weeklyActivity" 
            :key="index"
            class="activity-bar"
          >
            <div 
              class="bar-fill"
              :style="{ 
                height: (day.messages / stats.maxDayMessages) * 100 + '%',
                backgroundColor: getActivityColor(day.messages, stats.maxDayMessages)
              }"
            />
            <div class="bar-label">{{ day.day }}</div>
            <div class="bar-count">{{ day.messages }}</div>
          </div>
        </div>
      </div>

      <!-- Message Types -->
      <div class="stats-section">
        <h4 class="section-title">Loại tin nhắn</h4>
        <div class="message-types">
          <div 
            v-for="type in stats.messageTypes" 
            :key="type.name"
            class="type-item"
          >
            <div class="type-info">
              <component :is="type.icon" class="type-icon" />
              <span class="type-name">{{ type.name }}</span>
            </div>
            <div class="type-stats">
              <div class="type-count">{{ formatNumber(type.count) }}</div>
              <div class="type-percentage">{{ type.percentage }}%</div>
            </div>
            <div class="type-bar">
              <div 
                class="type-progress"
                :style="{ width: type.percentage + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Most Active Hours -->
      <div class="stats-section">
        <h4 class="section-title">Giờ hoạt động nhiều nhất</h4>
        <div class="hourly-activity">
          <div 
            v-for="hour in stats.hourlyActivity" 
            :key="hour.hour"
            class="hour-item"
            :class="{ 'peak-hour': hour.isPeak }"
          >
            <div class="hour-time">{{ hour.hour }}:00</div>
            <div class="hour-bar">
              <div 
                class="hour-fill"
                :style="{ width: (hour.messages / stats.maxHourMessages) * 100 + '%' }"
              />
            </div>
            <div class="hour-count">{{ hour.messages }}</div>
          </div>
        </div>
      </div>

      <!-- Top Emojis -->
      <div class="stats-section">
        <h4 class="section-title">Emoji được dùng nhiều nhất</h4>
        <div class="top-emojis">
          <div 
            v-for="emoji in stats.topEmojis" 
            :key="emoji.emoji"
            class="emoji-item"
          >
            <div class="emoji-icon">{{ emoji.emoji }}</div>
            <div class="emoji-count">{{ emoji.count }}</div>
          </div>
        </div>
      </div>

      <!-- Word Cloud -->
      <div class="stats-section">
        <h4 class="section-title">Từ khóa phổ biến</h4>
        <div class="word-cloud">
          <span 
            v-for="word in stats.topWords" 
            :key="word.text"
            class="word-item"
            :style="{ 
              fontSize: (word.frequency / stats.maxWordFrequency) * 20 + 12 + 'px',
              color: getWordColor(word.frequency, stats.maxWordFrequency)
            }"
          >
            {{ word.text }}
          </span>
        </div>
      </div>

      <!-- Export Options -->
      <div class="stats-actions">
        <a-button @click="exportStats('pdf')" class="export-btn">
          <template #icon><FilePdfOutlined /></template>
          Xuất PDF
        </a-button>
        <a-button @click="exportStats('excel')" class="export-btn">
          <template #icon><FileExcelOutlined /></template>
          Xuất Excel
        </a-button>
        <a-button @click="shareStats" class="export-btn">
          <template #icon><ShareAltOutlined /></template>
          Chia sẻ
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ReloadOutlined,
  MessageOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  SmileOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  chatId: { type: String, required: true },
  messages: { type: Array, default: () => [] }
})

const loading = ref(false)

// Mock statistics data
const stats = ref({
  totalMessages: 1247,
  totalMedia: 89,
  avgResponseTime: '2m 15s',
  activeDays: 45,
  maxDayMessages: 85,
  maxHourMessages: 25,
  maxWordFrequency: 45,
  
  weeklyActivity: [
    { day: 'T2', messages: 45 },
    { day: 'T3', messages: 67 },
    { day: 'T4', messages: 23 },
    { day: 'T5', messages: 85 },
    { day: 'T6', messages: 72 },
    { day: 'T7', messages: 34 },
    { day: 'CN', messages: 12 }
  ],
  
  messageTypes: [
    { name: 'Tin nhắn văn bản', icon: MessageOutlined, count: 1089, percentage: 87.3 },
    { name: 'Hình ảnh', icon: FileImageOutlined, count: 67, percentage: 5.4 },
    { name: 'Video', icon: VideoCameraOutlined, count: 23, percentage: 1.8 },
    { name: 'File âm thanh', icon: AudioOutlined, count: 45, percentage: 3.6 },
    { name: 'File khác', icon: FileTextOutlined, count: 23, percentage: 1.9 }
  ],
  
  hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    messages: Math.floor(Math.random() * 25) + 1,
    isPeak: false
  })),
  
  topEmojis: [
    { emoji: '😂', count: 156 },
    { emoji: '❤️', count: 134 },
    { emoji: '👍', count: 98 },
    { emoji: '😊', count: 87 },
    { emoji: '🔥', count: 76 },
    { emoji: '😍', count: 65 },
    { emoji: '👌', count: 54 },
    { emoji: '😎', count: 43 }
  ],
  
  topWords: [
    { text: 'ok', frequency: 45 },
    { text: 'được', frequency: 38 },
    { text: 'không', frequency: 35 },
    { text: 'rồi', frequency: 32 },
    { text: 'làm', frequency: 28 },
    { text: 'đi', frequency: 25 },
    { text: 'có', frequency: 23 },
    { text: 'thế', frequency: 20 },
    { text: 'này', frequency: 18 },
    { text: 'gì', frequency: 15 }
  ]
})

onMounted(() => {
  // Mark peak hours
  const sortedHours = [...stats.value.hourlyActivity].sort((a, b) => b.messages - a.messages)
  const topHours = sortedHours.slice(0, 3)
  topHours.forEach(hour => {
    const index = stats.value.hourlyActivity.findIndex(h => h.hour === hour.hour)
    if (index !== -1) {
      stats.value.hourlyActivity[index].isPeak = true
    }
  })
})

function refreshStats() {
  loading.value = true
  // Mock API call
  setTimeout(() => {
    loading.value = false
    message.success('Đã cập nhật thống kê')
  }, 1000)
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function getActivityColor(messages, maxMessages) {
  const intensity = messages / maxMessages
  if (intensity > 0.8) return '#ff4d4f'
  if (intensity > 0.6) return '#fa8c16'
  if (intensity > 0.4) return '#fadb14'
  if (intensity > 0.2) return '#52c41a'
  return '#1890ff'
}

function getWordColor(frequency, maxFrequency) {
  const intensity = frequency / maxFrequency
  const colors = ['#1890ff', '#52c41a', '#fadb14', '#fa8c16', '#ff4d4f']
  const index = Math.floor(intensity * (colors.length - 1))
  return colors[index]
}

function exportStats(format) {
  message.info(`Đang xuất thống kê dưới định dạng ${format.toUpperCase()}...`)
  // Mock export
  setTimeout(() => {
    message.success(`Đã xuất thống kê thành công`)
  }, 2000)
}

function shareStats() {
  if (navigator.share) {
    navigator.share({
      title: 'Thống kê cuộc trò chuyện',
      text: `Tổng ${stats.value.totalMessages} tin nhắn trong ${stats.value.activeDays} ngày hoạt động`,
      url: window.location.href
    })
  } else {
    // Fallback: copy to clipboard
    const text = `Thống kê cuộc trò chuyện: ${stats.value.totalMessages} tin nhắn, ${stats.value.totalMedia} file media`
    navigator.clipboard.writeText(text)
    message.success('Đã sao chép thống kê vào clipboard')
  }
}
</script>

<style scoped>
.chat-statistics {
  padding: 20px;
  background: var(--bg-color, #ffffff);
  border-radius: 12px;
  max-height: 80vh;
  overflow-y: auto;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #e8e8e8);
}

.stats-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #262626);
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #262626);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, #8c8c8c);
  margin-top: 4px;
}

.stats-section {
  background: var(--hover-bg, #f5f5f5);
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #262626);
}

.activity-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 120px;
  padding: 16px 0;
}

.activity-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.bar-fill {
  width: 100%;
  background: #1890ff;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 4px;
}

.bar-label {
  font-size: 12px;
  color: var(--text-secondary, #8c8c8c);
  font-weight: 500;
}

.bar-count {
  font-size: 11px;
  color: var(--text-primary, #262626);
  font-weight: 600;
}

.message-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.type-icon {
  color: #1890ff;
  font-size: 16px;
}

.type-name {
  font-size: 14px;
  color: var(--text-primary, #262626);
}

.type-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.type-count {
  font-weight: 600;
  color: var(--text-primary, #262626);
}

.type-percentage {
  font-size: 12px;
  color: var(--text-secondary, #8c8c8c);
}

.type-bar {
  flex: 1;
  height: 6px;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.type-progress {
  height: 100%;
  background: #1890ff;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.hourly-activity {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 8px;
}

.hour-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.hour-item.peak-hour {
  background: rgba(24, 144, 255, 0.1);
}

.hour-time {
  font-size: 11px;
  color: var(--text-secondary, #8c8c8c);
  font-weight: 500;
}

.hour-bar {
  width: 100%;
  height: 4px;
  background: rgba(24, 144, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.hour-fill {
  height: 100%;
  background: #1890ff;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.hour-count {
  font-size: 10px;
  color: var(--text-primary, #262626);
  font-weight: 600;
}

.top-emojis {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.emoji-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: rgba(24, 144, 255, 0.05);
  border-radius: 12px;
  min-width: 60px;
}

.emoji-icon {
  font-size: 24px;
}

.emoji-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #262626);
}

.word-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(24, 144, 255, 0.02);
  border-radius: 8px;
  min-height: 100px;
}

.word-item {
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  line-height: 1.2;
}

.word-item:hover {
  transform: scale(1.1);
}

.stats-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #e8e8e8);
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chat-statistics {
    padding: 16px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .activity-chart {
    height: 100px;
  }
  
  .hourly-activity {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .word-cloud {
    padding: 16px;
  }
  
  .stats-actions {
    flex-direction: column;
  }
}

/* Custom scrollbar */
.chat-statistics::-webkit-scrollbar {
  width: 6px;
}

.chat-statistics::-webkit-scrollbar-track {
  background: transparent;
}

.chat-statistics::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.chat-statistics::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* Animations */
.stat-card,
.stats-section {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>