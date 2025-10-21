# Frontend-Backend Integration Guide

## Quick Start

### 1. Environment Setup
Create `.env` file in `chat-frontend/`:
```env
VUE_APP_API_URL=http://localhost:8080/api/v1
VUE_APP_WS_URL=http://localhost:8080/ws
```

### 2. Install Dependencies
```bash
cd chat-frontend
npm install
```

### 3. Start Development
```bash
npm run dev
```

## Integration Steps

### Step 1: Replace Mock Data with Real APIs

#### Update Chat Store (`src/store/chats.js`)
```javascript
import { chatAPI } from '../services/api'

// Replace mock data with API calls
export function useChatsStore() {
  async function loadChats() {
    try {
      const response = await chatAPI.getChats()
      state.chats = response.data.chats
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  }

  async function createGroup(title) {
    try {
      const response = await chatAPI.createChat({
        type: 'group',
        title,
        participantIds: []
      })
      state.chats.unshift(response.data.chat)
      state.activeChatId = response.data.chat.id
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }
}
```

#### Update Message Store (`src/store/chat.js`)
```javascript
import { messageAPI, wsService } from '../services/api'

export function useChatStore() {
  async function loadMessages(chatId) {
    try {
      const response = await messageAPI.getMessages(chatId)
      state.messages = response.data.messages
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  async function sendMessage(text) {
    try {
      const response = await messageAPI.sendMessage(state.activeChatId, {
        text,
        type: 'text'
      })
      
      // Add to local state
      state.messages.push(response.data.message)
      
      // Send via WebSocket for real-time
      wsService.send('message_sent', {
        chatId: state.activeChatId,
        message: response.data.message
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
}
```

### Step 2: Add Authentication

#### Create Auth Store (`src/store/auth.js`)
```javascript
import { reactive } from 'vue'
import { authAPI } from '../services/api'

const state = reactive({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false
})

export function useAuthStore() {
  async function login(credentials) {
    try {
      const response = await authAPI.login(credentials)
      state.user = response.data.user
      state.token = response.data.token
      state.isAuthenticated = true
      localStorage.setItem('auth_token', state.token)
      return response
    } catch (error) {
      throw error
    }
  }

  async function register(userData) {
    try {
      const response = await authAPI.register(userData)
      state.user = response.data.user
      state.token = response.data.token
      state.isAuthenticated = true
      localStorage.setItem('auth_token', state.token)
      return response
    } catch (error) {
      throw error
    }
  }

  function logout() {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('auth_token')
    authAPI.logout()
  }

  return {
    state,
    login,
    register,
    logout
  }
}
```

#### Create Login Component (`src/components/LoginForm.vue`)
```vue
<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              />
              <v-btn type="submit" color="primary" block>Login</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await auth.login({
      email: email.value,
      password: password.value
    })
    // Redirect to chat
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
```

### Step 3: Add Real-time WebSocket

#### Update Chat Window (`src/components/ChatWindow.vue`)
```javascript
import { wsService } from '../services/api'

onMounted(() => {
  // Connect WebSocket
  const token = localStorage.getItem('auth_token')
  if (token) {
    wsService.connect(token)
    
    // Listen for real-time events
    wsService.on('message.sent', (data) => {
      if (data.chat.id === chats.state.activeChatId) {
        chat.state.messages.push(data.message)
      }
    })
    
    wsService.on('typing.start', (data) => {
      // Show typing indicator
    })
    
    wsService.on('typing.stop', (data) => {
      // Hide typing indicator
    })
  }
})

function handleSend(text) {
  chat.sendMessage(text)
  
  // Send typing stop
  wsService.stopTyping(chats.state.activeChatId)
}

function handleTyping() {
  // Send typing start
  wsService.startTyping(chats.state.activeChatId)
}
```

### Step 4: Add File Upload

#### Update Message Input (`src/components/MessageInput.vue`)
```javascript
import { fileAPI } from '../services/api'

async function onFile(e) {
  const file = e.target.files?.[0]
  if (file) {
    try {
      const response = await fileAPI.uploadFile(file, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      
      emit('attach', response.data.file)
    } catch (error) {
      console.error('File upload failed:', error)
    }
  }
  e.target.value = ''
}
```

### Step 5: Add Error Handling

#### Create Error Handler (`src/utils/errorHandler.js`)
```javascript
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
        break
      case 403:
        // Forbidden
        showError('You do not have permission to perform this action')
        break
      case 404:
        // Not found
        showError('Resource not found')
        break
      case 422:
        // Validation error
        showError(data.error?.message || 'Invalid input data')
        break
      case 500:
        // Server error
        showError('Server error. Please try again later.')
        break
      default:
        showError(data.error?.message || 'An error occurred')
    }
  } else if (error.request) {
    // Network error
    showError('Network error. Please check your connection.')
  } else {
    // Other error
    showError('An unexpected error occurred')
  }
}

function showError(message) {
  // Use your preferred notification system
  console.error(message)
  // Example: toast.error(message)
}
```

## Testing Integration

### 1. Mock Backend for Development
Create `src/services/mockApi.js`:
```javascript
// Mock API responses for development
export const mockChats = [
  {
    id: 'chat_1',
    type: 'private',
    title: 'John Doe',
    lastMessage: {
      text: 'Hello!',
      timestamp: new Date().toISOString()
    },
    unreadCount: 2
  }
]

export const mockMessages = [
  {
    id: 'msg_1',
    text: 'Hello!',
    authorId: 'user_1',
    authorName: 'John Doe',
    timestamp: new Date().toISOString()
  }
]
```

### 2. Environment-based API Selection
```javascript
// In api.js
const isDevelopment = process.env.NODE_ENV === 'development'
const useMockApi = process.env.VUE_APP_USE_MOCK_API === 'true'

if (isDevelopment && useMockApi) {
  // Use mock API
  export const chatAPI = mockChatAPI
} else {
  // Use real API
  export const chatAPI = realChatAPI
}
```

## Deployment Checklist

### Frontend
- [ ] Set production API URLs in environment variables
- [ ] Build and test production build
- [ ] Configure CORS on backend
- [ ] Setup SSL certificates
- [ ] Configure CDN for static assets

### Backend
- [ ] Setup production database
- [ ] Configure Redis for caching
- [ ] Setup file storage (S3/Cloudinary)
- [ ] Configure WebSocket server
- [ ] Setup monitoring and logging
- [ ] Configure load balancing

### Security
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Setup rate limiting
- [ ] Validate all inputs
- [ ] Sanitize file uploads
- [ ] Implement proper authentication

## Common Issues & Solutions

### 1. CORS Errors
```javascript
// Backend CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}))
```

### 2. WebSocket Connection Issues
```javascript
// Check WebSocket URL and token
const wsUrl = `${process.env.VUE_APP_WS_URL}?token=${token}`
console.log('Connecting to:', wsUrl)
```

### 3. File Upload Size Limits
```javascript
// Backend file size limit
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
```

### 4. Authentication Token Expiry
```javascript
// Auto-refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken)
          localStorage.setItem('auth_token', response.data.token)
          // Retry original request
          return api.request(error.config)
        } catch (refreshError) {
          // Refresh failed, redirect to login
          authAPI.logout()
        }
      }
    }
    return Promise.reject(error)
  }
)
```

## Performance Optimization

### 1. Message Pagination
```javascript
// Load messages in chunks
async function loadMoreMessages() {
  const lastMessage = state.messages[0]
  const response = await messageAPI.getMessages(chatId, {
    before: lastMessage?.id,
    limit: 50
  })
  state.messages.unshift(...response.data.messages)
}
```

### 2. Virtual Scrolling
```vue
<!-- For large message lists -->
<v-virtual-scroll
  :items="messages"
  :item-height="80"
  height="400"
>
  <template #default="{ item }">
    <MessageItem :message="item" />
  </template>
</v-virtual-scroll>
```

### 3. Image Lazy Loading
```vue
<!-- Lazy load images -->
<img
  :src="message.imageUrl"
  loading="lazy"
  @error="handleImageError"
/>
```

This guide provides a complete roadmap for integrating the Vue.js frontend with a backend API. Follow the steps in order and test each integration point before moving to the next.


