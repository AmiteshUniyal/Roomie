import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the socket state interface
interface SocketState {
    isConnected: boolean;
    isConnecting: boolean;
    connectionError: string | null;
    lastConnected: Date | null;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    activeUsers: string[];
    typingUsers: Record<string, boolean>;
    userCursors: Record<string, { x: number; y: number; username: string }>;
}

// Initial state
const initialState: SocketState = {
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    lastConnected: null,
    connectionStatus: 'disconnected',
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    activeUsers: [],
    typingUsers: {},
    userCursors: {},
};

// Create the socket slice
const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        // Connection established
        connectionEstablished: (state) => {
            state.isConnected = true;
            state.isConnecting = false;
            state.connectionError = null;
            state.connectionStatus = 'connected';
            state.lastConnected = new Date();
            state.reconnectAttempts = 0;
        },

        // Connection lost
        connectionLost: (state, action: PayloadAction<string>) => {
            state.isConnected = false;
            state.isConnecting = false;
            state.connectionError = action.payload;
            state.connectionStatus = 'disconnected';
        },

        // Connection error
        connectionError: (state, action: PayloadAction<string>) => {
            state.isConnected = false;
            state.isConnecting = false;
            state.connectionError = action.payload;
            state.connectionStatus = 'error';
        },

        // Start connecting
        startConnecting: (state) => {
            state.isConnecting = true;
            state.connectionStatus = 'connecting';
            state.connectionError = null;
        },

        // Stop connecting
        stopConnecting: (state) => {
            state.isConnecting = false;
            state.connectionStatus = 'disconnected';
        },

        // Increment reconnect attempts
        incrementReconnectAttempts: (state) => {
            state.reconnectAttempts += 1;
        },

        // Reset reconnect attempts
        resetReconnectAttempts: (state) => {
            state.reconnectAttempts = 0;
        },

        // Clear connection error
        clearConnectionError: (state) => {
            state.connectionError = null;
        },

        // Set connection status
        setConnectionStatus: (state, action: PayloadAction<SocketState['connectionStatus']>) => {
            state.connectionStatus = action.payload;
        },

        // User presence actions
        userJoined: (state, action: PayloadAction<{ userId: string }>) => {
            if (!state.activeUsers.includes(action.payload.userId)) {
                state.activeUsers.push(action.payload.userId);
            }
        },

        userLeft: (state, action: PayloadAction<{ userId: string }>) => {
            state.activeUsers = state.activeUsers.filter(id => id !== action.payload.userId);
            delete state.typingUsers[action.payload.userId];
            delete state.userCursors[action.payload.userId];
        },

        setTypingIndicator: (state, action: PayloadAction<{ userId: string; isTyping: boolean }>) => {
            state.typingUsers[action.payload.userId] = action.payload.isTyping;
        },

        updateUserCursor: (state, action: PayloadAction<{ userId: string; x: number; y: number; username: string }>) => {
            state.userCursors[action.payload.userId] = {
                x: action.payload.x,
                y: action.payload.y,
                username: action.payload.username,
            };
        },

        clearUserCursor: (state, action: PayloadAction<{ userId: string }>) => {
            delete state.userCursors[action.payload.userId];
        },
    },
});

// Export actions
export const {
    connectionEstablished,
    connectionLost,
    connectionError,
    startConnecting,
    stopConnecting,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    clearConnectionError,
    setConnectionStatus,
    userJoined,
    userLeft,
    setTypingIndicator,
    updateUserCursor,
    clearUserCursor,
} = socketSlice.actions;

// Export reducer
export default socketSlice.reducer; 