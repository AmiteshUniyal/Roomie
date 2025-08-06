# 🔄 Redux Toolkit Flow Chart - Roomie App

## 📊 Complete Redux Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ROOMIE REDUX FLOW CHART                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                1. INITIALIZATION                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

📁 frontend/src/app/layout.tsx
    ↓
🔗 <Providers> (Redux Provider)
    ↓
📦 frontend/src/components/Providers.tsx
    ↓
🏪 frontend/src/lib/store.ts
    ↓
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              STORE CONFIGURATION                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                REDUX STORE                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

🏪 Store (configureStore)
├── 📦 authReducer (authSlice)
├── 📦 roomReducer (roomSlice) 
├── 📦 socketReducer (socketSlice)
├── 📦 editorReducer (editorSlice)
└── 📦 uiReducer (uiSlice)

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              INITIAL STATE SETUP                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔵 AUTH STATE (authSlice.ts)
├── user: null
├── isAuthenticated: false
├── isLoading: false
├── error: null
└── token: null

🔵 ROOM STATE (roomSlice.ts)
├── currentRoom: null
├── roomMembers: []
├── documents: []
├── isLoading: false
├── error: null
├── userRooms: []
├── isCreatingRoom: false
└── isJoiningRoom: false

🔵 SOCKET STATE (socketSlice.ts)
├── isConnected: false
├── isConnecting: false
├── connectionError: null
├── lastConnected: null
├── connectionStatus: 'disconnected'
├── reconnectAttempts: 0
├── maxReconnectAttempts: 5
├── activeUsers: []
├── typingUsers: {}
└── userCursors: {}

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW PATTERNS                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             1. AUTHENTICATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

👤 User Action (Login)
    ↓
🔧 Component: dispatch(loginUser(credentials))
    ↓
⚡ Async Thunk: loginUser()
    ↓
🌐 API Call: authService.login()
    ↓
📡 Response: { user, token }
    ↓
🔄 Reducer: authSlice.fulfilled
    ↓
💾 State Update:
    ├── user: User
    ├── isAuthenticated: true
    ├── token: string
    └── error: null
    ↓
🎨 UI Re-render: Components update with user data

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             2. ROOM MANAGEMENT FLOW                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

🏠 User Action (Create Room)
    ↓
🔧 Component: dispatch(createRoom(roomData))
    ↓
⚡ Async Thunk: createRoom()
    ↓
🌐 API Call: POST /api/rooms
    ↓
📡 Response: { room }
    ↓
🔄 Reducer: roomSlice.fulfilled
    ↓
💾 State Update:
    ├── currentRoom: Room
    ├── userRooms: [...prevRooms, newRoom]
    └── isCreatingRoom: false
    ↓
🎨 UI Re-render: Dashboard shows new room

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             3. SOCKET INTEGRATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔌 Socket Event (User Joined)
    ↓
📡 Socket Handler: socket.on('user_joined')
    ↓
🔧 Component: dispatch(userJoined({ userId }))
    ↓
🔄 Reducer: socketSlice.userJoined
    ↓
💾 State Update:
    ├── activeUsers: [...prevUsers, newUser]
    └── connectionStatus: 'connected'
    ↓
🎨 UI Re-render: User presence updates

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             4. REAL-TIME DOCUMENT FLOW                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

✍️ User Types (Document Edit)
    ↓
🔧 Component: dispatch(sendDocumentUpdate())
    ↓
📡 Socket Event: 'document_update'
    ↓
🌐 Backend: Updates database
    ↓
📡 Socket Broadcast: 'document_update_realtime'
    ↓
👂 Other Users: Receive real-time update
    ↓
🔄 Reducer: roomSlice.updateDocument
    ↓
💾 State Update: documents array updated
    ↓
🎨 UI Re-render: All users see changes

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE STORAGE LOCATIONS                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

💾 MEMORY STORAGE (Runtime)
├── 📦 Redux Store: All application state
├── 🔄 Component State: Local UI state
└── 📡 Socket State: Real-time connections

💾 PERSISTENT STORAGE
├── 🍪 Cookies: Authentication tokens
├── 💾 localStorage: User preferences
└── 🗄️ Database: User data, rooms, documents

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENT INTEGRATION                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

📱 COMPONENT USAGE PATTERNS

🔵 Reading State:
```typescript
const { user } = useAppSelector((state) => state.auth);
const { currentRoom } = useAppSelector((state) => state.room);
const { isConnected } = useAppSelector((state) => state.socket);
```

🔵 Dispatching Actions:
```typescript
const dispatch = useAppDispatch();
await dispatch(loginUser(credentials)).unwrap();
dispatch(setCurrentRoom(room));
```

🔵 Async Operations:
```typescript
// Component triggers async action
dispatch(createRoom(roomData))
  .unwrap()
  .then((room) => router.push(`/room/${room.id}`))
  .catch((error) => setError(error));
```

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE PERSISTENCE                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔄 STATE LIFECYCLE

1️⃣ **Initial Load**
   ├── Store created with initial state
   ├── Components mount and subscribe to state
   └── Auth check runs automatically

2️⃣ **User Session**
   ├── Login: State updates with user data
   ├── Navigation: State persists across routes
   └── Real-time: Socket events update state

3️⃣ **Page Refresh**
   ├── Store reinitializes with default state
   ├── Auth check restores user session
   └── Components rehydrate with stored data

4️⃣ **Logout**
   ├── Auth state cleared
   ├── Socket disconnected
   └── Redirect to login

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PERFORMANCE OPTIMIZATION                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

⚡ OPTIMIZATION TECHNIQUES

🔵 Selective Re-rendering:
```typescript
// Only re-render when specific state changes
const user = useAppSelector((state) => state.auth.user);
const isConnected = useAppSelector((state) => state.socket.isConnected);
```

🔵 Memoized Selectors:
```typescript
// Custom selectors for complex state
const selectUserRooms = (state: RootState) => state.room.userRooms;
const selectActiveUsers = (state: RootState) => state.socket.activeUsers;
```

🔵 Async Thunk Benefits:
- Automatic loading states
- Built-in error handling
- Optimistic updates
- Request deduplication

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ERROR HANDLING FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

❌ ERROR SCENARIOS

1️⃣ **API Errors**
   ├── Async thunk catches error
   ├── Reducer updates error state
   └── Component shows error message

2️⃣ **Socket Errors**
   ├── Connection lost
   ├── Reconnection attempts
   └── Fallback to polling

3️⃣ **Validation Errors**
   ├── Form validation
   ├── State validation
   └── User feedback

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPMENT TOOLS                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

🛠️ REDUX DEVTOOLS

🔵 State Inspection:
- View current state
- Time-travel debugging
- Action history

🔵 Performance Monitoring:
- Re-render tracking
- Action timing
- Memory usage

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SUMMARY: REDUX FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔄 COMPLETE FLOW SUMMARY

1️⃣ **Initialization**
   ├── Store created with 5 slices
   ├── Provider wraps app
   └── Initial state set

2️⃣ **User Interaction**
   ├── Component dispatches action
   ├── Async thunk handles API call
   └── Reducer updates state

3️⃣ **State Propagation**
   ├── Connected components re-render
   ├── UI reflects new state
   └── Real-time updates via sockets

4️⃣ **Persistence**
   ├── State persists during session
   ├── Auth state restored on refresh
   └── Data synced with backend

🎯 KEY BENEFITS:
✅ Type-safe state management
✅ Centralized data flow
✅ Real-time collaboration
✅ Optimized performance
✅ Developer-friendly debugging
✅ Scalable architecture

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              END OF FLOW CHART                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘ 