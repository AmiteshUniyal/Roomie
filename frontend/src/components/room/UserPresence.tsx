'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/lib/store';
import { UserPresence as UserPresenceType } from '@/types';

interface TypingIndicatorData {
    userId: string;
    isTyping: boolean;
    roomId: string;
}

interface UserPresenceProps {
    roomId: string;
}

export default function UserPresence({ }: UserPresenceProps) {
    const { onUserJoined, onUserLeft, onTypingIndicator, isConnected } = useSocket();
    const { user } = useAppSelector((state) => state.auth);
    const [activeUsers, setActiveUsers] = useState<UserPresenceType[]>([]);
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
            setTypingUsers(prev => {
                const newTyping = { ...prev };
                delete newTyping[data.userId];
                return newTyping;
            });
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
        onTypingIndicator(handleTypingIndicator);

        return () => {
            // Cleanup is handled by the useSocket hook
        };
    }, [isConnected, user, onUserJoined, onUserLeft, onTypingIndicator]);

    return (
        <>
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


        </>
    );
} 