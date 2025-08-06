# 🔌 Socket Flow Chart - Roomie App

## 📊 Complete Socket Architecture & Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ROOMIE SOCKET FLOW CHART                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                1. SOCKET SETUP                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

🏗️ BACKEND SETUP (backend/src/index.ts)
    ↓
🔌 Socket.IO Server Creation
    ↓
📡 CORS Configuration
    ↓
🛠️ Handler Setup (backend/src/services/socket.ts)

🏗️ FRONTEND SETUP (frontend/src/lib/socket.ts)
    ↓
🔌 Socket Manager Singleton
    ↓
📡 Connection Configuration
    ↓
🛠️ Event Handlers Setup

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             2. CONNECTION FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

📱 FRONTEND INITIATION
    ↓
🔧 Component: useSocket hook
    ↓
🔌 SocketManager.connect(userId, username)
    ↓
📡 Socket.IO Client Connection
    ↓
🌐 WebSocket/Polling Transport
    ↓
📡 Backend Socket.IO Server
    ↓
🔐 Authentication Event
    ↓
✅ Connection Established

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             3. AUTHENTICATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔐 FRONTEND AUTHENTICATION
    ↓
📤 Socket Event: 'authenticate'
    ↓
📦 Payload: { userId, username, avatar }
    ↓
📡 Backend Socket Handler
    ↓
🔍 User Validation
    ↓
💾 Store User Data: connectedUsers.set(socket.id, userData)
    ↓
📤 Response: 'authenticated' event
    ↓
✅ Frontend: Connection authenticated

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             4. ROOM JOINING FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

🚪 FRONTEND ROOM JOIN
    ↓
📤 Socket Event: 'join_room'
    ↓
📦 Payload: { roomId }
    ↓
📡 Backend Socket Handler
    ↓
🔍 Room Access Validation
    ├── Check if room exists
    ├── Verify user permissions
    └── Validate membership/ownership
    ↓
✅ Access Granted
    ↓
🔗 Socket.join(roomId)
    ↓
💾 Database: Update user presence
    ↓
📤 Broadcast: 'user_joined' to room
    ↓
📤 Send: 'room_members' to joining user
    ↓
🎨 Frontend: Update UI with room members

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             5. TEXT EDITOR FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

✍️ USER TYPES IN EDITOR
    ↓
🔧 Component: TextEditor.tsx
    ↓
📤 Socket Event: 'document_update'
    ↓
📦 Payload: {
    documentId: string,
    content: string,
    userId: string,
    username: string,
    timestamp: number,
    roomId: string
}
    ↓
📡 Backend Socket Handler
    ↓
🔍 Document Access Validation
    ↓
⏱️ Debounced Update (300ms timer)
    ↓
💾 Database: Update document content
    ↓
📤 Broadcast: 'document_updated' (debounced)
    ↓
📤 Broadcast: 'document_update_realtime' (immediate)
    ↓
👂 Other Users Receive
    ↓
🔄 Redux State Update
    ↓
🎨 UI: Real-time text updates

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             6. CANVAS/WHITEBOARD FLOW                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

🎨 USER DRAWS ON CANVAS
    ↓
🔧 Component: Whiteboard.tsx
    ↓
📤 Socket Event: 'canvas_draw'
    ↓
📦 Payload: {
    roomId: string,
    userId: string,
    username: string,
    drawData: {
        type: 'start' | 'draw' | 'end',
        x: number,
        y: number,
        color: string,
        brushSize: number,
        tool: 'pen' | 'eraser' | 'brush'
    },
    timestamp: number
}
    ↓
📡 Backend Socket Handler
    ↓
🔍 Room Access Validation
    ↓
💾 Database: Save stroke (if type === 'draw')
    ↓
📤 Broadcast: 'canvas_draw_update'
    ↓
👂 Other Users Receive
    ↓
🔄 Redux State Update
    ↓
🎨 UI: Real-time drawing updates

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             7. CANVAS STATE SYNC FLOW                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

📂 CANVAS STATE LOADING
    ↓
🚪 User Joins Room
    ↓
📡 Backend: Load existing canvas state
    ↓
💾 Database: Query canvas strokes
    ↓
📤 Send: 'canvas_state_loaded'
    ↓
📦 Payload: {
    roomId: string,
    strokes: CanvasStroke[],
    lastUpdated: Date
}
    ↓
👂 Frontend Receives
    ↓
🔄 Redux State Update
    ↓
🎨 UI: Render existing canvas strokes

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             8. USER PRESENCE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

👤 USER PRESENCE TRACKING
    ↓
📤 Socket Event: 'user_activity'
    ↓
📦 Payload: {
    roomId: string,
    userId: string,
    username: string,
    activity: string
}
    ↓
📡 Backend Socket Handler
    ↓
💾 Database: Update user presence
    ↓
📤 Broadcast: 'user_activity_update'
    ↓
👂 Other Users Receive
    ↓
🔄 Redux State Update
    ↓
🎨 UI: Update user presence indicators

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             9. CURSOR TRACKING FLOW                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

🖱️ USER MOVES CURSOR
    ↓
🔧 Component: Track cursor position
    ↓
📤 Socket Event: 'cursor_update'
    ↓
📦 Payload: {
    documentId: string,
    position: { x: number, y: number },
    userId: string,
    username: string
}
    ↓
📡 Backend Socket Handler
    ↓
📤 Broadcast: 'cursor_updated'
    ↓
👂 Other Users Receive
    ↓
🔄 Redux State Update
    ↓
🎨 UI: Show other users' cursors

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             10. TYPING INDICATOR FLOW                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

⌨️ USER STARTS TYPING
    ↓
🔧 Component: TextEditor.tsx
    ↓
📤 Socket Event: 'typing_indicator'
    ↓
📦 Payload: {
    documentId: string,
    isTyping: boolean,
    userId: string,
    username: string
}
    ↓
📡 Backend Socket Handler
    ↓
💾 Database: Update typing status
    ↓
📤 Broadcast: 'typing_updated'
    ↓
👂 Other Users Receive
    ↓
🔄 Redux State Update
    ↓
🎨 UI: Show typing indicators

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             11. ROOM MANAGEMENT FLOW                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

🚪 ROOM LEAVE FLOW
    ↓
📤 Socket Event: 'leave_room'
    ↓
📦 Payload: { roomId: string }
    ↓
📡 Backend Socket Handler
    ↓
🔗 Socket.leave(roomId)
    ↓
💾 Database: Remove user presence
    ↓
📤 Broadcast: 'user_left'
    ↓
👂 Other Users Receive
    ↓
🔄 Redux State Update
    ↓
🎨 UI: Remove user from room members

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             12. DISCONNECTION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔌 USER DISCONNECTS
    ↓
📡 Backend: Socket 'disconnect' event
    ↓
🔍 Find user's active rooms
    ↓
📤 Broadcast: 'user_left' to all rooms
    ↓
💾 Database: Remove user presence
    ↓
🧹 Cleanup: Remove from connected users
    ↓
⏰ Timer cleanup: Clear document update timers

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             13. ERROR HANDLING FLOW                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

❌ CONNECTION ERROR
    ↓
📡 Frontend: 'connect_error' event
    ↓
🔄 Redux: Update connection status
    ↓
⏰ Timer: Reconnection attempt
    ↓
🔄 Retry: Socket.connect()
    ↓
✅ Success: Connection restored
    ↓
❌ Failure: Max attempts reached

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             14. REAL-TIME FEATURES                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

🎯 DOCUMENT COLLABORATION
├── Real-time text editing
├── Cursor position sharing
├── Typing indicators
└── Document version sync

🎨 WHITEBOARD COLLABORATION
├── Real-time drawing
├── Brush tool sync
├── Color coordination
└── Canvas state persistence

👥 USER PRESENCE
├── Online/offline status
├── Room activity tracking
├── User activity indicators
└── Last seen timestamps

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             15. SOCKET EVENT MAPPING                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

📤 FRONTEND → BACKEND EVENTS
├── 'authenticate' - User authentication
├── 'join_room' - Join a room
├── 'leave_room' - Leave a room
├── 'document_update' - Text editor changes
├── 'cursor_update' - Cursor position
├── 'typing_indicator' - Typing status
├── 'canvas_draw' - Drawing strokes
├── 'canvas_clear' - Clear canvas
├── 'user_activity' - User activity
└── 'user_focus_change' - Window focus

📥 BACKEND → FRONTEND EVENTS
├── 'authenticated' - Auth confirmation
├── 'user_joined' - User joined room
├── 'user_left' - User left room
├── 'document_updated' - Document changes
├── 'document_update_realtime' - Real-time updates
├── 'cursor_updated' - Cursor positions
├── 'typing_updated' - Typing indicators
├── 'canvas_draw_update' - Drawing updates
├── 'canvas_cleared' - Canvas cleared
├── 'canvas_state_loaded' - Canvas state
├── 'room_members' - Room member list
├── 'user_activity_update' - Activity updates
└── 'error' - Error messages

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             16. COMPONENT INTEGRATION                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

📱 COMPONENT SOCKET USAGE

🔵 TextEditor.tsx
```typescript
// Send document updates
socketManager.sendDocumentUpdate(documentId, content, userId, roomId);

// Listen for real-time updates
socketManager.onDocumentUpdate((data) => {
    // Update editor content
});

// Send typing indicators
socketManager.sendTypingIndicator(roomId, userId, username, isTyping);
```

🔵 Whiteboard.tsx
```typescript
// Send drawing data
socketManager.sendCanvasDraw(roomId, userId, drawData);

// Listen for drawing updates
socketManager.onCanvasDraw((data) => {
    // Update canvas
});

// Clear canvas
socketManager.clearCanvas(roomId, userId);
```

🔵 RoomPage.tsx
```typescript
// Join room
socketManager.joinRoom(roomId, userId, username);

// Listen for user events
socketManager.onUserJoined((user) => {
    // Update room members
});

socketManager.onUserLeft((user) => {
    // Remove user from list
});
```

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             17. PERFORMANCE OPTIMIZATION                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

⚡ OPTIMIZATION TECHNIQUES

🔵 Debouncing
- Document updates: 300ms delay
- Cursor updates: Throttled
- Typing indicators: Debounced

🔵 Selective Broadcasting
- Room-specific events
- User-specific updates
- Document-specific changes

🔵 Connection Management
- Automatic reconnection
- Connection pooling
- Error recovery

🔵 State Synchronization
- Canvas state persistence
- Document version control
- User presence tracking

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             18. SECURITY & VALIDATION                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔒 SECURITY MEASURES

🔵 Authentication
- User validation on connection
- Token-based authentication
- Session management

🔵 Authorization
- Room access validation
- Document permission checks
- User role verification

🔵 Input Validation
- Data sanitization
- Type checking
- Size limits

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             19. DATABASE INTEGRATION                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

🗄️ DATABASE OPERATIONS

🔵 User Presence
```sql
-- Update user presence
UPDATE user_presence 
SET last_seen = NOW(), username = ?, avatar = ?
WHERE user_id = ? AND room_id = ?
```

🔵 Document Updates
```sql
-- Update document content
UPDATE documents 
SET content = ?, updated_at = NOW()
WHERE id = ?
```

🔵 Canvas Strokes
```sql
-- Save canvas stroke
INSERT INTO canvas_strokes (room_id, user_id, stroke_data, timestamp)
VALUES (?, ?, ?, ?)
```

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             20. COMPLETE FLOW SUMMARY                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔄 SOCKET FLOW SUMMARY

1️⃣ **Connection Phase**
   ├── Frontend initiates connection
   ├── Backend authenticates user
   └── Connection established

2️⃣ **Room Management**
   ├── User joins room
   ├── Access validation
   └── Presence tracking

3️⃣ **Real-time Collaboration**
   ├── Document editing
   ├── Canvas drawing
   ├── User presence
   └── Cursor tracking

4️⃣ **Data Persistence**
   ├── Database updates
   ├── State synchronization
   └── Error recovery

🎯 KEY BENEFITS:
✅ Real-time collaboration
✅ Low latency updates
✅ Scalable architecture
✅ Robust error handling
✅ Secure communication
✅ Performance optimized

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              END OF SOCKET FLOW CHART                            │
└─────────────────────────────────────────────────────────────────────────────────────┘ 