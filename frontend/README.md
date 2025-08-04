# 🏠 Roomie Frontend

Real-time collaborative document editor built with Next.js, TypeScript, and Socket.IO.

## 🚀 Features

### ✅ Completed
- **Authentication System**
  - User registration and login
  - Protected routes
  - JWT token management (cookie-based)
  - Form validation and error handling

- **Room Management**
  - Create new rooms with privacy settings
  - Join existing rooms via room codes
  - Dashboard showing user's rooms
  - Room privacy controls (public/private)

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Loading states and error handling
  - Clean, intuitive interface
  - Consistent navigation patterns

### 🔄 In Progress
- **Real-time Collaboration**
  - Text editor integration (Tiptap)
  - Whiteboard/canvas functionality
  - User presence indicators
  - Socket.IO integration

- **Room Interface**
  - Document editing interface
  - Real-time synchronization
  - User cursors and typing indicators

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit
- **Real-time**: Socket.IO Client
- **Rich Text Editor**: Tiptap
- **Authentication**: JWT with HTTP-only cookies

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── dashboard/         # Main dashboard
│   ├── create-room/       # Room management
│   ├── join-room/
│   └── room/              # Room interface (coming soon)
├── components/            # Reusable components
│   └── ProtectedRoute.tsx # Authentication guard
├── lib/                   # Core utilities
│   ├── api.ts            # API configuration
│   ├── config.ts         # App configuration
│   ├── socket.ts         # Socket.IO manager
│   ├── store.ts          # Redux store
│   ├── slices/           # Redux slices
│   └── services/         # API services
├── hooks/                # Custom React hooks
│   └── useSocket.ts      # Socket.IO hook
└── types/                # TypeScript definitions
    └── index.ts          # App types
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Backend server running on `http://localhost:3001`

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 🎯 Current Status

### ✅ Backend Integration
- API services configured
- Authentication flow connected
- Room management services ready
- Socket.IO integration prepared

### ✅ UI Components
- Authentication pages (Login/Register)
- Dashboard with room management
- Create/Join room forms
- Protected route system
- Modern, responsive design

### 🔄 Next Steps
1. **Room Interface**: Build the main collaboration interface
2. **Text Editor**: Integrate Tiptap for real-time editing
3. **Whiteboard**: Add canvas drawing functionality
4. **Real-time Features**: Connect Socket.IO for live collaboration
5. **User Presence**: Add cursors, avatars, and typing indicators

## 🧪 Testing

The application is ready for testing:

1. **Start the backend server** (if not already running)
2. **Start the frontend**: `npm run dev`
3. **Visit**: `http://localhost:3000`
4. **Test the flow**:
   - Register a new account
   - Login with credentials
   - Create a new room
   - Join an existing room
   - Navigate through the dashboard

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Files to Modify
- **API Integration**: `src/lib/services/` - Connect to real backend
- **UI Components**: `src/components/` - Add new components
- **Pages**: `src/app/` - Add new pages
- **State Management**: `src/lib/slices/` - Modify Redux state

## 🎨 Design System

The app uses a consistent design system:
- **Colors**: Blue to purple gradient theme
- **Typography**: Geist Sans font family
- **Spacing**: Tailwind CSS spacing scale
- **Components**: Reusable, accessible components
- **Responsive**: Mobile-first design approach

## 🔐 Security

- **Authentication**: JWT tokens with HTTP-only cookies
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Secure error messages without exposing internals

---

**Next Phase**: Building the real-time collaboration interface with text editor and whiteboard functionality.
