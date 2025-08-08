import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from '@/lib/socket';
import { Room, Document, UserPresence, SocketEvents } from '@/types';

interface UseSocketOptions {
    userId?: string;
    username?: string;
    roomId?: string;
}

interface DocumentUpdateData {
    documentId: string;
    content: string;
    userId: string;
    username: string;
    timestamp: number;
}

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

type CanvasDrawData = SocketEvents['canvas:draw'];

interface UseSocketReturn {
    // Connection state
    isConnected: boolean;
    isConnecting: boolean;
    connectionError: string | null;

    // Room state
    currentRoom: Room | null;
    roomMembers: UserPresence[];
    documents: Document[];

    // Connection methods
    connect: (userId: string, username: string) => Promise<void>;
    disconnect: () => void;

    // Room methods
    joinRoom: (roomId: string, userId: string, username: string) => void;
    leaveRoom: (roomId: string, userId: string) => void;

    // Document methods
    sendDocumentUpdate: (documentId: string, content: string, userId: string, roomId: string) => void;
    onDocumentUpdate: (callback: (data: DocumentUpdateData) => void) => void;

    // Presence methods
    sendCursorPosition: (roomId: string, userId: string, username: string, position: { x: number; y: number }) => void;
    sendTypingIndicator: (roomId: string, userId: string, username: string, isTyping: boolean) => void;
    onCursorUpdate: (callback: (data: CursorUpdateData) => void) => void;
    onTypingIndicator: (callback: (data: TypingIndicatorData) => void) => void;

    // User events
    onUserJoined: (callback: (data: UserPresence) => void) => void;
    onUserLeft: (callback: (data: { userId: string; username: string }) => void) => void;

    // Canvas methods
    sendCanvasDraw: (roomId: string, userId: string, data: {
        x: number;
        y: number;
        color: string;
        tool: 'pen' | 'eraser';
        strokeWidth: number;
        type?: 'start' | 'draw' | 'end';
    }) => void;
    clearCanvas: (roomId: string, userId: string) => void;
    onCanvasDraw: (callback: (data: CanvasDrawData) => void) => void;
    onCanvasClear: (callback: (data: SocketEvents['canvas:clear']) => void) => void;
    onCanvasStateLoaded: (callback: (data: SocketEvents['canvas:state:loaded']) => void) => void;

    // Room members
    onRoomMembers: (callback: (data: UserPresence[]) => void) => void;
}



// Custom hook for socket connection
export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
    const { userId, username } = options;
    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [roomMembers, setRoomMembers] = useState<UserPresence[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    const cleanupRef = useRef<(() => void)[]>([]);

    // Connect to socket
    const connect = useCallback(async (userId: string, username: string) => {
        try {
            setIsConnecting(true);
            setConnectionError(null);

            await socketManager.connect(userId, username);
            setIsConnected(true);
            setIsConnecting(false);
        } catch (error) {
            setConnectionError(error instanceof Error ? error.message : 'Connection failed');
            setIsConnecting(false);
            setIsConnected(false);
        }
    }, []);

    // Disconnect from socket
    const disconnect = useCallback(() => {
        socketManager.disconnect();
        setIsConnected(false);
        setConnectionError(null);
        setCurrentRoom(null);
        setRoomMembers([]);
        setDocuments([]);
    }, []);

    // Join room
    const joinRoom = useCallback((roomId: string, userId: string, username: string) => {
        socketManager.joinRoom(roomId, userId, username);
    }, []);

    // Leave room
    const leaveRoom = useCallback((roomId: string, userId: string) => {
        socketManager.leaveRoom(roomId, userId);
    }, []);

    // Send document update
    const sendDocumentUpdate = useCallback((documentId: string, content: string, userId: string, roomId: string) => {
        socketManager.sendDocumentUpdate(documentId, content, userId, roomId);
    }, []);

    // Listen for document updates
    const onDocumentUpdate = useCallback((callback: (data: DocumentUpdateData) => void) => {
        socketManager.onDocumentUpdate(callback);
    }, []);

    // Send cursor position
    const sendCursorPosition = useCallback((
        roomId: string,
        userId: string,
        username: string,
        position: { x: number; y: number }
    ) => {
        socketManager.sendCursorPosition(roomId, userId, username, position);
    }, []);

    // Send typing indicator
    const sendTypingIndicator = useCallback((
        roomId: string,
        userId: string,
        username: string,
        isTyping: boolean
    ) => {
        socketManager.sendTypingIndicator(roomId, userId, username, isTyping);
    }, []);

    // Listen for cursor updates
    const onCursorUpdate = useCallback((callback: (data: CursorUpdateData) => void) => {
        socketManager.onCursorUpdate(callback);
    }, []);

    // Listen for typing indicators
    const onTypingIndicator = useCallback((callback: (data: TypingIndicatorData) => void) => {
        socketManager.onTypingIndicator(callback);
    }, []);

    // Listen for user joined
    const onUserJoined = useCallback((callback: (data: UserPresence) => void) => {
        socketManager.onUserJoined(callback);
    }, []);

    // Listen for user left
    const onUserLeft = useCallback((callback: (data: { userId: string; username: string }) => void) => {
        socketManager.onUserLeft(callback);
    }, []);

    // Send canvas draw
    const sendCanvasDraw = useCallback((roomId: string, userId: string, data: {
        x: number;
        y: number;
        color: string;
        tool: 'pen' | 'eraser';
        strokeWidth: number;
        type?: 'start' | 'draw' | 'end';
    }) => {
        socketManager.sendCanvasDraw(roomId, userId, data);
    }, []);

    // Clear canvas
    const clearCanvas = useCallback((roomId: string, userId: string) => {
        socketManager.clearCanvas(roomId, userId);
    }, []);

    // Listen for canvas draw events
    const onCanvasDraw = useCallback((callback: (data: CanvasDrawData) => void) => {
        socketManager.onCanvasDraw(callback);
    }, []);

    // Listen for canvas clear events
    const onCanvasClear = useCallback((callback: (data: SocketEvents['canvas:clear']) => void) => {
        socketManager.onCanvasClear(callback);
    }, []);

    // Listen for canvas state loaded events
    const onCanvasStateLoaded = useCallback((callback: (data: SocketEvents['canvas:state:loaded']) => void) => {
        socketManager.onCanvasStateLoaded(callback);
    }, []);

    // Listen for room members
    const onRoomMembers = useCallback((callback: (data: UserPresence[]) => void) => {
        socketManager.onRoomMembers(callback);
    }, []);

    // Setup event listeners
    useEffect(() => {
        if (!isConnected) return;

        // Listen for user joined
        const handleUserJoined = (user: UserPresence) => {
            setRoomMembers(prev => {
                const existing = prev.find(member => member.userId === user.userId);
                if (existing) {
                    return prev.map(member =>
                        member.userId === user.userId ? { ...member, ...user } : member
                    );
                }
                return [...prev, user];
            });
        };

        // Listen for user left
        const handleUserLeft = ({ userId }: { userId: string; username: string }) => {
            setRoomMembers(prev => prev.filter(member => member.userId !== userId));
        };

        // Listen for document updates
        const handleDocumentUpdate = (data: DocumentUpdateData) => {
            console.log('📝 Document updated:', data);
            // Update the documents state with the new content
            setDocuments(prev =>
                prev.map(doc =>
                    doc.id === data.documentId
                        ? { ...doc, content: data.content, updatedAt: new Date() }
                        : doc
                )
            );
        };

        // Listen for cursor updates
        const handleCursorUpdate = (data: CursorUpdateData) => {
            setRoomMembers(prev =>
                prev.map(member =>
                    member.userId === data.userId
                        ? { ...member, cursorPosition: data.position }
                        : member
                )
            );
        };

        // Listen for typing indicators
        const handleTypingIndicator = (data: TypingIndicatorData) => {
            setRoomMembers(prev =>
                prev.map(member =>
                    member.userId === data.userId
                        ? { ...member, isTyping: data.isTyping }
                        : member
                )
            );
        };

        // Listen for room members
        const handleRoomMembers = (members: UserPresence[]) => {
            console.log('👥 Received room members:', members);
            setRoomMembers(members);
        };

        // Setup listeners
        socketManager.onUserJoined(handleUserJoined);
        socketManager.onUserLeft(handleUserLeft);
        socketManager.onDocumentUpdate(handleDocumentUpdate);
        socketManager.onCursorUpdate(handleCursorUpdate);
        socketManager.onTypingIndicator(handleTypingIndicator);
        socketManager.onRoomMembers(handleRoomMembers);

        // Store cleanup functions
        cleanupRef.current = [
            () => socketManager.removeAllListeners(),
        ];

        return () => {
            cleanupRef.current.forEach(cleanup => cleanup());
        };
    }, [isConnected]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupRef.current.forEach(cleanup => cleanup());
            // Only disconnect if we're actually unmounting, not just re-rendering
            if (isConnected) {
                disconnect();
            }
        };
    }, [isConnected, disconnect]); // Empty dependency array to only run on unmount

    return {
        // Connection state
        isConnected,
        isConnecting,
        connectionError,

        // Room state
        currentRoom,
        roomMembers,
        documents,

        // Connection methods
        connect,
        disconnect,

        // Room methods
        joinRoom,
        leaveRoom,

        // Document methods
        sendDocumentUpdate,
        onDocumentUpdate,

        // Presence methods
        sendCursorPosition,
        sendTypingIndicator,
        onCursorUpdate,
        onTypingIndicator,

        // User events
        onUserJoined,
        onUserLeft,

        // Canvas methods
        sendCanvasDraw,
        clearCanvas,
        onCanvasDraw,
        onCanvasClear,
        onCanvasStateLoaded,

        // Room members
        onRoomMembers,
    };
}; 