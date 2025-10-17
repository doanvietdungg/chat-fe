# Chat App API Endpoints

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
```javascript
// Headers for authenticated requests
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

## 1. Authentication & User Management

### POST /auth/register
```javascript
// Request
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "avatar": "base64_image_data" // optional
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "avatar": "https://api.example.com/avatars/user_123.jpg",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
```javascript
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here"
  }
}
```

### GET /auth/me
```javascript
// Response
{
  "success": true,
  "data": {
    "user": { /* current user object */ }
  }
}
```

### PUT /auth/profile
```javascript
// Request
{
  "displayName": "New Name",
  "avatar": "base64_image_data" // optional
}
```

## 2. Chat Management

### GET /chats
```javascript
// Query params: ?type=all|private|group|channel&search=keyword
// Response
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "chat_123",
        "type": "private", // private, group, channel
        "title": "John Doe",
        "lastMessage": {
          "id": "msg_456",
          "text": "Hello there!",
          "authorId": "user_789",
          "authorName": "Jane Doe",
          "timestamp": "2024-01-01T12:00:00Z",
          "type": "text" // text, file, image, system
        },
        "unreadCount": 3,
        "pinned": false,
        "muted": false,
        "notificationLevel": "all", // all, mentions, none
        "participants": [
          {
            "id": "user_123",
            "username": "john_doe",
            "displayName": "John Doe",
            "avatar": "https://...",
            "role": "member", // member, admin, owner
            "joinedAt": "2024-01-01T00:00:00Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### POST /chats
```javascript
// Create new chat
// Request
{
  "type": "group", // private, group, channel
  "title": "My Group",
  "description": "Group description", // optional
  "participantIds": ["user_456", "user_789"], // for group/channel
  "isPublic": false, // for channel
  "inviteLink": "https://chat.app/invite/abc123" // for channel
}

// Response
{
  "success": true,
  "data": {
    "chat": { /* chat object */ }
  }
}
```

### GET /chats/:chatId
```javascript
// Get chat details
// Response
{
  "success": true,
  "data": {
    "chat": { /* full chat object with participants */ }
  }
}
```

### PUT /chats/:chatId
```javascript
// Update chat settings
// Request
{
  "title": "New Title",
  "description": "New Description",
  "notificationLevel": "mentions",
  "muted": false
}
```

### DELETE /chats/:chatId
```javascript
// Leave or delete chat
// Response
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

## 3. Messages

### GET /chats/:chatId/messages
```javascript
// Query params: ?page=1&limit=50&before=message_id&search=keyword
// Response
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "chatId": "chat_456",
        "authorId": "user_789",
        "authorName": "John Doe",
        "authorAvatar": "https://...",
        "text": "Hello world!",
        "type": "text", // text, file, image, system
        "file": {
          "id": "file_123",
          "name": "document.pdf",
          "size": 1024000,
          "type": "application/pdf",
          "url": "https://api.example.com/files/file_123.pdf",
          "thumbnail": "https://api.example.com/thumbnails/file_123.jpg" // for images
        },
        "replyTo": {
          "id": "msg_456",
          "text": "Previous message",
          "authorName": "Jane Doe"
        },
        "reactions": [
          {
            "emoji": "👍",
            "count": 3,
            "users": ["user_123", "user_456", "user_789"]
          }
        ],
        "readBy": [
          {
            "userId": "user_123",
            "readAt": "2024-01-01T12:05:00Z"
          }
        ],
        "edited": false,
        "editedAt": null,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "hasMore": true
    }
  }
}
```

### POST /chats/:chatId/messages
```javascript
// Send message
// Request
{
  "text": "Hello everyone!",
  "type": "text", // text, file, image
  "fileId": "file_123", // if type is file/image
  "replyTo": "msg_456" // optional
}

// Response
{
  "success": true,
  "data": {
    "message": { /* message object */ }
  }
}
```

### PUT /messages/:messageId
```javascript
// Edit message
// Request
{
  "text": "Edited message text"
}
```

### DELETE /messages/:messageId
```javascript
// Delete message
// Response
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### POST /messages/:messageId/reactions
```javascript
// Add reaction
// Request
{
  "emoji": "👍"
}
```

### DELETE /messages/:messageId/reactions/:emoji
```javascript
// Remove reaction
```

## 4. File Upload

### POST /files/upload
```javascript
// Multipart form data
// Request: FormData with file field
// Response
{
  "success": true,
  "data": {
    "file": {
      "id": "file_123",
      "name": "document.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "url": "https://api.example.com/files/file_123.pdf",
      "thumbnail": "https://api.example.com/thumbnails/file_123.jpg",
      "uploadedAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

### GET /files/:fileId
```javascript
// Get file info
// Response
{
  "success": true,
  "data": {
    "file": { /* file object */ }
  }
}
```

### DELETE /files/:fileId
```javascript
// Delete file
```

## 5. Chat Participants

### GET /chats/:chatId/participants
```javascript
// Get chat participants
// Response
{
  "success": true,
  "data": {
    "participants": [
      {
        "id": "user_123",
        "username": "john_doe",
        "displayName": "John Doe",
        "avatar": "https://...",
        "role": "admin", // member, admin, owner
        "joinedAt": "2024-01-01T00:00:00Z",
        "lastSeen": "2024-01-01T12:00:00Z",
        "isOnline": true
      }
    ]
  }
}
```

### POST /chats/:chatId/participants
```javascript
// Add participants to chat
// Request
{
  "participantIds": ["user_456", "user_789"]
}
```

### PUT /chats/:chatId/participants/:userId
```javascript
// Update participant role
// Request
{
  "role": "admin" // member, admin
}
```

### DELETE /chats/:chatId/participants/:userId
```javascript
// Remove participant from chat
```

## 6. Real-time Events (WebSocket)

### Connection
```javascript
// WebSocket URL: ws://localhost:3000/ws?token=jwt_token
```

### Events

#### message.sent
```javascript
{
  "type": "message.sent",
  "data": {
    "message": { /* message object */ },
    "chat": { /* chat object */ }
  }
}
```

#### message.updated
```javascript
{
  "type": "message.updated",
  "data": {
    "message": { /* updated message object */ }
  }
}
```

#### message.deleted
```javascript
{
  "type": "message.deleted",
  "data": {
    "messageId": "msg_123",
    "chatId": "chat_456"
  }
}
```

#### typing.start
```javascript
{
  "type": "typing.start",
  "data": {
    "chatId": "chat_123",
    "userId": "user_456",
    "userName": "John Doe"
  }
}
```

#### typing.stop
```javascript
{
  "type": "typing.stop",
  "data": {
    "chatId": "chat_123",
    "userId": "user_456"
  }
}
```

#### message.read
```javascript
{
  "type": "message.read",
  "data": {
    "messageId": "msg_123",
    "userId": "user_456",
    "readAt": "2024-01-01T12:05:00Z"
  }
}
```

#### user.online
```javascript
{
  "type": "user.online",
  "data": {
    "userId": "user_123",
    "lastSeen": "2024-01-01T12:00:00Z"
  }
}
```

#### user.offline
```javascript
{
  "type": "user.offline",
  "data": {
    "userId": "user_123",
    "lastSeen": "2024-01-01T12:00:00Z"
  }
}
```

#### chat.updated
```javascript
{
  "type": "chat.updated",
  "data": {
    "chat": { /* updated chat object */ }
  }
}
```

#### participant.added
```javascript
{
  "type": "participant.added",
  "data": {
    "chatId": "chat_123",
    "participant": { /* participant object */ }
  }
}
```

#### participant.removed
```javascript
{
  "type": "participant.removed",
  "data": {
    "chatId": "chat_123",
    "userId": "user_456"
  }
}
```

## 7. Search

### GET /search/messages
```javascript
// Query params: ?q=keyword&chatId=chat_123&page=1&limit=20
// Response
{
  "success": true,
  "data": {
    "messages": [ /* message objects */ ],
    "pagination": { /* pagination object */ }
  }
}
```

### GET /search/chats
```javascript
// Query params: ?q=keyword&type=all|private|group|channel
// Response
{
  "success": true,
  "data": {
    "chats": [ /* chat objects */ ]
  }
}
```

### GET /search/users
```javascript
// Query params: ?q=keyword&excludeChatId=chat_123
// Response
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "username": "john_doe",
        "displayName": "John Doe",
        "avatar": "https://...",
        "isOnline": true
      }
    ]
  }
}
```

## 8. Notifications

### GET /notifications
```javascript
// Query params: ?page=1&limit=20&unreadOnly=true
// Response
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "message", // message, mention, chat_invite, etc.
        "title": "New message from John Doe",
        "body": "Hello there!",
        "data": {
          "chatId": "chat_456",
          "messageId": "msg_789"
        },
        "read": false,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### PUT /notifications/:notificationId/read
```javascript
// Mark notification as read
```

### PUT /notifications/read-all
```javascript
// Mark all notifications as read
```

## Error Responses

All endpoints return errors in this format:

```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error


