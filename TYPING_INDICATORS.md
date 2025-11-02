# Typing Indicators System

Hệ thống typing indicators đã được tích hợp vào ứng dụng chat để hiển thị khi người dùng đang nhập tin nhắn.

## 🎯 **Tính năng đã thêm:**

### **1. Chat Store - Typing Subscriptions**
- **Subscribe to typing topic**: `/topic/chats/${chatId}/typing`
- **Send typing events**: `/app/typing.start` và `/app/typing.stop`
- **Methods mới**:
  - `startTyping(chatId)` - Gửi typing start event
  - `stopTyping(chatId)` - Gửi typing stop event

### **2. TypingIndicator Component** (`src/components/TypingIndicator.vue`)
- Hiển thị animated dots khi có người đang typing
- Hỗ trợ multiple users typing
- Text thông minh: "User A đang nhập...", "User A và User B đang nhập...", etc.
- Smooth transitions và animations

### **3. useTypingIndicator Composable** (`src/composables/useTypingIndicator.js`)
- Logic xử lý typing events
- Auto timeout (10 giây)
- Debounced typing detection (2 giây)
- Keyboard event handling
- Cleanup khi component unmount

### **4. MessageInput Integration**
- Tự động detect typing khi user nhập
- Gửi typing start/stop events
- Stop typing khi gửi tin nhắn
- Keyboard shortcuts handling

### **5. MessageArea Integration**
- Hiển thị TypingIndicator ở cuối danh sách tin nhắn
- Smooth animations

## 🔧 **Backend Requirements:**

### **WebSocket Topics cần hỗ trợ:**

#### **1. Subscribe Topic:**
```
/topic/chats/{chatId}/typing
```

**Message format nhận được:**
```json
{
  "userId": "user-123",
  "chatId": "chat-456", 
  "isTyping": true,
  "timestamp": "2024-01-01T10:00:00Z"
}
```

#### **2. Send Destinations:**

**Start Typing:**
```
/app/typing.start
```

**Stop Typing:**
```
/app/typing.stop
```

**Payload gửi đi:**
```json
{
  "chatId": "chat-456",
  "isTyping": true
}
```

### **3. Backend Logic cần implement:**

```java
@MessageMapping("/typing.start")
public void handleTypingStart(TypingEvent event, Principal principal) {
    // Broadcast to other users in chat
    messagingTemplate.convertAndSend(
        "/topic/chats/" + event.getChatId() + "/typing",
        new TypingNotification(principal.getName(), event.getChatId(), true)
    );
}

@MessageMapping("/typing.stop") 
public void handleTypingStop(TypingEvent event, Principal principal) {
    messagingTemplate.convertAndSend(
        "/topic/chats/" + event.getChatId() + "/typing",
        new TypingNotification(principal.getName(), event.getChatId(), false)
    );
}
```

## 🎨 **UI/UX Features:**

### **1. Typing Animation:**
- 3 animated dots với staggered timing
- Smooth bounce animation
- Subtle color và opacity changes

### **2. Smart Text Display:**
- 1 user: "John đang nhập..."
- 2 users: "John và Mary đang nhập..."
- 3 users: "John, Mary và Peter đang nhập..."
- 4+ users: "John, Mary và 2 người khác đang nhập..."

### **3. Auto Timeout:**
- Typing tự động stop sau 10 giây không activity
- Debounce 2 giây để tránh spam events
- Cleanup khi user rời khỏi chat

## 🧪 **Testing:**

### **1. Manual Testing:**
1. Mở 2 browser tabs với 2 user khác nhau
2. Vào cùng 1 chat
3. Nhập tin nhắn ở tab 1 → tab 2 sẽ thấy typing indicator
4. Stop typing → indicator biến mất

### **2. Demo Testing:**
- Truy cập `/demo/notifications`
- Click "Test Typing" để test typing indicator
- Xem TypingIndicator component hoạt động

### **3. Component Testing:**
```javascript
// Test trong console
const messagesStore = useMessagesStore()

// Start typing
messagesStore.setTyping('user-123', true)

// Stop typing  
messagesStore.setTyping('user-123', false)

// Multiple users typing
messagesStore.setTyping('user-123', true)
messagesStore.setTyping('user-456', true)

// Test typing timeout (10 seconds)
messagesStore.setTyping('user-123', true)
// Will auto stop after 10 seconds
```

## 📱 **Responsive Design:**
- Mobile-friendly sizing
- Touch-optimized
- Proper spacing trên các screen sizes

## ♿ **Accessibility:**
- Screen reader friendly
- Proper ARIA labels
- Keyboard navigation support

## 🔄 **Integration Status:**

### ✅ **Đã hoàn thành:**
- [x] Chat store typing subscriptions
- [x] TypingIndicator component
- [x] useTypingIndicator composable  
- [x] MessageInput integration
- [x] MessageArea integration
- [x] Demo testing

### ⏳ **Cần backend support:**
- [ ] `/topic/chats/{chatId}/typing` subscription
- [ ] `/app/typing.start` endpoint
- [ ] `/app/typing.stop` endpoint
- [ ] User authentication trong typing events
- [ ] Rate limiting cho typing events

## 🚀 **Cách sử dụng:**

### **1. Trong Component:**
```vue
<template>
  <TypingIndicator />
</template>

<script setup>
import TypingIndicator from '@/components/TypingIndicator.vue'
</script>
```

### **2. Trong Composable:**
```javascript
import { useTypingIndicator } from '@/composables/useTypingIndicator'

const { startTyping, stopTyping, isTyping } = useTypingIndicator(chatId)
```

### **3. Manual Control:**
```javascript
import { useMessagesStore } from '@/store/messages'

const messagesStore = useMessagesStore()

// Set typing state
messagesStore.setTyping('user-id', true)
messagesStore.setTyping('user-id', false)
```

---

**Typing indicators system đã sẵn sàng! Chỉ cần backend hỗ trợ WebSocket endpoints.** 🎉