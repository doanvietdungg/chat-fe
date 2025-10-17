<script setup>
import { ref, computed } from 'vue'
import { useStores } from '../composables/useStores'

const props = defineProps({
  visible: { type: Boolean, default: false },
  messageId: { type: String, default: null }
})

const emit = defineEmits(['close'])

const { messagesStore, uiStore } = useStores()

// Emoji categories
const emojiCategories = {
  'Smileys': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
  ],
  'Emotions': [
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗'
  ],
  'Gestures': [
    '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
    '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾'
  ],
  'Hearts': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
  ],
  'Objects': [
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️',
    '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌'
  ]
}

const activeCategory = ref('Smileys')
const searchQuery = ref('')

const filteredEmojis = computed(() => {
  const emojis = emojiCategories[activeCategory.value] || []
  
  if (!searchQuery.value) {
    return emojis
  }
  
  // Simple search - in real app would have emoji names/keywords
  return emojis.filter(emoji => {
    // This is a simplified search, real implementation would have emoji metadata
    return true
  })
})

function selectEmoji(emoji) {
  if (props.messageId) {
    messagesStore.addReaction(props.messageId, emoji)
  }
  emit('close')
}

function setCategory(category) {
  activeCategory.value = category
}

function handleClose() {
  emit('close')
  searchQuery.value = ''
  activeCategory.value = 'Smileys'
}
</script>

<template>
  <a-modal
    :open="visible"
    title="Choose Reaction"
    @cancel="handleClose"
    :footer="null"
    width="400px"
    class="reaction-picker-modal"
  >
    <div class="reaction-picker">
      <!-- Search -->
      <div class="search-section">
        <a-input
          v-model:value="searchQuery"
          placeholder="Search emojis..."
          size="small"
        />
      </div>
      
      <!-- Categories -->
      <div class="categories-section">
        <div class="category-tabs">
          <button
            v-for="(emojis, category) in emojiCategories"
            :key="category"
            :class="['category-tab', { active: activeCategory === category }]"
            @click="setCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
      
      <!-- Emoji Grid -->
      <div class="emoji-grid">
        <button
          v-for="emoji in filteredEmojis"
          :key="emoji"
          @click="selectEmoji(emoji)"
          class="emoji-button"
          :title="emoji"
        >
          {{ emoji }}
        </button>
      </div>
      
      <!-- Recently used (placeholder) -->
      <div class="recent-section">
        <h4>Recently Used</h4>
        <div class="emoji-grid">
          <button
            v-for="emoji in ['👍', '❤️', '😂', '😮', '😢']"
            :key="emoji"
            @click="selectEmoji(emoji)"
            class="emoji-button"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.reaction-picker {
  max-height: 400px;
  overflow-y: auto;
}

.search-section {
  margin-bottom: var(--spacing-md);
}

.categories-section {
  margin-bottom: var(--spacing-md);
}

.category-tabs {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.category-tab {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.category-tab:hover {
  background: var(--bg-color);
}

.category-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.emoji-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 20px;
}

.emoji-button:hover {
  background: var(--bg-color);
  transform: scale(1.2);
}

.recent-section h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 14px;
  color: var(--text-secondary);
}

/* Custom scrollbar */
.reaction-picker::-webkit-scrollbar {
  width: 6px;
}

.reaction-picker::-webkit-scrollbar-track {
  background: transparent;
}

.reaction-picker::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

/* Mobile responsive */
@media (max-width: 576px) {
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .emoji-button {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }
  
  .category-tab {
    font-size: 11px;
    padding: 4px 8px;
  }
}
</style>