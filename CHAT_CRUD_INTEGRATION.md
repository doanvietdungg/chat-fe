# Chat CRUD API Integration

Hệ thống CRUD hoàn chỉnh cho chat management đã được tích hợp vào ứng dụng.

## 🚀 **Components đã tạo:**

### **1. ChatCrudService** (`src/services/chatCrudService.js`)
- Service class quản lý tất cả CRUD operations
- Error handling và success messages
- File upload với progress tracking
- Batch operations (create private/group chat, leave, archive, etc.)

### **2. Updated Chats Store** (`src/store/chats.js`)
- Tích hợp CRUD methods vào store
- Local state synchronization
- Async operations với error handling

### **3. Updated ChatHeader** (`src/components/ChatHeader.vue`)
- 3 icons giống Telegram: 🔍 Search, 📞 Call, 📹 Video, ⋮ More
- Light theme Telegram Sidebar
- Modern button styling

## 🎯 **CRUD Operations Available:**

### **Chat Management:**
```javascript
const chatsStore = useChatsStore()

// Create new chat
await chatsStore.createChat({
  type: 'PRIVATE', // or 'GROUP'
  title: 'Chat Name',
  description: 'Optional description',
  otherUserId: 'user-123' // for private chat
})

// Update chat
await chatsStore.updateChat('chat-id', {
  title: 'New Name',
  description: 'New description'
})

// Delete chat
await chatsStore.deleteChat('chat-id')

// Get chat details
const chatDetails = await chatsStore.getChatDetails('chat-id')
```

### **Participant Management:**
```javascript
// Get participants
const participants = await chatsStore.getChatParticipants('chat-id')

// Add participants
await chatsStore.addParticipants('chat-id', ['user-1', 'user-2'])

// Remove participant
await chatsStore.removeParticipant('chat-id', 'user-id')

// Update role
await chatsStore.updateParticipantRole('chat-id', 'user-id', 'ADMIN')

// Leave chat
await chatsStore.leaveChat('chat-id')
```

### **Chat Actions:**
```javascript
// Archive/Unarchive
await chatsStore.archiveChat('chat-id')
await chatsStore.unarchiveChat('chat-id')

// Mute/Unmute
await chatsStore.muteChat('chat-id')
await chatsStore.unmuteChat('chat-id')

// Pin/Unpin
await chatsStore.pinChat('chat-id')
await chatsStore.unpinChat('chat-id')
```

### **Message Operations:**
```javascript
import { chatCrudService } from '@/services/chatCrudService'

// Send message
await chatCrudService.sendMessage('chat-id', {
  text: 'Hello world!',
  type: 'TEXT'
})

// Send file message
await chatCrudService.sendFileMessage(
  'chat-id', 
  file, 
  'Optional caption',
  (progress) => console.log(`Upload: ${progress}%`)
)

// Edit message
await chatCrudService.editMessage('message-id', {
  text: 'Updated text'
})

// Delete message
await chatCrudService.deleteMessage('message-id')
```

## 🎨 **UI Updates:**

### **ChatHeader với Telegram Icons:**
```
[Avatar] [Chat Name]     [🔍] [📞] [📹] [⋮]
[Status]
```

- **🔍 Search:** Toggle search functionality
- **📞 Call:** Start voice call
- **📹 Video:** Start video call  
- **⋮ More:** Open light theme sidebar

### **Light Theme Sidebar:**
- **Background:** White (#ffffff)
- **Text:** Dark (#262626)
- **Borders:** Light gray (#f0f0f0)
- **Hover:** Light gray (#f5f5f5)
- **Same functionality** as dark theme

## 🔧 **API Endpoints:**

### **Chat Endpoints:**
```
GET    /api/v1/chats                    # Get all chats
POST   /api/v1/chats                    # Create chat
GET    /api/v1/chats/{id}               # Get chat details
PUT    /api/v1/chats/{id}               # Update chat
DELETE /api/v1/chats/{id}               # Delete chat
```

### **Participant Endpoints:**
```
GET    /api/v1/chats/{id}/participants        # Get participants
POST   /api/v1/chats/{id}/participants        # Add participants
PUT    /api/v1/chats/{id}/participants/{uid}  # Update role
DELETE /api/v1/chats/{id}/participants/{uid}  # Remove participant
```

### **Message Endpoints:**
```
GET    /api/v1/chats/{id}/messages      # Get messages
POST   /api/v1/chats/{id}/messages      # Send message
PUT    /api/v1/messages/{id}            # Edit message
DELETE /api/v1/messages/{id}            # Delete message
```

### **File Endpoints:**
```
POST   /api/v1/files/upload             # Upload file
GET    /api/v1/files/{id}               # Get file
DELETE /api/v1/files/{id}               # Delete file
```

## 🧪 **Usage Examples:**

### **1. Create Private Chat:**
```javascript
const chatsStore = useChatsStore()

try {
  const newChat = await chatsStore.createChat({
    type: 'PRIVATE',
    title: 'John Doe',
    otherUserId: 'user-123'
  })
  
  console.log('Chat created:', newChat.id)
} catch (error) {
  console.error('Failed to create chat:', error)
}
```

### **2. Send File Message:**
```javascript
import { chatCrudService } from '@/services/chatCrudService'

const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

try {
  const message = await chatCrudService.sendFileMessage(
    'chat-123',
    file,
    'Check out this image!',
    (progress) => {
      console.log(`Upload progress: ${progress}%`)
    }
  )
  
  console.log('File message sent:', message.id)
} catch (error) {
  console.error('Failed to send file:', error)
}
```

### **3. Manage Chat Participants:**
```javascript
const chatsStore = useChatsStore()

try {
  // Add multiple users to group chat
  await chatsStore.addParticipants('group-chat-id', [
    'user-1', 'user-2', 'user-3'
  ])
  
  // Make user admin
  await chatsStore.updateParticipantRole('group-chat-id', 'user-1', 'ADMIN')
  
  // Remove user
  await chatsStore.removeParticipant('group-chat-id', 'user-2')
  
} catch (error) {
  console.error('Failed to manage participants:', error)
}
```

## 🔄 **Error Handling:**

### **Automatic Error Messages:**
- Success operations show green toast messages
- Errors show red toast messages with details
- Network errors are handled gracefully
- Token refresh is automatic

### **Custom Error Handling:**
```javascript
try {
  await chatsStore.createChat(chatData)
} catch (error) {
  if (error.response?.status === 403) {
    console.log('Permission denied')
  } else if (error.response?.status === 404) {
    console.log('Chat not found')
  } else {
    console.log('Unknown error:', error.message)
  }
}
```

## 📱 **Integration Status:**

### ✅ **Completed:**
- [x] ChatCrudService with all CRUD operations
- [x] Chats store integration
- [x] Error handling và success messages
- [x] File upload với progress
- [x] Batch operations
- [x] ChatHeader với Telegram icons
- [x] Light theme sidebar
- [x] API endpoint mapping

### 🔄 **Ready for Backend:**
- [ ] Backend API implementation
- [ ] WebSocket integration for real-time updates
- [ ] File storage configuration
- [ ] Permission system
- [ ] Rate limiting

## 🚀 **Next Steps:**

1. **Backend Implementation:** Implement corresponding API endpoints
2. **WebSocket Integration:** Real-time chat updates
3. **File Storage:** Configure file upload/download
4. **Testing:** Unit tests for CRUD operations
5. **Performance:** Optimize for large chat lists

---

**Chat CRUD system đã sẵn sàng! Frontend hoàn chỉnh, chỉ cần backend API.** 🎉