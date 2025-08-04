'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { useSocket } from '@/hooks/useSocket';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoomHeader from '@/components/room/RoomHeader';
import TextEditor from '@/components/room/TextEditor';
import Whiteboard from '@/components/room/Whiteboard';
import UserPresence from '@/components/room/UserPresence';
import RoomSidebar from '@/components/room/RoomSidebar';
import { Room, Document } from '@/types';
import roomService from '@/lib/services/roomService';
import { documentService } from '@/lib/services/documentService';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const roomId = params.roomId as string;

    const {
        isConnected,
        connect,
        joinRoom,
        roomMembers,
        onUserJoined,
        onUserLeft
    } = useSocket({
        userId: user?.id,
        username: user?.username,
        roomId: roomId,
    });

    const [room, setRoom] = useState<Room | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [activeDocument, setActiveDocument] = useState<Document | null>(null);
    const [activeTab, setActiveTab] = useState<'editor' | 'whiteboard'>('editor');
    const [showActiveUsers, setShowActiveUsers] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Handle user joined/left events
    useEffect(() => {
        const handleUserJoined = (userData: any) => {
            console.log('👤 User joined:', userData);
        };

        const handleUserLeft = (userData: any) => {
            console.log('👋 User left:', userData);
        };

        onUserJoined(handleUserJoined);
        onUserLeft(handleUserLeft);
    }, [onUserJoined, onUserLeft]);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (!roomId) {
                router.push('/dashboard');
                return;
            }

            // Don't redirect if not authenticated - let ProtectedRoute handle it
            if (!isAuthenticated) {
                console.log('🔐 Not authenticated, waiting...');
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                console.log('🏠 Fetching room data for:', roomId);
                // Fetch room data
                const roomResponse = await roomService.getRoom(roomId);
                setRoom(roomResponse.room);
                console.log('✅ Room data loaded:', roomResponse.room);

                // Fetch documents from API
                try {
                    const documentsResponse = await documentService.getDocumentsByRoom(roomId);
                    setDocuments(documentsResponse.documents || []);

                    // Set first document as active if available
                    if (documentsResponse.documents && documentsResponse.documents.length > 0) {
                        setActiveDocument(documentsResponse.documents[0]);
                    }
                } catch (error) {
                    console.error('Failed to fetch documents:', error);
                    setDocuments([]);
                    setActiveDocument(null);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('❌ Failed to fetch room:', error);
                setError('Room not found or access denied');
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId, isAuthenticated, router]);

    useEffect(() => {
        if (isConnected && room && user) {
            // Join the room via socket
            console.log('🚪 Joining room via socket:', { roomId: room.id, userId: user.id, username: user.username });
            joinRoom(room.id, user.id, user.username);
        } else {
            console.log('⏳ Waiting to join room:', { isConnected, room: !!room, user: !!user });
        }
    }, [isConnected, room, user, joinRoom]);

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading room...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-600 text-xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!room) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-600 text-xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Room Not Found</h2>
                        <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Room Header */}
                <RoomHeader
                    room={room}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isConnected={isConnected}
                    onToggleActiveUsers={() => setShowActiveUsers(!showActiveUsers)}
                    user={user}
                />

                <div className="flex-1 flex">
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Tab Content */}
                        <div className="flex-1 relative">
                            {activeTab === 'editor' ? (
                                <TextEditor
                                    document={activeDocument}
                                    roomId={roomId}
                                    isConnected={isConnected}
                                />
                            ) : (
                                <Whiteboard
                                    roomId={roomId}
                                    isConnected={isConnected}
                                />
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <RoomSidebar
                        room={room}
                        documents={documents}
                        activeDocument={activeDocument}
                        onDocumentChange={(document) => {
                            setActiveDocument(document);
                            // Update documents list if needed
                            if (!documents.find(d => d.id === document.id)) {
                                setDocuments(prev => [...prev, document]);
                            }
                        }}
                        isConnected={isConnected}
                        showActiveUsers={showActiveUsers}
                        roomMembers={roomMembers}
                    />
                </div>

                {/* User Presence Overlay */}
                <UserPresence roomId={roomId} />
            </div>
        </ProtectedRoute>
    );
} 