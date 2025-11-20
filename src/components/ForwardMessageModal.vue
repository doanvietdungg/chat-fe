<template>
  <a-modal
    v-model:open="visible"
    title="Chuyển tiếp tin nhắn"
    :width="500"
    @cancel="handleCancel"
    @ok="handleForward"
    :okText="selectedChats.length > 0 ? `Gửi tới ${selectedChats.length} cuộc trò chuyện` : 'Gửi'"
    :okButtonProps="{ disabled: selectedChats.length === 0 }"
    cancelText="Hủy"
  >
    <div class="forward-modal-content">
      <!-- Message Preview -->
      <div class="message-preview">
        <div class="preview-label">Tin nhắn sẽ được chuyển tiếp:</div>
        <div class="preview-content">
          <div class="preview-author">{{ message?.author }}</div>
          <div class="preview-text">{{ message?.text || 'File đính kèm' }}</div>
        </div>
      </div>

      <!-- Search -->
      <a-input
        v-model:value="searchText"
        placeholder="Tìm kiếm cuộc trò chuyện..."
        allow-clear
        class="search-input"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>

      <!-- Chat List -->
      <div class="chat-list">
        <a-checkbox-group v-model:value="selectedChats" style="width: 100%">
          <div
            v-for="chat in filteredChats"
            :key="chat.id"
            class="chat-item"
          >
            <a-checkbox :value="chat.id">
              <div class="chat-info">
                <div class="chat-title">{{ chat.title }}</div>
                <div v-if="chat.last" class="chat-last">{{ chat.last }}</div>
              </div>
            </a-checkbox>
          </div>
        </a-checkbox-group>

        <div v-if="filteredChats.length === 0" class="empty-state">
          Không tìm thấy cuộc trò chuyện
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { useChatsStore } from '../store/chats'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  message: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'forward'])

const chatsStore = useChatsStore()
const searchText = ref('')
const selectedChats = ref([])

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const filteredChats = computed(() => {
  const allChats = chatsStore.state.chats || []
  
  if (!searchText.value) {
    return allChats
  }

  const search = searchText.value.toLowerCase()
  return allChats.filter(chat => 
    chat.title?.toLowerCase().includes(search)
  )
})

function handleCancel() {
  visible.value = false
  selectedChats.value = []
  searchText.value = ''
}

function handleForward() {
  if (selectedChats.value.length === 0) return

  emit('forward', {
    message: props.message,
    chatIds: selectedChats.value
  })

  handleCancel()
}

// Reset selected chats when modal opens
watch(() => props.open, (newVal) => {
  if (newVal) {
    selectedChats.value = []
    searchText.value = ''
  }
})
</script>

<style scoped>
.forward-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-preview {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  border-left: 3px solid #1890ff;
}

.preview-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-author {
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
}

.preview-text {
  font-size: 13px;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-input {
  margin-bottom: 8px;
}

.chat-list {
  max-height: 400px;
  overflow-y: auto;
}

.chat-item {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-item:hover {
  background: #fafafa;
}

.chat-info {
  margin-left: 8px;
}

.chat-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.chat-last {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #8c8c8c;
}

:deep(.ant-checkbox-group) {
  display: flex;
  flex-direction: column;
  width: 100%;
}

:deep(.ant-checkbox-wrapper) {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin: 0;
}
</style>
