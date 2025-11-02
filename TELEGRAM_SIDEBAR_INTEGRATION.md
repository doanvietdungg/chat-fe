# Telegram Sidebar Integration Guide

Hướng dẫn sử dụng Telegram Sidebar đã được tích hợp vào ChatSidebar.

## 🎯 **Cách sử dụng:**

### **1. Mở User Info Sidebar:**
- **Vị trí:** Header của ChatSidebar
- **Cách mở:** Click vào **avatar** ở góc phải header
- **Hiển thị:** Thông tin user hiện tại

### **2. Mở Chat Info Sidebar:**
- **Vị trí:** Mỗi chat item trong danh sách
- **Cách mở:** Click vào **icon info (ℹ️)** bên phải mỗi chat
- **Hiển thị:** Thông tin của chat đó

## 🔍 **Vị trí các nút:**

```
ChatSidebar
├── Header
│   ├── Title: "Chats"
│   └── Actions
│       ├── 🔄 (Refresh)
│       ├── 🐛 (Debug)
│       ├── 👤 (Avatar - Click để mở User Info)  ← NÚT NÀY
│       └── ➕ (New Chat)
└── Chat List
    └── Chat Item
        ├── Avatar
        ├── Chat Info (name, last message)
        └── Actions
            ├── ℹ️ (Info - Click để mở Chat Info)  ← NÚT NÀY
            └── 📌 (Pin)
```

## 🧪 **Test Steps:**

### **Test User Info:**
1. Vào `/chat`
2. Tìm **avatar** ở header sidebar (góc phải)
3. Click vào avatar
4. Telegram sidebar sẽ slide in từ bên phải
5. Hiển thị "User Info" với thông tin user hiện tại

### **Test Chat Info:**
1. Vào `/chat`
2. Hover vào bất kỳ chat item nào
3. Sẽ thấy **icon info (ℹ️)** xuất hiện bên phải
4. Click vào icon info
5. Telegram sidebar sẽ slide in từ bên phải
6. Hiển thị "Chat Info" với thông tin chat đó

## 🎨 **Visual Guide:**

```
┌─────────────────────────────────────┐
│ Chats                    🔄🐛👤➕   │ ← Click 👤 = User Info
├─────────────────────────────────────┤
│ 🔍 Search...                        │
├─────────────────────────────────────┤
│ 👤 John Doe              ℹ️📌      │ ← Click ℹ️ = Chat Info
│    Hello there...        2:30 PM    │
├─────────────────────────────────────┤
│ 👤 Jane Smith            ℹ️📌      │ ← Click ℹ️ = Chat Info  
│    How are you?          1:15 PM    │
├─────────────────────────────────────┤
│ 👥 Team Chat             ℹ️📌      │ ← Click ℹ️ = Chat Info
│    Meeting at 3pm        12:45 PM   │
└─────────────────────────────────────┘
```

## 🔧 **Features:**

### **User Info Sidebar:**
- Current user profile
- Personal statistics
- Account settings
- Personal actions

### **Chat Info Sidebar:**
- Chat member info
- Shared media statistics
- Chat-specific actions
- Notification settings for that chat

## 🚀 **Demo URLs:**

```bash
# Main chat app
http://localhost:5173/chat

# Demo page with all features
http://localhost:5173/demo

# Specific demos
http://localhost:5173/demo/telegram-sidebar
http://localhost:5173/demo/notifications
```

## 📱 **Mobile Support:**

- **Desktop:** Sidebar width 360px, slide from right
- **Mobile:** Full screen width, same slide animation
- **Touch-friendly:** All buttons optimized for touch

## 🎯 **Quick Test:**

1. **Start app:** `npm run dev`
2. **Go to:** `http://localhost:5173/chat`
3. **Test User Info:** Click avatar in header
4. **Test Chat Info:** Click ℹ️ icon on any chat
5. **Close:** Click backdrop or X button

---

**Telegram Sidebar đã được tích hợp hoàn chỉnh!** 🎉

**Các nút đã có sẵn trong ChatSidebar, chỉ cần click để sử dụng.**