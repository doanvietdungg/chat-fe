# Design Document

## Overview

This design document outlines the implementation of advanced Telegram-like features for the chat application. The design focuses on creating a rich, interactive messaging experience with modern UI patterns and smooth user interactions, all implemented as frontend-only features with mock data until backend integration.

## Architecture

### Component Structure
```
Enhanced Chat Components:
├── MessageItem.vue (Enhanced with reactions, replies, editing)
├── MessageReactions.vue (Emoji reactions display)
├── MessageReply.vue (Reply preview and display)
├── MessageContextMenu.vue (Right-click actions)
├── VoiceRecorder.vue (Voice message recording)
├── MediaPreview.vue (Image/video preview)
├── TypingIndicator.vue (Typing status display)
├── SearchModal.vue (Advanced search interface)
├── ForwardModal.vue (Message forwarding)
├── ChatSettings.vue (Chat configuration)
└── KeyboardShortcuts.vue (Shortcut help overlay)
```

### State Management
```javascript
// Enhanced stores
stores/
├── messages.js (Enhanced with reactions, replies, editing)
├── media.js (File upload and preview management)
├── voice.js (Voice recording state)
├── search.js (Search functionality)
├── ui.js (UI state, modals, shortcuts)
└── settings.js (User preferences and chat settings)
```

## Components and Interfaces

### 1. Enhanced MessageItem.vue
```vue
<template>
  <div class="message-item" @contextmenu="showContextMenu">
    <!-- Reply Preview (if replying to another message) -->
    <MessageReply 
      v-if="message.replyTo" 
      :original-message="message.replyTo"
      @click="scrollToMessage"
    />
    
    <!-- Message Content -->
    <div class="message-content">
      <!-- Text with edit functionality -->
      <div v-if="!isEditing" class="message-text">
        {{ message.text }}
        <span v-if="message.edited" class="edited-indicator">edited</span>
      </div>
      
      <!-- Edit mode -->
      <div v-else class="message-edit">
        <a-input 
          v-model:value="editText" 
          @keydown.enter="saveEdit"
          @keydown.esc="cancelEdit"
        />
        <div class="edit-actions">
          <a-button size="small" @click="saveEdit">Save</a-button>
          <a-button size="small" @click="cancelEdit">Cancel</a-button>
        </div>
      </div>
      
      <!-- Media content -->
      <MediaPreview 
        v-if="message.media" 
        :media="message.media"
        @click="openLightbox"
      />
      
      <!-- Voice message -->
      <VoicePlayer 
        v-if="message.voice" 
        :voice-data="message.voice"
      />
    </div>
    
    <!-- Message Reactions -->
    <MessageReactions 
      v-if="message.reactions?.length"
      :reactions="message.reactions"
      @add-reaction="addReaction"
      @remove-reaction="removeReaction"
    />
    
    <!-- Quick reaction bar (on hover) -->
    <div v-if="showQuickReactions" class="quick-reactions">
      <button 
        v-for="emoji in quickEmojis" 
        :key="emoji"
        @click="addReaction(emoji)"
        class="quick-reaction-btn"
      >
        {{ emoji }}
      </button>
      <button @click="showAllReactions" class="more-reactions-btn">
        <SmileOutlined />
      </button>
    </div>
  </div>
</template>
```

### 2. MessageReactions.vue
```vue
<template>
  <div class="message-reactions">
    <div 
      v-for="reaction in groupedReactions" 
      :key="reaction.emoji"
      :class="['reaction-item', { 'user-reacted': reaction.userReacted }]"
      @click="toggleReaction(reaction.emoji)"
    >
      <span class="reaction-emoji">{{ reaction.emoji }}</span>
      <span class="reaction-count">{{ reaction.count }}</span>
    </div>
    
    <a-button 
      type="text" 
      size="small" 
      @click="showReactionPicker"
      class="add-reaction-btn"
    >
      <SmileOutlined />
    </a-button>
  </div>
</template>
```

### 3. VoiceRecorder.vue
```vue
<template>
  <div class="voice-recorder">
    <!-- Recording state -->
    <div v-if="isRecording" class="recording-interface">
      <div class="waveform-container">
        <canvas ref="waveformCanvas" class="waveform"></canvas>
      </div>
      <div class="recording-info">
        <span class="recording-time">{{ formatTime(recordingTime) }}</span>
        <span class="recording-indicator">🔴 Recording...</span>
      </div>
      <div class="recording-actions">
        <a-button @click="cancelRecording" danger>Cancel</a-button>
        <a-button @click="stopRecording" type="primary">Send</a-button>
      </div>
    </div>
    
    <!-- Record button -->
    <a-button 
      v-else
      @mousedown="startRecording"
      @mouseup="stopRecording"
      @mouseleave="cancelRecording"
      class="record-btn"
      shape="circle"
    >
      <AudioOutlined />
    </a-button>
  </div>
</template>
```

### 4. SearchModal.vue
```vue
<template>
  <a-modal 
    v-model:open="visible"
    title="Search Messages"
    width="600px"
    :footer="null"
  >
    <div class="search-interface">
      <!-- Search input with filters -->
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Search messages..."
        @search="performSearch"
        size="large"
      />
      
      <!-- Search filters -->
      <div class="search-filters">
        <a-select v-model:value="searchFilters.sender" placeholder="From">
          <a-select-option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </a-select-option>
        </a-select>
        
        <a-date-picker 
          v-model:value="searchFilters.dateRange" 
          type="range"
          placeholder="Date range"
        />
        
        <a-select v-model:value="searchFilters.type" placeholder="Type">
          <a-select-option value="text">Text</a-select-option>
          <a-select-option value="media">Media</a-select-option>
          <a-select-option value="files">Files</a-select-option>
        </a-select>
      </div>
      
      <!-- Search results -->
      <div class="search-results">
        <div 
          v-for="result in searchResults" 
          :key="result.id"
          class="search-result-item"
          @click="jumpToMessage(result)"
        >
          <div class="result-preview">
            <span class="result-sender">{{ result.sender }}</span>
            <span class="result-text" v-html="highlightText(result.text)"></span>
          </div>
          <div class="result-meta">
            <span class="result-date">{{ formatDate(result.date) }}</span>
            <span class="result-chat">{{ result.chatName }}</span>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
```

### 5. ForwardModal.vue
```vue
<template>
  <a-modal
    v-model:open="visible"
    title="Forward Messages"
    @ok="forwardMessages"
    ok-text="Forward"
    :ok-button-props="{ disabled: !selectedChats.length }"
  >
    <div class="forward-interface">
      <!-- Selected messages preview -->
      <div class="selected-messages">
        <h4>{{ selectedMessages.length }} message(s) selected</h4>
        <div class="message-previews">
          <div 
            v-for="msg in selectedMessages.slice(0, 3)" 
            :key="msg.id"
            class="message-preview"
          >
            {{ truncateText(msg.text, 50) }}
          </div>
          <div v-if="selectedMessages.length > 3" class="more-messages">
            +{{ selectedMessages.length - 3 }} more
          </div>
        </div>
      </div>
      
      <!-- Chat selection -->
      <div class="chat-selection">
        <a-input-search 
          v-model:value="chatSearchQuery"
          placeholder="Search chats..."
          @input="filterChats"
        />
        
        <div class="chat-list">
          <div 
            v-for="chat in filteredChats" 
            :key="chat.id"
            :class="['chat-item', { 'selected': selectedChats.includes(chat.id) }]"
            @click="toggleChatSelection(chat.id)"
          >
            <a-avatar>{{ chat.title[0] }}</a-avatar>
            <span class="chat-name">{{ chat.title }}</span>
            <a-checkbox :checked="selectedChats.includes(chat.id)" />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
```

## Data Models

### Enhanced Message Model
```typescript
interface Message {
  id: string
  text: string
  author: string
  timestamp: string
  edited?: boolean
  editedAt?: string
  replyTo?: {
    id: string
    text: string
    author: string
  }
  reactions?: Reaction[]
  media?: MediaAttachment
  voice?: VoiceMessage
  forwarded?: {
    originalSender: string
    originalChat: string
  }
  readBy?: ReadReceipt[]
}

interface Reaction {
  emoji: string
  users: string[]
  count: number
}

interface MediaAttachment {
  type: 'image' | 'video' | 'file'
  url: string
  thumbnail?: string
  name: string
  size: number
  dimensions?: { width: number, height: number }
}

interface VoiceMessage {
  url: string
  duration: number
  waveform: number[]
}
```

### UI State Model
```typescript
interface UIState {
  activeModals: {
    search: boolean
    forward: boolean
    settings: boolean
  }
  contextMenu: {
    visible: boolean
    x: number
    y: number
    messageId: string
  }
  editingMessage: string | null
  replyingTo: Message | null
  selectedMessages: string[]
  typingUsers: string[]
}
```

## Error Handling

### Graceful Degradation
- Voice recording fallback for unsupported browsers
- Image preview fallback for failed loads
- Search functionality with client-side filtering
- Offline message queuing simulation

### User Feedback
- Loading states for all async operations
- Error messages with retry options
- Success confirmations for actions
- Progress indicators for uploads

## Testing Strategy

### Component Testing
- Message interaction testing (reactions, replies, editing)
- Voice recorder functionality
- Media preview and upload
- Search and filter operations
- Keyboard shortcut handling

### Integration Testing
- Message flow from input to display
- Cross-component communication
- State management consistency
- UI responsiveness across devices

## Performance Considerations

### Optimization Strategies
- Virtual scrolling for large message lists
- Lazy loading of media content
- Debounced search queries
- Efficient reaction rendering
- Voice waveform caching

### Memory Management
- Message cleanup for old conversations
- Media blob cleanup after upload
- Voice recording buffer management
- Search result pagination

## Accessibility

### WCAG Compliance
- Keyboard navigation for all features
- Screen reader support for reactions and media
- High contrast mode support
- Voice message transcription options
- Proper ARIA labels and roles

## Animation and Transitions

### Micro-interactions
- Message send animation
- Reaction pop-in effects
- Typing indicator pulse
- Context menu slide-in
- Modal transitions
- Voice recording waveform animation

### Performance
- CSS transforms for smooth animations
- RequestAnimationFrame for complex animations
- Reduced motion support
- Hardware acceleration where appropriate