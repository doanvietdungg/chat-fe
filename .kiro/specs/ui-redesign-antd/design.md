# Design Document

## Overview

This design document outlines the complete redesign of the chat application user interface from Vuetify to Ant Design Vue. The new design will provide a modern, professional appearance while maintaining all existing functionality and improving user experience.

## Architecture

### Component Structure
```
App.vue (Ant Design Layout)
├── ChatSidebar.vue (Ant Design Sider)
│   ├── Search Input (Input.Search)
│   ├── Action Buttons (Button Group)
│   └── Chat List (List with Avatar)
└── ChatMain.vue (Ant Design Content)
    ├── ChatHeader.vue (Header with Title & Actions)
    ├── MessageArea.vue (Scrollable Message Container)
    └── MessageInput.vue (Input with Actions)
```

### Design System
- **Primary Colors**: Ant Design's default blue palette (#1890ff)
- **Typography**: Ant Design's font system
- **Spacing**: Ant Design's 8px grid system
- **Icons**: Ant Design Icons (@ant-design/icons-vue)
- **Components**: Ant Design Vue 4.x components

## Components and Interfaces

### 1. App.vue - Main Layout
```vue
<template>
  <a-layout class="chat-app">
    <ChatSidebar />
    <ChatMain />
  </a-layout>
</template>
```

**Key Features:**
- Uses `a-layout` for responsive structure
- Full height viewport layout
- Clean, minimal design

### 2. ChatSidebar.vue - Navigation Panel
```vue
<template>
  <a-layout-sider width="320" theme="light">
    <div class="sidebar-header">
      <h3>Chats</h3>
      <a-space>
        <a-button type="text" @click="createGroup">
          <template #icon><UserAddOutlined /></template>
        </a-button>
        <a-button type="text" @click="createChannel">
          <template #icon><SoundOutlined /></template>
        </a-button>
      </a-space>
    </div>
    
    <a-input-search 
      placeholder="Tìm kiếm cuộc trò chuyện"
      @search="onSearch"
    />
    
    <a-list class="chat-list">
      <a-list-item v-for="chat in filteredChats" :key="chat.id">
        <!-- Chat item content -->
      </a-list-item>
    </a-list>
  </a-layout-sider>
</template>
```

**Design Elements:**
- Light theme sidebar with subtle borders
- Compact header with action buttons
- Search input with search icon
- List items with avatars and badges
- Hover effects and active states

### 3. ChatMain.vue - Main Chat Area
```vue
<template>
  <a-layout-content class="chat-main">
    <ChatHeader />
    <MessageArea />
    <MessageInput />
  </a-layout-content>
</template>
```

**Layout:**
- Flexbox column layout
- Header fixed at top
- Message area takes remaining space
- Input fixed at bottom

### 4. ChatHeader.vue - Chat Header
```vue
<template>
  <a-page-header class="chat-header">
    <template #avatar>
      <a-avatar :style="{ backgroundColor: '#1890ff' }">
        {{ activeChat?.title?.[0] }}
      </a-avatar>
    </template>
    
    <template #title>
      <a-space>
        <component :is="getChatIcon(activeChat?.type)" />
        {{ activeChat?.title }}
      </a-space>
    </template>
    
    <template #extra>
      <a-space>
        <a-input-search 
          placeholder="Tìm trong đoạn chat"
          style="width: 280px"
        />
        <a-button type="text" @click="showNotificationSettings">
          <template #icon><BellOutlined /></template>
        </a-button>
        <a-badge :status="isConnected ? 'success' : 'warning'">
          <span>{{ isConnected ? 'Online' : 'Offline' }}</span>
        </a-badge>
      </a-space>
    </template>
  </a-page-header>
</template>
```

**Features:**
- Avatar with chat initial
- Chat type icons (user, group, channel)
- Inline search functionality
- Status indicators with badges
- Clean, professional header design

### 5. MessageArea.vue - Message Display
```vue
<template>
  <div class="message-area" ref="messageContainer">
    <div v-for="message in messages" :key="message.id" 
         :class="['message-wrapper', { 'own-message': isOwnMessage(message) }]">
      
      <a-card 
        :class="['message-card', { 'own-card': isOwnMessage(message) }]"
        size="small"
      >
        <template #title>
          <a-space>
            <a-avatar size="small">{{ message.author[0] }}</a-avatar>
            <span class="message-author">{{ message.author }}</span>
            <a-typography-text type="secondary" class="message-time">
              {{ formatTime(message.at) }}
            </a-typography-text>
          </a-space>
        </template>
        
        <div class="message-content">
          <div v-if="message.file" class="message-file">
            <a-tag icon="file-outlined">
              {{ message.file.name }} ({{ formatFileSize(message.file.size) }})
            </a-tag>
            <a v-if="message.fileUrl" :href="message.fileUrl" target="_blank">
              <a-button type="link" size="small">Tải xuống</a-button>
            </a>
          </div>
          <div v-if="message.text" class="message-text">
            {{ message.text }}
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>
```

**Design Features:**
- Card-based message layout
- Different styling for own vs others' messages
- Avatar and metadata in card header
- File attachment support with tags
- Smooth scrolling and animations

### 6. MessageInput.vue - Message Composer
```vue
<template>
  <div class="message-input-container">
    <a-input 
      v-model:value="messageText"
      placeholder="Nhập tin nhắn..."
      :auto-size="{ minRows: 1, maxRows: 4 }"
      @pressEnter="handleSend"
      class="message-input"
    >
      <template #addonAfter>
        <a-space>
          <a-button type="text" @click="toggleEmojiPicker">
            <template #icon><SmileOutlined /></template>
          </a-button>
          <a-button type="text" @click="selectFile">
            <template #icon><PaperClipOutlined /></template>
          </a-button>
          <a-button type="primary" @click="handleSend">
            Gửi
          </a-button>
        </a-space>
      </template>
    </a-input>
    
    <input ref="fileInput" type="file" style="display: none" @change="handleFileSelect" />
    
    <div v-if="showEmojiPicker" class="emoji-picker-container">
      <Picker @emoji-select="onEmojiSelect" />
    </div>
  </div>
</template>
```

**Features:**
- Auto-resizing text input
- Integrated action buttons
- Emoji picker integration
- File upload functionality
- Modern, clean design

## Data Models

### Chat Object
```typescript
interface Chat {
  id: string
  type: 'private' | 'group' | 'channel'
  title: string
  lastMessage?: string
  unreadCount: number
  pinned: boolean
  muted: boolean
  notificationLevel: 'all' | 'mentions' | 'none'
  avatar?: string
}
```

### Message Object
```typescript
interface Message {
  id: string
  author: string
  text: string
  timestamp: string
  file?: {
    name: string
    size: number
    type: string
    url?: string
  }
  isOwn: boolean
}
```

## Error Handling

### Component Error Boundaries
- Wrap each major component in error boundaries
- Display user-friendly error messages using Ant Design Alert
- Graceful degradation for missing data

### Loading States
- Use Ant Design Skeleton components for loading states
- Spinner indicators for async operations
- Progressive loading for message history

## Testing Strategy

### Unit Tests
- Test component rendering with different props
- Test user interactions (clicks, input changes)
- Test data transformations and computed properties

### Integration Tests
- Test component communication
- Test store integration
- Test API integration points

### Visual Regression Tests
- Screenshot testing for UI consistency
- Cross-browser compatibility testing
- Responsive design testing

## Performance Considerations

### Optimization Strategies
- Virtual scrolling for large message lists
- Lazy loading of images and files
- Component lazy loading
- Efficient re-rendering with proper keys

### Bundle Size
- Tree-shaking unused Ant Design components
- Code splitting for better loading performance
- Optimize images and assets

## Accessibility

### WCAG Compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### Ant Design Accessibility
- Leverage built-in Ant Design accessibility features
- Proper focus management
- Semantic HTML structure

## Migration Strategy

### Phase 1: Dependencies
1. Install Ant Design Vue
2. Remove Vuetify dependencies
3. Update build configuration

### Phase 2: Core Components
1. Replace App.vue layout
2. Migrate ChatSidebar component
3. Update ChatMain layout

### Phase 3: Message Components
1. Redesign MessageArea component
2. Update MessageInput component
3. Implement new ChatHeader

### Phase 4: Polish & Testing
1. Fine-tune styling and animations
2. Add loading states and error handling
3. Comprehensive testing
4. Performance optimization