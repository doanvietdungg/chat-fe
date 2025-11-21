# User Presence/Online Status - Backend Implementation Guide

## Tổng quan
Frontend đã implement tính năng hiển thị trạng thái online/offline của user. Backend cần implement các endpoint và WebSocket handlers sau:

## 1. WebSocket Endpoints

### Send Online Status
**Destination:** `/app/presence/online`
**Request Payload:**
```json
{
  "status": "online",
  "timestamp": "2025-11-22T10:30:00.000Z"
}
```

**Backend cần:**
- Lưu trạng thái user hiện tại là ONLINE
- Broadcast đến tất cả contacts/friends của user này

---

### Send Offline Status
**Destination:** `/app/presence/offline`
**Request Payload:**
```json
{
  "status": "offline",
  "timestamp": "2025-11-22T10:30:00.000Z"
}
```

**Backend cần:**
- Lưu trạng thái user là OFFLINE
- Update lastSeen timestamp
- Broadcast đến tất cả contacts/friends

---

## 2. WebSocket Subscription

### Presence Updates Topic
**Topic:** `/user/topic/presence`

**Message Format gửi đến client:**
```json
{
  "userId": "user-uuid-123",
  "status": "online",  // "online" hoặc "offline"
  "lastSeen": "2025-11-22T10:30:00.000Z"
}
```

**Khi nào gửi:**
- Khi có user trong contact list thay đổi trạng thái
- Khi có user trong các chat chung thay đổi trạng thái

---

## 3. Backend Logic Flow

### Khi User Connect WebSocket:
```java
@EventListener
public void handleWebSocketConnect(SessionConnectEvent event) {
    String userId = getUserIdFromSession(event);
    
    // 1. Set user status to ONLINE
    presenceService.setUserOnline(userId);
    
    // 2. Broadcast to all contacts
    List<String> contactIds = contactService.getContactIds(userId);
    for (String contactId : contactIds) {
        messagingTemplate.convertAndSendToUser(
            contactId,
            "/topic/presence",
            new PresenceUpdate(userId, "online", new Date())
        );
    }
}
```

### Khi User Disconnect WebSocket:
```java
@EventListener
public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
    String userId = getUserIdFromSession(event);
    
    // 1. Set user status to OFFLINE
    presenceService.setUserOffline(userId);
    
    // 2. Update lastSeen
    presenceService.updateLastSeen(userId, new Date());
    
    // 3. Broadcast to all contacts
    List<String> contactIds = contactService.getContactIds(userId);
    for (String contactId : contactIds) {
        messagingTemplate.convertAndSendToUser(
            contactId,
            "/topic/presence",
            new PresenceUpdate(userId, "offline", new Date())
        );
    }
}
```

### Handler cho /app/presence/online:
```java
@MessageMapping("/presence/online")
public void handleOnlineStatus(
    @Payload PresenceStatusRequest request,
    @Header("simpSessionAttributes") Map<String, Object> sessionAttributes
) {
    String userId = (String) sessionAttributes.get("userId");
    
    // Set user online
    presenceService.setUserOnline(userId);
    
    // Broadcast to contacts
    broadcastPresenceToContacts(userId, "online");
}
```

### Handler cho /app/presence/offline:
```java
@MessageMapping("/presence/offline")
public void handleOfflineStatus(
    @Payload PresenceStatusRequest request,
    @Header("simpSessionAttributes") Map<String, Object> sessionAttributes
) {
    String userId = (String) sessionAttributes.get("userId");
    
    // Set user offline
    presenceService.setUserOffline(userId);
    presenceService.updateLastSeen(userId, new Date());
    
    // Broadcast to contacts
    broadcastPresenceToContacts(userId, "offline");
}
```

---

## 4. Database Schema Suggestion

### User Table Update:
```sql
ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN last_seen TIMESTAMP;
ALTER TABLE users ADD COLUMN last_online_at TIMESTAMP;
```

### Hoặc tạo bảng riêng UserPresence:
```sql
CREATE TABLE user_presence (
    user_id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(20) NOT NULL, -- 'online' or 'offline'
    last_seen TIMESTAMP,
    last_online_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_presence_status ON user_presence(status);
CREATE INDEX idx_user_presence_last_seen ON user_presence(last_seen);
```

---

## 5. REST API Endpoints (Optional)

### Get User Presence Status
```
GET /api/v1/users/{userId}/presence
Response:
{
  "userId": "user-uuid-123",
  "status": "online",
  "lastSeen": "2025-11-22T10:30:00.000Z"
}
```

### Get Multiple Users Presence
```
POST /api/v1/users/presence/batch
Request:
{
  "userIds": ["user-1", "user-2", "user-3"]
}

Response:
{
  "presences": [
    {
      "userId": "user-1",
      "status": "online",
      "lastSeen": null
    },
    {
      "userId": "user-2",
      "status": "offline",
      "lastSeen": "2025-11-22T09:15:00.000Z"
    }
  ]
}
```

---

## 6. Service Layer Example

```java
@Service
public class PresenceService {
    
    @Autowired
    private UserPresenceRepository presenceRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ContactService contactService;
    
    public void setUserOnline(String userId) {
        UserPresence presence = presenceRepository.findById(userId)
            .orElse(new UserPresence(userId));
        
        presence.setStatus("online");
        presence.setLastOnlineAt(new Date());
        presence.setUpdatedAt(new Date());
        
        presenceRepository.save(presence);
        
        // Broadcast to contacts
        broadcastPresenceUpdate(userId, "online", null);
    }
    
    public void setUserOffline(String userId) {
        UserPresence presence = presenceRepository.findById(userId)
            .orElse(new UserPresence(userId));
        
        Date now = new Date();
        presence.setStatus("offline");
        presence.setLastSeen(now);
        presence.setUpdatedAt(now);
        
        presenceRepository.save(presence);
        
        // Broadcast to contacts
        broadcastPresenceUpdate(userId, "offline", now);
    }
    
    public void updateLastSeen(String userId, Date timestamp) {
        presenceRepository.findById(userId).ifPresent(presence -> {
            presence.setLastSeen(timestamp);
            presence.setUpdatedAt(new Date());
            presenceRepository.save(presence);
        });
    }
    
    private void broadcastPresenceUpdate(String userId, String status, Date lastSeen) {
        List<String> contactIds = contactService.getContactIds(userId);
        
        PresenceUpdate update = new PresenceUpdate(userId, status, lastSeen);
        
        for (String contactId : contactIds) {
            messagingTemplate.convertAndSendToUser(
                contactId,
                "/topic/presence",
                update
            );
        }
    }
    
    public UserPresence getUserPresence(String userId) {
        return presenceRepository.findById(userId)
            .orElse(new UserPresence(userId, "offline", null));
    }
    
    public Map<String, UserPresence> getBatchPresence(List<String> userIds) {
        List<UserPresence> presences = presenceRepository.findAllById(userIds);
        
        return presences.stream()
            .collect(Collectors.toMap(
                UserPresence::getUserId,
                Function.identity()
            ));
    }
}
```

---

## 7. DTOs

```java
// Request DTO
@Data
public class PresenceStatusRequest {
    private String status;
    private Date timestamp;
}

// Response/Broadcast DTO
@Data
@AllArgsConstructor
public class PresenceUpdate {
    private String userId;
    private String status; // "online" or "offline"
    private Date lastSeen;
}

// Entity
@Entity
@Data
public class UserPresence {
    @Id
    private String userId;
    
    private String status; // "online" or "offline"
    
    private Date lastSeen;
    
    private Date lastOnlineAt;
    
    private Date updatedAt;
    
    public UserPresence() {}
    
    public UserPresence(String userId) {
        this.userId = userId;
        this.status = "offline";
        this.updatedAt = new Date();
    }
    
    public UserPresence(String userId, String status, Date lastSeen) {
        this.userId = userId;
        this.status = status;
        this.lastSeen = lastSeen;
        this.updatedAt = new Date();
    }
}
```

---

## 8. Testing với Frontend

1. User login → Frontend tự động gửi `/app/presence/online`
2. Backend broadcast đến contacts → Contacts thấy tích xanh
3. User đóng tab → Frontend gửi `/app/presence/offline`
4. Backend broadcast → Contacts thấy status chuyển thành offline
5. User mở lại tab → Frontend gửi online lại

---

## 9. Optional Enhancements

### Heartbeat/Ping (để phát hiện user mất kết nối):
```java
@Scheduled(fixedRate = 60000) // Every 1 minute
public void checkStaleConnections() {
    Date threshold = new Date(System.currentTimeMillis() - 120000); // 2 minutes ago
    
    List<UserPresence> staleUsers = presenceRepository
        .findByStatusAndUpdatedAtBefore("online", threshold);
    
    for (UserPresence presence : staleUsers) {
        setUserOffline(presence.getUserId());
    }
}
```

### Privacy Settings:
- Cho phép user ẩn trạng thái online
- Chỉ hiển thị cho contacts/friends
- Hiển thị "last seen" theo privacy settings

---

## Frontend Implementation Summary

✅ **Đã implement:**
1. Presence store (`src/store/presence.js`) - quản lý trạng thái online/offline
2. Auto send online status khi connect WebSocket
3. Auto send offline khi disconnect/close browser
4. Subscribe to `/user/topic/presence` để nhận updates
5. `UserStatusIndicator` component - tích xanh hiển thị status
6. Tích hợp vào ChatHeader và ChatSidebar
7. Handle visibility change (tab switch)

**Frontend ready!** Chỉ cần backend implement theo guide trên là hoạt động ngay.
