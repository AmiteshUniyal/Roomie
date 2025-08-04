import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the UI state interface
interface UIState {
    // Modals
    isCreateRoomModalOpen: boolean;
    isJoinRoomModalOpen: boolean;
    isSettingsModalOpen: boolean;
    isUserProfileModalOpen: boolean;

    // Loading states
    isLoading: boolean;
    loadingMessage: string | null;

    // Notifications
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        duration?: number;
    }>;

    // Sidebar
    isSidebarOpen: boolean;

    // Theme
    theme: 'light' | 'dark';

    // Active tab
    activeTab: 'editor' | 'whiteboard' | 'chat' | 'members';

    // Error states
    error: string | null;

    // Success states
    success: string | null;
}

// Initial state
const initialState: UIState = {
    // Modals
    isCreateRoomModalOpen: false,
    isJoinRoomModalOpen: false,
    isSettingsModalOpen: false,
    isUserProfileModalOpen: false,

    // Loading states
    isLoading: false,
    loadingMessage: null,

    // Notifications
    notifications: [],

    // Sidebar
    isSidebarOpen: true,

    // Theme
    theme: 'light',

    // Active tab
    activeTab: 'editor',

    // Error states
    error: null,

    // Success states
    success: null,
};

// Create the UI slice
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Modal actions
        openCreateRoomModal: (state) => {
            state.isCreateRoomModalOpen = true;
        },

        closeCreateRoomModal: (state) => {
            state.isCreateRoomModalOpen = false;
        },

        openJoinRoomModal: (state) => {
            state.isJoinRoomModalOpen = true;
        },

        closeJoinRoomModal: (state) => {
            state.isJoinRoomModalOpen = false;
        },

        openSettingsModal: (state) => {
            state.isSettingsModalOpen = true;
        },

        closeSettingsModal: (state) => {
            state.isSettingsModalOpen = false;
        },

        openUserProfileModal: (state) => {
            state.isUserProfileModalOpen = true;
        },

        closeUserProfileModal: (state) => {
            state.isUserProfileModalOpen = false;
        },

        // Loading actions
        setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
            state.isLoading = action.payload.isLoading;
            state.loadingMessage = action.payload.message || null;
        },

        // Notification actions
        addNotification: (state, action: PayloadAction<{
            type: 'success' | 'error' | 'warning' | 'info';
            message: string;
            duration?: number;
        }>) => {
            const id = Date.now().toString();
            state.notifications.push({
                id,
                type: action.payload.type,
                message: action.payload.message,
                duration: action.payload.duration || 5000,
            });
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                notification => notification.id !== action.payload
            );
        },

        clearNotifications: (state) => {
            state.notifications = [];
        },

        // Sidebar actions
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },

        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload;
        },

        // Theme actions
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },

        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },

        // Active tab actions
        setActiveTab: (state, action: PayloadAction<'editor' | 'whiteboard' | 'chat' | 'members'>) => {
            state.activeTab = action.payload;
        },

        // Error actions
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },

        // Success actions
        setSuccess: (state, action: PayloadAction<string>) => {
            state.success = action.payload;
        },

        clearSuccess: (state) => {
            state.success = null;
        },

        // Reset UI state
        resetUI: (state) => {
            state.isCreateRoomModalOpen = false;
            state.isJoinRoomModalOpen = false;
            state.isSettingsModalOpen = false;
            state.isUserProfileModalOpen = false;
            state.isLoading = false;
            state.loadingMessage = null;
            state.notifications = [];
            state.error = null;
            state.success = null;
        },
    },
});

// Export actions
export const {
    openCreateRoomModal,
    closeCreateRoomModal,
    openJoinRoomModal,
    closeJoinRoomModal,
    openSettingsModal,
    closeSettingsModal,
    openUserProfileModal,
    closeUserProfileModal,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    toggleTheme,
    setActiveTab,
    setError,
    clearError,
    setSuccess,
    clearSuccess,
    resetUI,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer; 