<template>
  <div class="new-chat-button-container">
    <a-button
      type="primary"
      @click="openUserSearch"
      :loading="isLoading"
      class="new-chat-button"
      :size="size"
    >
      <PlusOutlined v-if="!isLoading" />
      {{ buttonText }}
    </a-button>
    
    <!-- User Search Modal -->
    <UserSearchModal />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useUserSearchStore } from '../store/userSearch.js'
import UserSearchModal from './UserSearchModal.vue'

const props = defineProps({
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  text: {
    type: String,
    default: 'New Chat'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const userSearchStore = useUserSearchStore()

const isLoading = computed(() => props.loading || userSearchStore.isLoading)
const buttonText = computed(() => props.text)

const openUserSearch = () => {
  userSearchStore.openSearchModal()
}
</script>

<style scoped>
.new-chat-button-container {
  display: inline-block;
}

.new-chat-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.new-chat-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.new-chat-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

/* Ripple effect */
.new-chat-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.new-chat-button:active::before {
  width: 200px;
  height: 200px;
}

/* Size variants */
.new-chat-button.ant-btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
}

.new-chat-button.ant-btn-lg {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
}
</style>