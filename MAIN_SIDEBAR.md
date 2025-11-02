# Main Sidebar

Sidebar chính kiểu Telegram với hamburger menu toggle và đầy đủ tính năng.

## 🎯 Tính năng

### Hamburger Menu
- Nút toggle (3 gạch) ở góc trên trái
- Animation smooth khi mở/đóng
- Thay đổi màu khi active
- Responsive trên mobile

### User Profile Section
- Avatar và tên người dùng hiện tại
- "Set Emoji Status" option
- Collapse/expand animation
- Click để xem profile

### Multiple Accounts
- Danh sách tài khoản với avatar
- Badge hiển thị số tin nhắn chưa đọc
- Switch giữa các tài khoản
- "Add Account" option với icon +

### Main Menu
- **My Profile**: Xem/chỉnh sửa profile
- **Wallet**: Tính năng ví điện tử
- **New Group**: Tạo nhóm mới
- **New Channel**: Tạo kênh mới
- **Contacts**: Danh bạ liên hệ
- **Calls**: Lịch sử cuộc gọi
- **Saved Messages**: Tin nhắn đã lưu
- **Settings**: Cài đặt ứng dụng
- **Night Mode**: Toggle chế độ tối

### Footer
- Thông tin ứng dụng
- Version number
- About link

## 🚀 Cách sử dụng

### 1. Basic Integration

```vue
<template>
  <div class="app">
    <!-- Main Sidebar -->
    <MainSidebar 
      v-model:visible="sidebarVisible"
      @menu-click="handleMenuClick"
    />
    
    <!-- Your app content -->
    <div class="main-content">
      <!-- Content here -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MainSidebar from './components/MainSidebar.vue'

const sidebarVisible = ref(false)

function handleMenuClick(menuItem) {
  console.log('Menu clicked:', menuItem.key)
  
  switch (menuItem.key) {
    case 'profile':
      // Navigate to profile
      break
    case 'settings':
      // Open settings
      break
    // ... handle other menu items
  }
}
</script>
```

### 2. Props

```typescript
interface Props {
  visible: boolean  // Hiển thị sidebar
}
```

### 3. Events

```typescript
interface Events {
  'update:visible': (visible: boolean) => void  // Thay đổi visibility
  'menu-click': (menuItem: MenuItem) => void    // Click menu item
}

interface MenuItem {
  key: string      // Unique key
  label: string    // Display text
  icon: Component  // Ant Design icon
  badge: number    // Badge count
}
```

## 🎨 Demo

### Truy cập demo:
- **Standalone Demo**: `http://localhost:5173/demo/sidebar`
- **Integrated Demo**: `http://localhost:5173/demo` → scroll to "Main Sidebar"
- **In Chat App**: `http://localhost:5173/chat` → click hamburger menu

### Demo features:
- Interactive menu testing
- Action logging
- Night mode toggle
- Notification simulation
- Responsive testing

## 🔧 Customization

### 1. Menu Items

```javascript
// Trong MainSidebar.vue
const menuItems = ref([
  {
    key: 'custom-item',
    label: 'Custom Menu',
    icon: CustomIcon,
    badge: 5
  },
  // ... other items
])
```

### 2. Account List

```javascript
// Mock hoặc từ API
const accounts = ref([
  {
    id: 'user1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    unreadCount: 10
  }
])
```

### 3. Styling

```css
/* Custom colors */
.main-sidebar {
  --sidebar-bg: #2c3e50;
  --sidebar-text: #ecf0f1;
  --sidebar-hover: rgba(255, 255, 255, 0.05);
  --sidebar-border: #34495e;
}

/* Dark theme */
:global(.dark-theme) .main-sidebar {
  --sidebar-bg: #1a1a1a;
  --sidebar-text: #ffffff;
}
```

### 4. Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .main-sidebar {
    width: 100vw;
    max-width: 320px;
  }
}

/* Tablet */
@media (max-width: 1024px) {
  .main-sidebar {
    width: 260px;
  }
}
```

## 🎯 Features Checklist

- [x] Hamburger menu toggle
- [x] User profile section
- [x] Multiple account switching
- [x] Unread message badges
- [x] Complete menu items
- [x] Night mode toggle
- [x] Smooth animations
- [x] Responsive design
- [x] Keyboard shortcuts (ESC)
- [x] Click outside to close
- [x] Telegram-style design
- [x] Custom scrollbar
- [x] Badge animations
- [x] Menu item hover effects

## 📱 Responsive Design

### Desktop (>1024px)
- Full sidebar width (280px)
- Hover effects
- All features visible

### Tablet (768px - 1024px)
- Reduced width (260px)
- Touch-friendly
- Overlay mode

### Mobile (<768px)
- Full-screen overlay
- Touch gestures
- Simplified layout
- Auto-close after selection

## 🔑 Keyboard Shortcuts

- **ESC**: Close sidebar
- **Tab**: Navigate menu items
- **Enter**: Activate menu item
- **Space**: Toggle switches

## 🎨 Animations

### Sidebar
- Slide in/out from left
- 0.3s ease transition
- Backdrop fade

### Menu Items
- Hover background change
- Left border animation
- Icon color transitions

### Badges
- Pulse animation
- Scale on update
- Color transitions

## 🔧 Integration với Chat App

### ChatView Integration
```vue
<!-- Trong ChatView.vue -->
<template>
  <a-layout class="chat-app">
    <MainSidebar 
      v-model:visible="mainSidebarVisible"
      @menu-click="handleMainSidebarClick"
    />
    <ChatSidebar />
    <ChatMain />
  </a-layout>
</template>
```

### Store Integration
```javascript
// Có thể tích hợp với stores
import { useAuthStore } from '../store/auth'
import { useChatsStore } from '../store/chats'

// Lấy user info từ auth store
const currentUser = computed(() => authStore.user)

// Lấy unread counts từ chats store
const unreadCount = computed(() => chatsStore.totalUnreadCount)
```

## 🐛 Troubleshooting

### Sidebar không hiển thị
- Kiểm tra `visible` prop
- Kiểm tra z-index conflicts
- Kiểm tra CSS transforms

### Menu items không click được
- Kiểm tra event handlers
- Kiểm tra pointer-events CSS
- Kiểm tra overlay blocking

### Responsive issues
- Kiểm tra viewport meta tag
- Kiểm tra CSS media queries
- Test trên thiết bị thực

### Animation lag
- Kiểm tra CSS transitions
- Reduce animation complexity
- Use transform thay vì position

## 📝 TODO

- [ ] Drag to resize sidebar
- [ ] Pin/unpin sidebar
- [ ] Custom themes
- [ ] Menu item reordering
- [ ] Search in menu
- [ ] Recent items section
- [ ] Keyboard navigation
- [ ] Voice commands
- [ ] Gesture support