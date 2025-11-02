# Message Context Menu

Hệ thống context menu cho tin nhắn với đầy đủ tính năng như Telegram/Discord.

## 🎯 Tính năng

### Quick Reactions Bar
- Hiển thị thanh emoji phản ứng nhanh khi nhấn chuột phải
- 7 emoji phổ biến: 👍 😂 ❤️ 😮 😢 😱 🔥
- Nút "More" để mở reaction picker đầy đủ
- Animation mượt mà với backdrop blur

### Context Menu Actions
- **Reply**: Trả lời tin nhắn
- **Edit**: Chỉnh sửa tin nhắn (chỉ tin nhắn của mình)
- **Pin**: Ghim tin nhắn
- **Copy Text**: Sao chép nội dung tin nhắn
- **Copy Message Link**: Sao chép link tin nhắn
- **Forward**: Chuyển tiếp tin nhắn
- **Delete**: Xóa tin nhắn (chỉ tin nhắn của mình)
- **Select**: Chọn tin nhắn để thao tác hàng loạt

## 🚀 Cách sử dụng

### 1. Tích hợp vào MessageArea

```vue
<template>
  <div class="message-area">
    <!-- Messages -->
    <div 
      v-for="message in messages"
      :key="message.id"
      @contextmenu="showMessageContextMenu($event, message)"
    >
      <!-- Message content -->
    </div>

    <!-- Context Menu -->
    <MessageContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :message-data="contextMenuMessage"
      @close="closeContextMenu"
      @action="handleContextMenuAction"
    />
  </div>
</template>

<script setup>
import MessageContextMenu from './MessageContextMenu.vue'

const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuMessage = ref(null)

function showMessageContextMenu(event, message) {
  event.preventDefault()
  
  contextMenuMessage.value = message
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuVisible.value = true
}

function closeContextMenu() {
  contextMenuVisible.value = false
  contextMenuMessage.value = null
}

function handleContextMenuAction(action, data) {
  switch (action) {
    case 'reply':
      // Handle reply
      break
    case 'edit':
      // Handle edit
      break
    // ... other actions
  }
}
</script>
```

### 2. Props của MessageContextMenu

```typescript
interface Props {
  visible: boolean           // Hiển thị context menu
  position: {               // Vị trí hiển thị
    x: number
    y: number
  }
  messageData: {            // Dữ liệu tin nhắn
    id: string
    text: string
    authorId: string
    senderId: string
    // ... other message fields
  }
  showReactions: boolean    // Hiển thị thanh reactions (default: true)
}
```

### 3. Events

```typescript
interface Events {
  close: () => void                    // Đóng context menu
  action: (action: string, data: any) => void  // Thực hiện action
}
```

### 4. Actions được hỗ trợ

| Action | Description | Data |
|--------|-------------|------|
| `reply` | Trả lời tin nhắn | Message object |
| `edit` | Chỉnh sửa tin nhắn | Message object |
| `react` | Thêm reaction | `{ emoji: string }` |
| `copy-text` | Sao chép text | - |
| `copy-link` | Sao chép link | - |
| `forward` | Chuyển tiếp | Message object |
| `delete` | Xóa tin nhắn | Message object |
| `pin` | Ghim tin nhắn | Message object |
| `select` | Chọn tin nhắn | Message object |
| `show-more-reactions` | Mở reaction picker | - |

## 🎨 Demo

### Truy cập demo trực tiếp:
```
http://localhost:5173/demo/context-menu
```

### Hoặc từ trang demo chính:
```
http://localhost:5173/demo
```
Scroll xuống section "Message Context Menu"

## 🔧 Tùy chỉnh

### 1. Thay đổi quick reactions
```javascript
// Trong MessageContextMenu.vue
const quickEmojis = ['👍', '😂', '❤️', '😮', '😢', '😱', '🔥']
```

### 2. Tùy chỉnh permissions
```javascript
const canEdit = computed(() => {
  return props.messageData?.senderId === authStore.currentUser?.id
})

const canDelete = computed(() => {
  return props.messageData?.senderId === authStore.currentUser?.id
})
```

### 3. Tùy chỉnh styling
```css
/* Dark theme */
@media (prefers-color-scheme: dark) {
  .context-menu {
    background: #2f2f2f;
    border-color: #404040;
    color: #ffffff;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .context-menu {
    min-width: 180px;
    max-width: calc(100vw - 32px);
  }
}
```

## 🔗 Dependencies

- Vue 3 Composition API
- Ant Design Vue (icons, message, modal)
- Store: `useMessagesStore`, `useAuthStore`

## 📱 Responsive Design

- Tự động điều chỉnh vị trí để không bị cắt màn hình
- Responsive width trên mobile
- Touch-friendly trên thiết bị cảm ứng
- Custom scrollbar cho menu dài

## 🎯 Best Practices

1. **Performance**: Context menu chỉ render khi visible = true
2. **Accessibility**: Hỗ trợ keyboard navigation và screen readers
3. **UX**: Animation mượt mà, feedback rõ ràng cho mỗi action
4. **Security**: Kiểm tra permissions trước khi hiển thị actions
5. **Mobile**: Tối ưu cho cả desktop và mobile

## 🐛 Troubleshooting

### Context menu không hiển thị
- Kiểm tra `visible` prop
- Kiểm tra `position` có hợp lệ không
- Kiểm tra z-index conflicts

### Actions không hoạt động
- Kiểm tra event handler `@action`
- Kiểm tra store methods (addReaction, deleteMessage, etc.)
- Kiểm tra permissions (canEdit, canDelete)

### Positioning issues
- Context menu tự động điều chỉnh vị trí
- Kiểm tra viewport boundaries
- Kiểm tra parent container overflow

## 📝 TODO

- [ ] Keyboard shortcuts (Ctrl+R for reply, etc.)
- [ ] Drag & drop support
- [ ] Voice message actions
- [ ] File attachment actions
- [ ] Multi-select mode
- [ ] Custom action plugins