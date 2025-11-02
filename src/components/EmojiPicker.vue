<template>
  <div class="emoji-picker" v-if="visible">
    <div class="emoji-picker-backdrop" @click="close"></div>
    <div class="emoji-picker-container" :style="{ bottom: bottom + 'px' }">
      <!-- Header -->
      <div class="emoji-header">
        <div class="emoji-categories">
          <a-button 
            v-for="category in categories" 
            :key="category.key"
            type="text" 
            size="small"
            :class="{ 'active': activeCategory === category.key }"
            @click="setActiveCategory(category.key)"
          >
            {{ category.icon }}
          </a-button>
        </div>
        
        <a-button type="text" size="small" @click="close">
          <CloseOutlined />
        </a-button>
      </div>

      <!-- Search -->
      <div class="emoji-search">
        <a-input
          v-model:value="searchQuery"
          placeholder="Search emojis..."
          size="small"
          @input="handleSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>

      <!-- Emoji Grid -->
      <div class="emoji-content">
        <div v-if="filteredEmojis.length === 0" class="no-emojis">
          No emojis found
        </div>
        
        <div v-else class="emoji-grid">
          <button
            v-for="emoji in filteredEmojis"
            :key="emoji.code"
            class="emoji-button"
            @click="selectEmoji(emoji)"
            :title="emoji.name"
          >
            {{ emoji.emoji }}
          </button>
        </div>
      </div>

      <!-- Recently Used -->
      <div v-if="recentEmojis.length > 0 && !searchQuery" class="recent-section">
        <div class="section-title">Recently Used</div>
        <div class="emoji-grid">
          <button
            v-for="emoji in recentEmojis"
            :key="'recent-' + emoji.code"
            class="emoji-button"
            @click="selectEmoji(emoji)"
            :title="emoji.name"
          >
            {{ emoji.emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CloseOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  bottom: {
    type: Number,
    default: 60
  }
})

const emit = defineEmits(['close', 'select'])

// Reactive data
const searchQuery = ref('')
const activeCategory = ref('smileys')
const recentEmojis = ref([])

// Categories
const categories = [
  { key: 'smileys', icon: '😀', name: 'Smileys & Emotion' },
  { key: 'people', icon: '👋', name: 'People & Body' },
  { key: 'animals', icon: '🐶', name: 'Animals & Nature' },
  { key: 'food', icon: '🍎', name: 'Food & Drink' },
  { key: 'activities', icon: '⚽', name: 'Activities' },
  { key: 'travel', icon: '🚗', name: 'Travel & Places' },
  { key: 'objects', icon: '💡', name: 'Objects' },
  { key: 'symbols', icon: '❤️', name: 'Symbols' },
  { key: 'flags', icon: '🏳️', name: 'Flags' }
]

// Emoji data (simplified for demo)
const emojiData = {
  smileys: [
    { code: '1f600', emoji: '😀', name: 'grinning face' },
    { code: '1f603', emoji: '😃', name: 'grinning face with big eyes' },
    { code: '1f604', emoji: '😄', name: 'grinning face with smiling eyes' },
    { code: '1f601', emoji: '😁', name: 'beaming face with smiling eyes' },
    { code: '1f606', emoji: '😆', name: 'grinning squinting face' },
    { code: '1f605', emoji: '😅', name: 'grinning face with sweat' },
    { code: '1f923', emoji: '🤣', name: 'rolling on the floor laughing' },
    { code: '1f602', emoji: '😂', name: 'face with tears of joy' },
    { code: '1f642', emoji: '🙂', name: 'slightly smiling face' },
    { code: '1f643', emoji: '🙃', name: 'upside-down face' },
    { code: '1f609', emoji: '😉', name: 'winking face' },
    { code: '1f60a', emoji: '😊', name: 'smiling face with smiling eyes' },
    { code: '1f607', emoji: '😇', name: 'smiling face with halo' },
    { code: '1f970', emoji: '🥰', name: 'smiling face with hearts' },
    { code: '1f60d', emoji: '😍', name: 'smiling face with heart-eyes' },
    { code: '1f929', emoji: '🤩', name: 'star-struck' },
    { code: '1f618', emoji: '😘', name: 'face blowing a kiss' },
    { code: '1f617', emoji: '😗', name: 'kissing face' },
    { code: '1f61a', emoji: '😚', name: 'kissing face with closed eyes' },
    { code: '1f619', emoji: '😙', name: 'kissing face with smiling eyes' }
  ],
  people: [
    { code: '1f44b', emoji: '👋', name: 'waving hand' },
    { code: '1f91a', emoji: '🤚', name: 'raised back of hand' },
    { code: '1f590', emoji: '🖐️', name: 'hand with fingers splayed' },
    { code: '270b', emoji: '✋', name: 'raised hand' },
    { code: '1f596', emoji: '🖖', name: 'vulcan salute' },
    { code: '1f44c', emoji: '👌', name: 'OK hand' },
    { code: '1f90f', emoji: '🤏', name: 'pinching hand' },
    { code: '270c', emoji: '✌️', name: 'victory hand' },
    { code: '1f91e', emoji: '🤞', name: 'crossed fingers' },
    { code: '1f91f', emoji: '🤟', name: 'love-you gesture' }
  ],
  animals: [
    { code: '1f436', emoji: '🐶', name: 'dog face' },
    { code: '1f431', emoji: '🐱', name: 'cat face' },
    { code: '1f42d', emoji: '🐭', name: 'mouse face' },
    { code: '1f439', emoji: '🐹', name: 'hamster' },
    { code: '1f430', emoji: '🐰', name: 'rabbit face' },
    { code: '1f98a', emoji: '🦊', name: 'fox' },
    { code: '1f43b', emoji: '🐻', name: 'bear' },
    { code: '1f43c', emoji: '🐼', name: 'panda' },
    { code: '1f43b‍❄️', emoji: '🐻‍❄️', name: 'polar bear' },
    { code: '1f428', emoji: '🐨', name: 'koala' }
  ],
  food: [
    { code: '1f34e', emoji: '🍎', name: 'red apple' },
    { code: '1f34a', emoji: '🍊', name: 'tangerine' },
    { code: '1f34b', emoji: '🍋', name: 'lemon' },
    { code: '1f34c', emoji: '🍌', name: 'banana' },
    { code: '1f349', emoji: '🍉', name: 'watermelon' },
    { code: '1f347', emoji: '🍇', name: 'grapes' },
    { code: '1f353', emoji: '🍓', name: 'strawberry' },
    { code: '1f348', emoji: '🍈', name: 'melon' },
    { code: '1f351', emoji: '🍑', name: 'cherries' },
    { code: '1f34d', emoji: '🍍', name: 'pineapple' }
  ],
  activities: [
    { code: '26bd', emoji: '⚽', name: 'soccer ball' },
    { code: '1f3c0', emoji: '🏀', name: 'basketball' },
    { code: '1f3c8', emoji: '🏈', name: 'american football' },
    { code: '26be', emoji: '⚾', name: 'baseball' },
    { code: '1f94e', emoji: '🥎', name: 'softball' },
    { code: '1f3be', emoji: '🎾', name: 'tennis' },
    { code: '1f3d0', emoji: '🏐', name: 'volleyball' },
    { code: '1f3c9', emoji: '🏉', name: 'rugby football' },
    { code: '1f94f', emoji: '🥏', name: 'flying disc' },
    { code: '1f3b1', emoji: '🎱', name: 'pool 8 ball' }
  ],
  travel: [
    { code: '1f697', emoji: '🚗', name: 'automobile' },
    { code: '1f695', emoji: '🚕', name: 'taxi' },
    { code: '1f699', emoji: '🚙', name: 'sport utility vehicle' },
    { code: '1f68c', emoji: '🚌', name: 'bus' },
    { code: '1f68e', emoji: '🚎', name: 'trolleybus' },
    { code: '1f3ce', emoji: '🏎️', name: 'racing car' },
    { code: '1f693', emoji: '🚓', name: 'police car' },
    { code: '1f691', emoji: '🚑', name: 'ambulance' },
    { code: '1f692', emoji: '🚒', name: 'fire engine' },
    { code: '1f69a', emoji: '🚚', name: 'delivery truck' }
  ],
  objects: [
    { code: '1f4a1', emoji: '💡', name: 'light bulb' },
    { code: '1f526', emoji: '🔦', name: 'flashlight' },
    { code: '1f56f', emoji: '🕯️', name: 'candle' },
    { code: '1f9ef', emoji: '🧯', name: 'fire extinguisher' },
    { code: '1f5d1', emoji: '🗑️', name: 'wastebasket' },
    { code: '1f6e2', emoji: '🛢️', name: 'oil drum' },
    { code: '1f4b0', emoji: '💰', name: 'money bag' },
    { code: '1f4b4', emoji: '💴', name: 'yen banknote' },
    { code: '1f4b5', emoji: '💵', name: 'dollar banknote' },
    { code: '1f4b6', emoji: '💶', name: 'euro banknote' }
  ],
  symbols: [
    { code: '2764', emoji: '❤️', name: 'red heart' },
    { code: '1f9e1', emoji: '🧡', name: 'orange heart' },
    { code: '1f49b', emoji: '💛', name: 'yellow heart' },
    { code: '1f49a', emoji: '💚', name: 'green heart' },
    { code: '1f499', emoji: '💙', name: 'blue heart' },
    { code: '1f49c', emoji: '💜', name: 'purple heart' },
    { code: '1f90e', emoji: '🤎', name: 'brown heart' },
    { code: '1f5a4', emoji: '🖤', name: 'black heart' },
    { code: '1f90d', emoji: '🤍', name: 'white heart' },
    { code: '1f494', emoji: '💔', name: 'broken heart' }
  ],
  flags: [
    { code: '1f3f3', emoji: '🏳️', name: 'white flag' },
    { code: '1f3f4', emoji: '🏴', name: 'black flag' },
    { code: '1f3c1', emoji: '🏁', name: 'chequered flag' },
    { code: '1f3f3-200d-1f308', emoji: '🏳️‍🌈', name: 'rainbow flag' },
    { code: '1f3f3-200d-26a7-fe0f', emoji: '🏳️‍⚧️', name: 'transgender flag' },
    { code: '1f1fb-1f1f3', emoji: '🇻🇳', name: 'flag: Vietnam' },
    { code: '1f1fa-1f1f8', emoji: '🇺🇸', name: 'flag: United States' },
    { code: '1f1ec-1f1e7', emoji: '🇬🇧', name: 'flag: United Kingdom' },
    { code: '1f1ef-1f1f5', emoji: '🇯🇵', name: 'flag: Japan' },
    { code: '1f1e9-1f1ea', emoji: '🇩🇪', name: 'flag: Germany' }
  ]
}

// Computed
const currentEmojis = computed(() => {
  return emojiData[activeCategory.value] || []
})

const filteredEmojis = computed(() => {
  if (!searchQuery.value.trim()) {
    return currentEmojis.value
  }
  
  const query = searchQuery.value.toLowerCase()
  const allEmojis = Object.values(emojiData).flat()
  
  return allEmojis.filter(emoji => 
    emoji.name.toLowerCase().includes(query)
  )
})

// Methods
function setActiveCategory(category) {
  activeCategory.value = category
  searchQuery.value = ''
}

function handleSearch() {
  // Search is handled by computed property
}

function selectEmoji(emoji) {
  // Add to recent emojis
  const existingIndex = recentEmojis.value.findIndex(e => e.code === emoji.code)
  if (existingIndex > -1) {
    recentEmojis.value.splice(existingIndex, 1)
  }
  recentEmojis.value.unshift(emoji)
  
  // Keep only last 20 recent emojis
  if (recentEmojis.value.length > 20) {
    recentEmojis.value = recentEmojis.value.slice(0, 20)
  }
  
  // Save to localStorage
  localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis.value))
  
  emit('select', emoji)
}

function close() {
  emit('close')
}

// Load recent emojis from localStorage
onMounted(() => {
  try {
    const saved = localStorage.getItem('recentEmojis')
    if (saved) {
      recentEmojis.value = JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Could not load recent emojis:', error)
  }
})
</script>

<style scoped>
.emoji-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.emoji-picker-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.emoji-picker-container {
  position: absolute;
  left: 20px;
  right: 20px;
  height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.emoji-categories {
  display: flex;
  gap: 4px;
}

.emoji-categories .ant-btn {
  font-size: 16px;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
}

.emoji-categories .ant-btn.active {
  background: #1890ff;
  color: white;
}

.emoji-search {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.emoji-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-button {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-button:hover {
  background: #f0f0f0;
}

.emoji-button:active {
  background: #e6f7ff;
}

.no-emojis {
  text-align: center;
  color: #8c8c8c;
  padding: 40px 20px;
}

.recent-section {
  border-top: 1px solid #f0f0f0;
  padding: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #8c8c8c;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Scrollbar */
.emoji-content::-webkit-scrollbar {
  width: 6px;
}

.emoji-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.emoji-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.emoji-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .emoji-picker-container {
    left: 10px;
    right: 10px;
    height: 350px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .emoji-button {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }
}
</style>