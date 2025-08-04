'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Room } from '@/types';

interface RoomHeaderProps {
    room: Room;
    activeTab: 'editor' | 'whiteboard';
    onTabChange: (tab: 'editor' | 'whiteboard') => void;
    isConnected: boolean;
    onToggleActiveUsers: () => void;
    user?: { id: string; username: string } | null;
}

export default function RoomHeader({ room, activeTab, onTabChange, isConnected, user }: RoomHeaderProps) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const handleLeaveRoom = () => {
        router.push('/dashboard');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Room info and tabs */}
                <div className="flex items-center space-x-6">
                    {/* Room info */}
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{room.name}</h1>
                        {room.description && (
                            <p className="text-sm text-gray-500">{room.description}</p>
                        )}
                    </div>

                    {/* Connection status */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    {/* Tab navigation */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => onTabChange('editor')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'editor'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📝 Editor
                        </button>
                        <button
                            onClick={() => onTabChange('whiteboard')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'whiteboard'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            🎨 Whiteboard
                        </button>
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center space-x-4">
                    
                    {room.ownerId === user?.id && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-sm text-blue-600 font-mono">{room.code || room.id}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(room.code || room.id)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Copy room code"
                            >
                                📋
                            </button>
                        </div>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ⚙️
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleLeaveRoom();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Leave Room
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
} 