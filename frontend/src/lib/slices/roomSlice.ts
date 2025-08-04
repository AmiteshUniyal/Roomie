import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Room, UserPresence, Document } from '@/types';

// Define the room state interface
interface RoomState {
    currentRoom: Room | null;
    roomMembers: UserPresence[];
    documents: Document[];
    isLoading: boolean;
    error: string | null;
    userRooms: Room[];
    isCreatingRoom: boolean;
    isJoiningRoom: boolean;
}

// Initial state
const initialState: RoomState = {
    currentRoom: null,
    roomMembers: [],
    documents: [],
    isLoading: false,
    error: null,
    userRooms: [],
    isCreatingRoom: false,
    isJoiningRoom: false,
};

// Async thunk for creating a room
export const createRoom = createAsyncThunk(
    'room/create',
    async (roomData: { name: string; description?: string; isPublic: boolean }, { rejectWithValue }) => {
        try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData),
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Failed to create room');
            }

            const data = await response.json();
            return data;
        } catch {
            return rejectWithValue('Network error');
        }
    }
);

// Async thunk for joining a room
export const joinRoom = createAsyncThunk(
    'room/join',
    async (roomId: string, { rejectWithValue }) => {
        try {
            // TODO: Replace with actual API call
            const response = await fetch(`/api/rooms/${roomId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Failed to join room');
            }

            const data = await response.json();
            return data;
        } catch {
            return rejectWithValue('Network error');
        }
    }
);

// Async thunk for leaving a room
export const leaveRoom = createAsyncThunk(
    'room/leave',
    async (roomId: string, { rejectWithValue }) => {
        try {
            // TODO: Replace with actual API call
            const response = await fetch(`/api/rooms/${roomId}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Failed to leave room');
            }

            return { roomId };
        } catch {
            return rejectWithValue('Network error');
        }
    }
);

// Async thunk for fetching user's rooms
export const fetchUserRooms = createAsyncThunk(
    'room/fetchUserRooms',
    async (_, { rejectWithValue }) => {
        try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/rooms/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Failed to fetch rooms');
            }

            const data = await response.json();
            return data;
        } catch {
            return rejectWithValue('Network error');
        }
    }
);

// Create the room slice
const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        // Set current room
        setCurrentRoom: (state, action: PayloadAction<Room>) => {
            state.currentRoom = action.payload;
            state.error = null;
        },

        // Clear current room
        clearCurrentRoom: (state) => {
            state.currentRoom = null;
            state.roomMembers = [];
            state.documents = [];
        },

        // Add room member
        addRoomMember: (state, action: PayloadAction<UserPresence>) => {
            const existingIndex = state.roomMembers.findIndex(
                member => member.userId === action.payload.userId
            );

            if (existingIndex >= 0) {
                state.roomMembers[existingIndex] = action.payload;
            } else {
                state.roomMembers.push(action.payload);
            }
        },

        // Remove room member
        removeRoomMember: (state, action: PayloadAction<string>) => {
            state.roomMembers = state.roomMembers.filter(
                member => member.userId !== action.payload
            );
        },

        // Update room member
        updateRoomMember: (state, action: PayloadAction<Partial<UserPresence> & { userId: string }>) => {
            const index = state.roomMembers.findIndex(
                member => member.userId === action.payload.userId
            );

            if (index >= 0) {
                state.roomMembers[index] = { ...state.roomMembers[index], ...action.payload };
            }
        },

        // Set room members
        setRoomMembers: (state, action: PayloadAction<UserPresence[]>) => {
            state.roomMembers = action.payload;
        },

        // Add document
        addDocument: (state, action: PayloadAction<Document>) => {
            state.documents.push(action.payload);
        },

        // Update document
        updateDocument: (state, action: PayloadAction<Document>) => {
            const index = state.documents.findIndex(doc => doc.id === action.payload.id);
            if (index >= 0) {
                state.documents[index] = action.payload;
            }
        },

        // Remove document
        removeDocument: (state, action: PayloadAction<string>) => {
            state.documents = state.documents.filter(doc => doc.id !== action.payload);
        },

        // Set documents
        setDocuments: (state, action: PayloadAction<Document[]>) => {
            state.documents = action.payload;
        },

        // Set user rooms
        setUserRooms: (state, action: PayloadAction<Room[]>) => {
            state.userRooms = action.payload;
        },

        // Set error
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Create room
        builder
            .addCase(createRoom.pending, (state) => {
                state.isCreatingRoom = true;
                state.error = null;
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.isCreatingRoom = false;
                state.currentRoom = action.payload;
                state.userRooms.push(action.payload);
                state.error = null;
            })
            .addCase(createRoom.rejected, (state, action) => {
                state.isCreatingRoom = false;
                state.error = action.payload as string;
            });

        // Join room
        builder
            .addCase(joinRoom.pending, (state) => {
                state.isJoiningRoom = true;
                state.error = null;
            })
            .addCase(joinRoom.fulfilled, (state, action) => {
                state.isJoiningRoom = false;
                state.currentRoom = action.payload;
                state.error = null;
            })
            .addCase(joinRoom.rejected, (state, action) => {
                state.isJoiningRoom = false;
                state.error = action.payload as string;
            });

        // Leave room
        builder
            .addCase(leaveRoom.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(leaveRoom.fulfilled, (state) => {
                state.isLoading = false;
                state.currentRoom = null;
                state.roomMembers = [];
                state.documents = [];
            })
            .addCase(leaveRoom.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch user rooms
        builder
            .addCase(fetchUserRooms.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserRooms.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userRooms = action.payload;
                state.error = null;
            })
            .addCase(fetchUserRooms.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const {
    setCurrentRoom,
    clearCurrentRoom,
    addRoomMember,
    removeRoomMember,
    updateRoomMember,
    setRoomMembers,
    addDocument,
    updateDocument,
    removeDocument,
    setDocuments,
    setUserRooms,
    setError,
    clearError,
} = roomSlice.actions;

// Export reducer
export default roomSlice.reducer; 