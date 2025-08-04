'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/lib/store';
import { UserPresence as UserPresenceType } from '@/types';

// Import types from useSocket hook
interface CursorUpdateData {
    userId: string;
    position: { x: number; y: number };
    roomId: string;
}

interface TypingIndicatorData {
    userId: string;
    isTyping: boolean;
    roomId: string;
}

interface UserPresenceProps {
    roomId: string;
}

export default function UserPresence({ roomId }: UserPresenceProps) {
    const { onUserJoined, onUserLeft, onCursorUpdate, onTypingIndicator, sendCursorPosition, isConnected } = useSocket();
    const { user } = useAppSelector((state) => state.auth);
    const [activeUsers, setActiveUsers] = useState<UserPresenceType[]>([]);
    const [userCursors, setUserCursors] = useState<Record<string, { x: number; y: number; username: string }>>({});
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!isConnected) return;

        // Listen for user presence updates
        const handleUserJoined = (data: UserPresenceType) => {
            setActiveUsers(prev => {
                const existing = prev.find(u => u.userId === data.userId);
                if (existing) return prev;
                return [...prev, data];
            });
        };

        const handleUserLeft = (data: { userId: string; username: string }) => {
            setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
            setUserCursors(prev => {
                const newCursors = { ...prev };
                delete newCursors[data.userId];
                return newCursors;
            });
            setTypingUsers(prev => {
                const newTyping = { ...prev };
                delete newTyping[data.userId];
                return newTyping;
            });
        };

        const handleCursorUpdate = (data: CursorUpdateData) => {
            if (data.userId !== user?.id) {
                // Find username from active users or use a default
                const activeUser = activeUsers.find(u => u.userId === data.userId);
                const username = activeUser?.username || 'Unknown User';
                setUserCursors(prev => ({
                    ...prev,
                    [data.userId]: { x: data.position.x, y: data.position.y, username }
                }));
            }
        };

        const handleTypingIndicator = (data: TypingIndicatorData) => {
            if (data.userId !== user?.id) {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.userId]: data.isTyping
                }));
            }
        };

        onUserJoined(handleUserJoined);
        onUserLeft(handleUserLeft);
        onCursorUpdate(handleCursorUpdate);
        onTypingIndicator(handleTypingIndicator);

        return () => {
            // Cleanup is handled by the useSocket hook
        };
    }, [isConnected, user, onUserJoined, onUserLeft, onCursorUpdate, onTypingIndicator]);

    // Emit cursor position when mouse moves
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isConnected && user) {
                sendCursorPosition(roomId, user.id, user.username, { x: e.clientX, y: e.clientY });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isConnected, user, roomId, sendCursorPosition]);

    return (
        <>
            {/* User cursors */}
            {Object.entries(userCursors).map(([userId, cursor]) => (
                <div
                    key={userId}
                    className="fixed pointer-events-none z-50"
                    style={{
                        left: cursor.x,
                        top: cursor.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                            {cursor.username}
                        </div>
                    </div>
                </div>
            ))}

            {/* Typing indicators */}
            {Object.entries(typingUsers).map(([userId, isTyping]) => {
                if (!isTyping) return null;
                const user = activeUsers.find(u => u.userId === userId);
                if (!user) return null;

                return (
                    <div
                        key={`typing-${userId}`}
                        className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-50"
                    >
                        <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm">{user.username} is typing...</span>
                        </div>
                    </div>
                );
            })}

            {/* Active users list */}
            <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Active Users ({activeUsers.length})</h3>
                <div className="space-y-2">
                    {activeUsers.map((activeUser) => (
                        <div key={activeUser.userId} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">{activeUser.username}</span>
                            {typingUsers[activeUser.userId] && (
                                <span className="text-xs text-blue-500">typing...</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
} 