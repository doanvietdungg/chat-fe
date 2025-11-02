# Hệ thống Thông báo (Notification System)

Hệ thống thông báo hoàn chỉnh cho ứng dụng chat Vue.js với Ant Design Vue.

## 🚀 Tính năng

### 1. **Notification Store** (`src/store/notifications.js`)
- Quản lý state thông báo tập trung
- Hỗ trợ nhiều loại thông báo: success, error, warning, info, message, system
- Tự động ẩn hoặc persistent notifications
- Desktop notifications với Web Notification API
- Âm thanh thông báo có thể tùy chỉnh
- Lưu cài đặt vào localStorage

### 2. **Notification Bell** (`src/components/NotificationBell.vue`)
- Icon chuông với badge hiển thị số thông báo chưa đọc
- Panel dropdown hiển thị danh sách thông báo
- Lọc thông báo theo loại (tất cả, chưa đọc, tin nhắn, hệ thống)
- Actions cho từng thông báo
- Animation khi có thông báo mới

### 3. **Notification Toast** (`src/components/NotificationToast.vue`)
- Toast notifications hiển thị ở góc màn hình
- Tự động ẩn sau thời gian cài đặt
- Progress bar cho thời gian còn lại
- Hỗ trợ actions và avatar
- Responsive design

### 4. **Notification Settings** (`src/components/NotificationSettings.vue`)
- Cài đặt chi tiết cho từng loại thông báo
- Bật/tắt desktop notifications, âm thanh, in-app notifications
- Chế độ "Không làm phiền" với time range
- Test notifications
- Kiểm tra trạng thái quyền

### 5. **Demo Component** (`src/components/NotificationDemo.vue`)
- Component demo đầy đủ tính năng
- Test các loại thông báo khác nhau
- Thống kê và quản lý thông báo
- Accessible tại `/demo/notifications`

## 📦 Cài đặt

### 1. Dependencies đã được thêm:
```json
{
  "date-fns": "^latest" // Để format thời gian
}
```

### 2. Files đã được tạo:
```
src/
├── store/
│   └── notifications.js          # Store quản lý thông báo
├── components/
│   ├── NotificationBell.vue      # Component chuông thông báo
│   ├── NotificationToast.vue     # Component toast
│   ├── NotificationSettings.vue  # Component cài đặt
│   └── NotificationDemo.vue      # Component demo
public/
└── sounds/                       # Thư mục âm thanh thông báo
    └── README.md
```

### 3. Tích hợp vào ứng dụng:

**App.vue** - Đã tích hợp NotificationToast và khởi tạo store

**ChatHeader.vue** - Đã thêm NotificationBell

**Chat Store** - Đã tích hợp tự động tạo thông báo khi có tin nhắn mới

## 🎯 Cách sử dụng

### 1. Sử dụng Notification Store:

```javascript
import { useNotificationsStore } from '@/store/notifications'

const notificationStore = useNotificationsStore()

// Thông báo thành công
notificationStore.showSuccess('Thành công!', 'Thao tác đã hoàn thành')

// Thông báo lỗi
notificationStore.showError('Lỗi!', 'Có lỗi xảy ra')

// Thông báo tin nhắn
notificationStore.showMessageNotification({
  senderName: 'Nguyễn Văn A',
  text: 'Xin chào!',
  senderAvatar: 'avatar-url',
  chatId: 'chat-123',
  senderId: 'user-123'
})

// Thông báo với actions
notificationStore.addNotification({
  type: 'info',
  title: 'Xác nhận',
  message: 'Bạn có muốn thực hiện thao tác này?',
  actions: [
    { label: 'Đồng ý', action: 'confirm', primary: true },
    { label: 'Hủy', action: 'cancel' }
  ]
})
```

### 2. Sử dụng Components:

```vue
<template>
  <!-- Notification Bell (thường đặt trong header) -->
  <NotificationBell />
  
  <!-- Notification Toast (đặt trong App.vue) -->
  <NotificationToast />
  
  <!-- Settings Modal -->
  <NotificationSettings v-model:visible="settingsVisible" />
</template>

<script setup>
import NotificationBell from '@/components/NotificationBell.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import NotificationSettings from '@/components/NotificationSettings.vue'
</script>
```

### 3. Tự động tạo thông báo cho tin nhắn:

Hệ thống đã được tích hợp vào chat store để tự động tạo thông báo khi:
- Có tin nhắn mới từ người khác
- Được thêm vào chat mới
- Có sự kiện hệ thống

## 🎨 Customization

### 1. Thay đổi âm thanh:
Thêm file .mp3 vào `public/sounds/`:
- `message.mp3` - Tin nhắn mới
- `success.mp3` - Thành công
- `error.mp3` - Lỗi
- `notification.mp3` - Mặc định

### 2. Thay đổi styling:
Các component sử dụng CSS scoped, có thể override bằng CSS global hoặc CSS variables.

### 3. Thêm loại thông báo mới:
```javascript
// Trong notifications.js
export const NOTIFICATION_TYPES = {
  // ... existing types
  CUSTOM: 'custom'
}

// Thêm method mới
function showCustomNotification(title, message, options = {}) {
  return addNotification({
    type: NOTIFICATION_TYPES.CUSTOM,
    title,
    message,
    ...options
  })
}
```

## 🔧 Cài đặt nâng cao

### 1. Desktop Notifications:
- Tự động yêu cầu quyền khi bật
- Hiển thị khi ứng dụng không focus
- Click để focus ứng dụng

### 2. Âm thanh:
- Tự động phát khi có thông báo
- Có thể tắt trong settings
- Khác nhau cho từng loại thông báo

### 3. Persistence:
- Cài đặt lưu trong localStorage
- Thông báo quan trọng không tự động ẩn
- Sync giữa các tab (có thể mở rộng)

## 🧪 Testing

Truy cập `/demo/notifications` để test đầy đủ các tính năng:
- Test các loại thông báo
- Test với actions
- Test persistent notifications
- Test multiple notifications
- Cài đặt và permissions

## 🚀 Tích hợp với Backend

Hệ thống đã sẵn sàng tích hợp với:
- WebSocket/STOMP cho real-time notifications
- REST API cho lịch sử thông báo
- Push notifications (có thể mở rộng)

## 📱 Responsive

- Hoạt động tốt trên mobile
- Toast responsive
- Panel notification responsive
- Touch-friendly

## ♿ Accessibility

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

---

**Hệ thống notification đã sẵn sàng sử dụng!** 🎉

Để test ngay, truy cập: `http://localhost:5173/demo/notifications`