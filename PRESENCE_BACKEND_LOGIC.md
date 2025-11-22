# Backend Logic cho Presence System

## Vấn đề hiện tại:
- User blob reload → disconnect/reconnect
- Backend chỉ gửi `user.online` event đến 1 chat hoặc không gửi đúng
- Frank không nhận được event nếu không đang mở chat với blob

## Giải pháp Backend phải implement:

### 1. Khi user ONLINE (connect/reconnect):

```java
@MessageMapping("/presence")
public void handlePresenceStatus(@Payload PresenceStatus status, SimpMessageHeaderAccessor headerAccessor) {
    String userId = headerAccessor.getUser().getName();
    
    if ("ONLINE".equals(status.getStatus())) {
        // Đánh dấu user online trong cache/database
        presenceService.setUserOnline(userId);
        
        // LẤY TẤT CẢ CHATS mà user này tham gia
        List<Chat> userChats = chatService.findChatsByUserId(userId);
        
        // GỬI event vào TỪNG chat
        for (Chat chat : userChats) {
            PresenceEvent event = new PresenceEvent(
                "user.online",
                new PresencePayload(userId)
            );
            
            messagingTemplate.convertAndSend(
                "/topic/chats/" + chat.getId() + "/events",
                event
            );
        }
    }
}
```

### 2. Khi user OFFLINE (disconnect):

```java
@EventListener
public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
    String userId = getUserIdFromSession(event);
    
    // Đánh dấu user offline
    presenceService.setUserOffline(userId);
    
    // LẤY TẤT CẢ CHATS mà user này tham gia
    List<Chat> userChats = chatService.findChatsByUserId(userId);
    
    // GỬI event vào TỪNG chat
    for (Chat chat : userChats) {
        PresenceEvent event = new PresenceEvent(
            "user.offline",
            new PresencePayload(userId)
        );
        
        messagingTemplate.convertAndSend(
            "/topic/chats/" + chat.getId() + "/events",
            event
        );
    }
}
```

### 3. DTO Classes:

```java
public class PresenceEvent {
    private String type; // "user.online" | "user.offline"
    private PresencePayload payload;
    
    // constructors, getters, setters
}

public class PresencePayload {
    private String userId;
    private String timestamp;
    
    // constructors, getters, setters
}

public class PresenceStatus {
    private String status; // "ONLINE" | "OFFLINE"
    
    // constructors, getters, setters
}
```

### 4. Service để track presence:

```java
@Service
public class PresenceService {
    // In-memory cache (hoặc dùng Redis)
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();
    
    public void setUserOnline(String userId) {
        onlineUsers.add(userId);
    }
    
    public void setUserOffline(String userId) {
        onlineUsers.remove(userId);
    }
    
    public boolean isUserOnline(String userId) {
        return onlineUsers.contains(userId);
    }
}
```

## Quan trọng:

1. **PHẢI gửi event vào TẤT CẢ chats** mà user tham gia, không chỉ 1 chat
2. **SessionDisconnectEvent** phải xử lý để gửi offline khi user disconnect/reload
3. **Caching** presence state để có thể query nhanh

## Flow hoàn chỉnh:

```
User blob reload:
1. Browser đóng WebSocket → SessionDisconnectEvent
2. Backend: setUserOffline(blob) → gửi user.offline vào /topic/chats/chatId1/events, chatId2/events, ...
3. Frank subscribe /topic/chats/chatId1/events → nhận user.offline → cập nhật UI

4. Blob page load xong → connect WebSocket
5. Blob gửi /app/presence {status: "ONLINE"}
6. Backend: setUserOnline(blob) → gửi user.online vào /topic/chats/chatId1/events, chatId2/events, ...
7. Frank subscribe /topic/chats/chatId1/events → nhận user.online → cập nhật UI
```

## Tối ưu (nếu cần):

- Dùng Redis Pub/Sub thay vì in-memory Set
- Debounce presence events (tránh spam khi user disconnect/reconnect nhanh)
- Heartbeat mechanism để detect zombie connections
