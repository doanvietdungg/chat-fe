# User Profile Access Guide

Hướng dẫn truy cập User Profile Modal từ các vị trí khác nhau trong ứng dụng.

## 🎯 **Các cách mở User Profile:**

### **1. Từ ChatHeader (Main Chat):**
- **Vị trí:** Click vào **avatar + tên chat** ở header chính
- **Cách:** Click vào phần thông tin chat (avatar, tên, status)
- **Hiển thị:** Modal thông tin user hiện tại

### **2. Từ ChatSidebar:**
- **Vị trí:** Click vào **avatar** ở header sidebar
- **Cách:** Click vào avatar nhỏ ở góc phải header sidebar
- **Hiển thị:** Modal thông tin user hiện tại

### **3. Telegram Sidebar (Chat Info):**
- **Vị trí:** Click nút **⋮ (More)** ở ChatHeader
- **Cách:** Click 3 chấm → Sidebar slide in với thông tin chat
- **Hiển thị:** Thông tin của chat hiện tại

## 🖱️ **Visual Guide:**

```
┌─────────────────────────────────────────────────────────┐
│ 👤 John Doe ← Click để mở User Profile    [🔍][📞][📹][⋮] │
│ 🟢 Đang hoạt động                                ↑      │
└─────────────────────────────────────────────────────────┘
                                                   │
                                            Click để mở
                                          Chat Info Sidebar
```

```
Sidebar:
┌─────────────────────────────────────┐
│ Chats                    🔄🐛👤➕   │ ← Click 👤 = User Profile
├─────────────────────────────────────┤
│ 🔍 Search...                        │
├─────────────────────────────────────┤
│ 👤 Chat 1                     📌    │ ← Right-click = Context Menu
│ 👤 Chat 2                           │
└─────────────────────────────────────┘
```

## 🎨 **UI Components:**

### **1. UserProfile Modal:**
- **Trigger:** Click avatar/name trong ChatHeader hoặc ChatSidebar
- **Content:** User settings, profile info, logout
- **Style:** Standard modal overlay

### **2. TelegramSidebarLight:**
- **Trigger:** Click ⋮ (More) button trong ChatHeader
- **Content:** Chat info, statistics, actions
- **Style:** Slide-in sidebar từ bên phải, light theme

### **3. ChatContextMenu:**
- **Trigger:** Right-click trên chat items
- **Content:** Chat actions (pin, archive, delete, etc.)
- **Style:** Context menu popup tại vị trí chuột

## 🧪 **Test Steps:**

### **Test User Profile:**
1. **Vào `/chat`**
2. **Click vào avatar + tên** ở header chính
3. **User Profile modal** sẽ mở
4. **Test logout** và các settings

### **Test Chat Info:**
1. **Chọn một chat** bất kỳ
2. **Click nút ⋮** ở header
3. **Sidebar light theme** slide in
4. **Test statistics** và actions

### **Test Context Menu:**
1. **Right-click** trên chat item
2. **Context menu** xuất hiện
3. **Test actions:** Pin, Archive, Delete

## 🎯 **Features Available:**

### **User Profile Modal:**
- ✅ **User information** display
- ✅ **Profile settings**
- ✅ **Logout functionality**
- ✅ **Avatar management**

### **Chat Info Sidebar:**
- ✅ **Chat statistics** (photos, videos, files)
- ✅ **Participant info**
- ✅ **Notification settings**
- ✅ **Chat actions** (share, edit, delete)

### **Context Menu:**
- ✅ **Quick actions** for chats
- ✅ **Pin/Archive/Mute** toggles
- ✅ **Destructive actions** với confirmations
- ✅ **Smart positioning**

## 📱 **Access Points Summary:**

```
User Profile:
├── ChatHeader: Click avatar/name
└── ChatSidebar: Click avatar in header

Chat Info:
└── ChatHeader: Click ⋮ (More) button

Chat Actions:
└── ChatSidebar: Right-click on chat items
```

---

**Tất cả access points đã sẵn sàng!** 🎉

**Click vào avatar/tên trong header để mở User Profile.** 👤