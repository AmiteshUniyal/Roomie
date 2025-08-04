import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the editor state interface
interface EditorState {
    content: string;
    isSaving: boolean;
    lastSaved: Date | null;
    version: number;
    isDirty: boolean;
    cursorPosition: {
        x: number;
        y: number;
    } | null;
    selection: {
        start: number;
        end: number;
    } | null;
    collaborators: Array<{
        userId: string;
        username: string;
        cursorPosition: { x: number; y: number };
        color: string;
    }>;
    isTyping: boolean;
    typingTimeout: NodeJS.Timeout | null;
}

// Initial state
const initialState: EditorState = {
    content: '',
    isSaving: false,
    lastSaved: null,
    version: 0,
    isDirty: false,
    cursorPosition: null,
    selection: null,
    collaborators: [],
    isTyping: false,
    typingTimeout: null,
};

// Create the editor slice
const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        // Set content
        setContent: (state, action: PayloadAction<string>) => {
            state.content = action.payload;
            state.isDirty = true;
            state.version += 1;
        },

        // Update content
        updateContent: (state, action: PayloadAction<string>) => {
            state.content = action.payload;
            state.isDirty = true;
            state.version += 1;
        },

        // Set saving state
        setSaving: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload;
        },

        // Set last saved
        setLastSaved: (state, action: PayloadAction<Date>) => {
            state.lastSaved = action.payload;
            state.isDirty = false;
        },

        // Set version
        setVersion: (state, action: PayloadAction<number>) => {
            state.version = action.payload;
        },

        // Set dirty state
        setDirty: (state, action: PayloadAction<boolean>) => {
            state.isDirty = action.payload;
        },

        // Set cursor position
        setCursorPosition: (state, action: PayloadAction<{ x: number; y: number } | null>) => {
            state.cursorPosition = action.payload;
        },

        // Set selection
        setSelection: (state, action: PayloadAction<{ start: number; end: number } | null>) => {
            state.selection = action.payload;
        },

        // Add collaborator
        addCollaborator: (state, action: PayloadAction<{
            userId: string;
            username: string;
            cursorPosition: { x: number; y: number };
            color: string;
        }>) => {
            const existingIndex = state.collaborators.findIndex(
                collab => collab.userId === action.payload.userId
            );

            if (existingIndex >= 0) {
                state.collaborators[existingIndex] = action.payload;
            } else {
                state.collaborators.push(action.payload);
            }
        },

        // Remove collaborator
        removeCollaborator: (state, action: PayloadAction<string>) => {
            state.collaborators = state.collaborators.filter(
                collab => collab.userId !== action.payload
            );
        },

        // Update collaborator cursor
        updateCollaboratorCursor: (state, action: PayloadAction<{
            userId: string;
            cursorPosition: { x: number; y: number };
        }>) => {
            const index = state.collaborators.findIndex(
                collab => collab.userId === action.payload.userId
            );

            if (index >= 0) {
                state.collaborators[index].cursorPosition = action.payload.cursorPosition;
            }
        },

        // Set collaborators
        setCollaborators: (state, action: PayloadAction<Array<{
            userId: string;
            username: string;
            cursorPosition: { x: number; y: number };
            color: string;
        }>>) => {
            state.collaborators = action.payload;
        },

        // Set typing state
        setTyping: (state, action: PayloadAction<boolean>) => {
            state.isTyping = action.payload;
        },

        // Set typing timeout
        setTypingTimeout: (state, action: PayloadAction<NodeJS.Timeout | null>) => {
            state.typingTimeout = action.payload;
        },

        // Clear editor
        clearEditor: (state) => {
            state.content = '';
            state.isSaving = false;
            state.lastSaved = null;
            state.version = 0;
            state.isDirty = false;
            state.cursorPosition = null;
            state.selection = null;
            state.collaborators = [];
            state.isTyping = false;
            state.typingTimeout = null;
        },

        // Reset dirty state
        resetDirty: (state) => {
            state.isDirty = false;
        },
    },
});

// Export actions
export const {
    setContent,
    updateContent,
    setSaving,
    setLastSaved,
    setVersion,
    setDirty,
    setCursorPosition,
    setSelection,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorCursor,
    setCollaborators,
    setTyping,
    setTypingTimeout,
    clearEditor,
    resetDirty,
} = editorSlice.actions;

// Export reducer
export default editorSlice.reducer; 