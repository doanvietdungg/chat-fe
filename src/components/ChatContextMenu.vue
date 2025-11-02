<template>
  <div 
    v-if="visible" 
    class="context-menu-overlay" 
    @click="closeMenu"
    @contextmenu.prevent
  >
    <div 
      class="context-menu" 
      :style="{ top: position.y + 'px', left: position.x + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="openInNewWindow">
        <div class="menu-icon">
          <ExportOutlined />
        </div>
        <span class="menu-text">Open in new window</span>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="archiveChat">
        <div class="menu-icon">
          <InboxOutlined />
        </div>
        <span class="menu-text">Archive</span>
      </div>

      <div class="menu-item" @click="pinChat">
        <div class="menu-icon">
          <PushpinOutlined />
        </div>
        <span class="menu-text">{{ chatData?.pinned ? 'Unpin' : 'Pin' }}</span>
      </div>

      <div class="menu-item" @click="muteNotifications">
        <div class="menu-icon">
          <SoundOutlined v-if="chatData?.muted" />
          <SoundFilled v-else />
        </div>
        <span class="menu-text">{{ chatData?.muted ? 'Unmute' : 'Mute' }} notifications</span>
        <div class="menu-arrow">
          <RightOutlined />
        </div>
      </div>

      <div class="menu-item" @click="markAsUnread">
        <div class="menu-icon">
          <MessageOutlined />
        </div>
        <span class="menu-text">Mark as unread</span>
      </div>

      <div class="menu-item" @click="addToFolder">
        <div class="menu-icon">
          <FolderAddOutlined />
        </div>
        <span class="menu-text">Add to folder</span>
        <div class="menu-arrow">
          <RightOutlined />
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="clearHistory">
        <div class="menu-icon">
          <ClearOutlined />
        </div>
        <span class="menu-text">Clear history</span>
      </div>

      <div class="menu-item danger" @click="deleteChat">
        <div class="menu-icon">
          <DeleteOutlined />
        </div>
        <span class="menu-text">Delete chat</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ExportOutlined,
  InboxOutlined,
  PushpinOutlined,
  SoundOutlined,
  SoundFilled,
  MessageOutlined,
  FolderAddOutlined,
  ClearOutlined,
  DeleteOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { useChatsStore } from '../store/chats'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  chatData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'action'])

const chatsStore = useChatsStore()

// Methods
function closeMenu() {
  emit('close')
}

function openInNewWindow() {
  if (props.chatData?.id) {
    const url = `/chat/${props.chatData.id}`
    window.open(url, '_blank', 'width=1200,height=800')
    message.success('Opened chat in new window')
  }
  closeMenu()
}

async function archiveChat() {
  if (!props.chatData?.id) return
  
  try {
    if (props.chatData.archived) {
      await chatsStore.unarchiveChat(props.chatData.id)
      message.success('Chat unarchived')
    } else {
      await chatsStore.archiveChat(props.chatData.id)
      message.success('Chat archived')
    }
    emit('action', 'archive')
  } catch (error) {
    message.error('Failed to archive chat')
  }
  closeMenu()
}

async function pinChat() {
  if (!props.chatData?.id) return
  
  try {
    if (props.chatData.pinned) {
      await chatsStore.unpinChat(props.chatData.id)
      message.success('Chat unpinned')
    } else {
      await chatsStore.pinChat(props.chatData.id)
      message.success('Chat pinned')
    }
    emit('action', 'pin')
  } catch (error) {
    message.error('Failed to pin chat')
  }
  closeMenu()
}

async function muteNotifications() {
  if (!props.chatData?.id) return
  
  try {
    if (props.chatData.muted) {
      await chatsStore.unmuteChat(props.chatData.id)
      message.success('Chat unmuted')
    } else {
      await chatsStore.muteChat(props.chatData.id)
      message.success('Chat muted')
    }
    emit('action', 'mute')
  } catch (error) {
    message.error('Failed to mute chat')
  }
  closeMenu()
}

function markAsUnread() {
  if (!props.chatData?.id) return
  
  // Update local state to show as unread
  const chat = chatsStore.state.chats.find(c => c.id === props.chatData.id)
  if (chat) {
    chat.unread = Math.max(1, chat.unread || 0)
  }
  
  message.success('Marked as unread')
  emit('action', 'mark-unread')
  closeMenu()
}

function addToFolder() {
  message.info('Add to folder feature coming soon')
  closeMenu()
}

function clearHistory() {
  if (!props.chatData?.id) return
  
  Modal.confirm({
    title: 'Clear chat history?',
    content: 'This will delete all messages in this chat. This action cannot be undone.',
    okText: 'Clear',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        // In real app, call API to clear history
        message.success('Chat history cleared')
        emit('action', 'clear-history')
      } catch (error) {
        message.error('Failed to clear history')
      }
    }
  })
  closeMenu()
}

function deleteChat() {
  if (!props.chatData?.id) return
  
  Modal.confirm({
    title: 'Delete chat?',
    content: `Are you sure you want to delete "${props.chatData.title}"? This action cannot be undone.`,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        await chatsStore.deleteChat(props.chatData.id)
        message.success('Chat deleted')
        emit('action', 'delete')
      } catch (error) {
        message.error('Failed to delete chat')
      }
    }
  })
  closeMenu()
}
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: transparent;
}

.context-menu {
  position: absolute;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e8e8e8;
  min-width: 220px;
  padding: 8px 0;
  z-index: 2001;
  animation: contextMenuFadeIn 0.15s ease-out;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  gap: 12px;
  font-size: 14px;
  color: #262626;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.danger {
  color: #ff4d4f;
}

.menu-item.danger:hover {
  background-color: #fff2f0;
}

.menu-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: inherit;
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  color: inherit;
  font-weight: 400;
}

.menu-arrow {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #8c8c8c;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 8px 0;
}

/* Responsive positioning */
@media (max-width: 768px) {
  .context-menu {
    min-width: 200px;
    max-width: calc(100vw - 32px);
  }
}

/* Prevent menu from going off-screen */
.context-menu {
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

/* Custom scrollbar for menu */
.context-menu::-webkit-scrollbar {
  width: 6px;
}

.context-menu::-webkit-scrollbar-track {
  background: transparent;
}

.context-menu::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.context-menu::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>