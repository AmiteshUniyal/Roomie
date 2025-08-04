'use client';

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices (we'll create these next)
import authReducer from './slices/authSlice';
import roomReducer from './slices/roomSlice';
import socketReducer from './slices/socketSlice';
import editorReducer from './slices/editorSlice';
import uiReducer from './slices/uiSlice';

// Configure the store
export const store = configureStore({
    reducer: {
        auth: authReducer,
        room: roomReducer,
        socket: socketReducer,
        editor: editorReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serialization checks
                ignoredActions: ['socket/connectionEstablished', 'socket/connectionLost'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.timestamp', 'payload.lastSeen'],
                // Ignore these paths in the state
                ignoredPaths: ['socket.connectionStatus', 'socket.lastConnected'],
            },
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 