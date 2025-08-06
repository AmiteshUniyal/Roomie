import { Server, Socket } from 'socket.io';
import { prisma } from '../index';
import { canvasService, CanvasStroke } from './canvasService';

interface UserData {
    userId: string;
    username: string;
    avatar?: string;
}

interface DocumentUpdateData {
    documentId: string;
    content: string;
    userId: string;
    username: string;
    timestamp: number;
}

interface CursorUpdateData {
    documentId: string;
    position: { x: number; y: number };
    userId: string;
    username: string;
}

interface TypingIndicatorData {
    documentId: string;
    isTyping: boolean;
    userId: string;
    username: string;
}

interface CanvasDrawData {
    roomId: string;
    userId: string;
    username: string;
    drawData: {
        type: 'start' | 'draw' | 'end';
        x: number;
        y: number;
        color: string;
        brushSize: number;
        tool: 'pen' | 'eraser' | 'brush';
    };
    timestamp: number;
}

interface CanvasStateData {
    roomId: string;
    canvasState: string; // Base64 encoded canvas data
    userId: string;
    username: string;
    timestamp: number;
}

export const   setupSocketHandlers = (io: Server) => {
    // Store connected users
    const connectedUsers = new Map<string, UserData>();

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Handle user authentication
        socket.on('authenticate', async (data: UserData) => {
            try {
                const { userId, username, avatar } = data;

                // Store user data
                connectedUsers.set(socket.id, { userId, username, avatar: avatar || '' });
                socket.data.user = { userId, username, avatar: avatar || '' };

                console.log(`✅ User authenticated: ${username} (${userId})`);
                socket.emit('authenticated', { success: true });
            } catch (error) {
                console.error('Authentication error:', error);
                socket.emit('authenticated', { success: false, error: 'Authentication failed' });
            }
        });

        // Handle joining a room
        socket.on('join_room', async (data: { roomId: string }) => {
            try {
                const { roomId } = data;
                const userData = socket.data.user;

                if (!userData) {
                    console.log(`❌ User not authenticated for room join: ${socket.id}`);
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }

                console.log(`🚪 User ${userData.username} attempting to join room ${roomId}`);

                // Check if user has access to the room
                const room = await prisma.room.findUnique({
                    where: { id: roomId },
                    include: {
                        members: {
                            where: { userId: userData.userId }
                        }
                    }
                });

                if (!room) {
                    console.log(`❌ Room not found: ${roomId}`);
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                const isMember = room.members.length > 0;
                const isOwner = room.ownerId === userData.userId;

                if (!isMember && !isOwner && !room.isPublic) {
                    console.log(`❌ Access denied for user ${userData.username} to room ${roomId}`);
                    socket.emit('error', { message: 'Access denied' });
                    return;
                }

                socket.join(roomId);
                console.log(`✅ User ${userData.username} joined room ${roomId}`);

                // Load and send existing canvas state
                try {
                    const canvasState = await canvasService.loadCanvasState(roomId);
                    if (canvasState && canvasState.strokes.length > 0) {
                        socket.emit('canvas_state_loaded', {
                            roomId,
                            strokes: canvasState.strokes,
                            lastUpdated: canvasState.lastUpdated
                        });
                        console.log(`📂 Sent ${canvasState.strokes.length} strokes to ${userData.username} in room ${roomId}`);
                    }
                } catch (error) {
                    console.error('Failed to load canvas state:', error);
                }

                // Update user presence
                await prisma.userPresence.upsert({
                    where: {
                        userId_roomId: {
                            userId: userData.userId,
                            roomId
                        }
                    },
                    update: {
                        lastSeen: new Date(),
                        username: userData.username,
                        avatar: userData.avatar
                    },
                    create: {
                        userId: userData.userId,
                        roomId,
                        username: userData.username,
                        avatar: userData.avatar,
                        lastSeen: new Date()
                    }
                });

                // Notify others in the room
                socket.to(roomId).emit('user_joined', {
                    userId: userData.userId,
                    username: userData.username,
                    avatar: userData.avatar
                });

                // Send current room members to the joining user
                const roomMembers = await prisma.userPresence.findMany({
                    where: { roomId },
                    orderBy: { lastSeen: 'desc' }
                });

                socket.emit('room_members', roomMembers);

                console.log(`👥 User ${userData.username} joined room ${roomId}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Handle leaving a room
        socket.on('leave_room', async (data: { roomId: string }) => {
            try {
                const { roomId } = data;
                const userData = socket.data.user;

                if (!userData) {
                    return;
                }

                // Leave the room
                socket.leave(roomId);

                // Remove user presence
                await prisma.userPresence.deleteMany({
                    where: {
                        userId: userData.userId,
                        roomId
                    }
                });

                // Notify others in the room
                socket.to(roomId).emit('user_left', {
                    userId: userData.userId,
                    username: userData.username
                });

                console.log(`👋 User ${userData.username} left room ${roomId}`);
            } catch (error) {
                console.error('Leave room error:', error);
            }
        });

        // Handle document updates (with improved debouncing)
        let documentUpdateTimers = new Map<string, NodeJS.Timeout>();
        let lastContentMap = new Map<string, string>(); // Track last content per document

        socket.on('document_update', async (data: DocumentUpdateData & { roomId: string }) => {
            try {
                const { documentId, content, userId, username, timestamp, roomId } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    socket.emit('error', { message: 'Unauthorized' });
                    return;
                }

                // Check if content actually changed
                const lastContent = lastContentMap.get(documentId);
                if (lastContent === content) {
                    console.log(`📝 Content unchanged for document ${documentId}, skipping update`);
                    return;
                }

                // Update last content
                lastContentMap.set(documentId, content);

                // Check if user has access to the document
                const document = await prisma.document.findUnique({
                    where: { id: documentId },
                    include: {
                        room: {
                            include: {
                                members: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                });

                if (!document) {
                    // Document doesn't exist yet, but we can still broadcast to the room
                    // This happens when a document is being created
                    console.log(`📝 Document ${documentId} not found, broadcasting to room ${roomId}`);

                    // Broadcast to all users in the room for real-time updates
                    socket.to(roomId).emit('document_update_realtime', {
                        documentId,
                        content,
                        userId,
                        username,
                        timestamp
                    });
                    return;
                }

                const isMember = document.room.members.length > 0;
                const isOwner = document.room.ownerId === userId;
                const isCreator = document.createdBy === userId;

                if (!isMember && !isOwner && !isCreator) {
                    socket.emit('error', { message: 'Access denied' });
                    return;
                }

                // Clear existing timer for this document
                const timerKey = `${documentId}_${userId}`;
                if (documentUpdateTimers.has(timerKey)) {
                    clearTimeout(documentUpdateTimers.get(timerKey)!);
                }

                // Set new timer for debounced update (300ms instead of 1000ms)
                const timer = setTimeout(async () => {
                    try {
                        // Update document in database
                        await prisma.document.update({
                            where: { id: documentId },
                            data: {
                                content,
                                updatedAt: new Date()
                            }
                        });

                        // Broadcast to all users in the room
                        socket.to(document.roomId).emit('document_updated', {
                            documentId,
                            content,
                            userId,
                            username,
                            timestamp: Date.now()
                        });

                        console.log(`📝 Document ${documentId} updated by ${username}`);
                    } catch (error) {
                        console.error('Debounced document update error:', error);
                    } finally {
                        documentUpdateTimers.delete(timerKey);
                    }
                }, 300); // Reduced from 1000ms to 300ms

                documentUpdateTimers.set(timerKey, timer);

                // Immediately broadcast to other users for real-time feel
                socket.to(document.roomId).emit('document_update_realtime', {
                    documentId,
                    content,
                    userId,
                    username,
                    timestamp
                });

                console.log(`📤 Real-time update sent for document ${documentId} by ${username}`);

            } catch (error) {
                console.error('Document update error:', error);
                socket.emit('error', { message: 'Failed to update document' });
            }
        });

        // Handle document selection/cursor position
        socket.on('document_selection', (data: { documentId: string, selection: any, userId: string, username: string }) => {
            try {
                const { documentId, selection, userId, username } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    return;
                }

                // Broadcast selection to all users in the room except sender
                socket.to(documentId).emit('document_selection_update', {
                    documentId,
                    selection,
                    userId,
                    username,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Document selection error:', error);
            }
        });

        // Handle cursor updates
        socket.on('cursor_update', (data: CursorUpdateData) => {
            try {
                const { documentId, position, userId, username } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    return;
                }

                // Broadcast to all users in the room except sender
                socket.to(documentId).emit('cursor_updated', {
                    documentId,
                    position,
                    userId,
                    username,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Cursor update error:', error);
            }
        });

        // Handle user activity (mouse movement, scrolling, etc.)
        socket.on('user_activity', async (data: { roomId: string, userId: string, username: string, activity: string }) => {
            try {
                const { roomId, userId, username, activity } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    return;
                }

                // Update user presence with activity
                await prisma.userPresence.updateMany({
                    where: {
                        userId,
                        roomId
                    },
                    data: {
                        lastSeen: new Date(),
                        lastActivity: activity
                    }
                });

                // Broadcast activity to other users in the room
                socket.to(roomId).emit('user_activity_update', {
                    roomId,
                    userId,
                    username,
                    activity,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('User activity error:', error);
            }
        });

        // Handle user focus/blur events
        socket.on('user_focus_change', async (data: { roomId: string, userId: string, username: string, isFocused: boolean }) => {
            try {
                const { roomId, userId, username, isFocused } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    return;
                }

                // Update user presence with focus state
                await prisma.userPresence.updateMany({
                    where: {
                        userId,
                        roomId
                    },
                    data: {
                        lastSeen: new Date(),
                        isFocused
                    }
                });

                // Broadcast focus change to other users in the room
                socket.to(roomId).emit('user_focus_update', {
                    roomId,
                    userId,
                    username,
                    isFocused,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('User focus change error:', error);
            }
        });

        // Handle typing indicators
        socket.on('typing_indicator', async (data: TypingIndicatorData) => {
            try {
                const { documentId, isTyping, userId, username } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    return;
                }

                // Update typing status in database
                await prisma.userPresence.updateMany({
                    where: {
                        userId,
                        roomId: documentId
                    },
                    data: {
                        isTyping
                    }
                });

                // Broadcast to all users in the room except sender
                socket.to(documentId).emit('typing_updated', {
                    documentId,
                    isTyping,
                    userId,
                    username
                });
            } catch (error) {
                console.error('Typing indicator error:', error);
            }
        });

        // Handle room request notifications
        socket.on('room_request_created', async (data: { roomId: string, userId: string, username: string }) => {
            try {
                const { roomId, userId, username } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    return;
                }

                // Notify room owner about new request
                socket.to(roomId).emit('room_request_received', {
                    roomId,
                    userId,
                    username,
                    timestamp: new Date()
                });

                console.log(`📝 Room request created by ${username} for room ${roomId}`);
            } catch (error) {
                console.error('Room request notification error:', error);
            }
        });

        // Handle request approval/rejection notifications
        socket.on('room_request_updated', async (data: { requestId: string, status: string, userId: string, username: string }) => {
            try {
                const { requestId, status, username } = data;
                const userData = socket.data.user;

                if (!userData) {
                    return;
                }

                // Notify the requester about the decision
                socket.emit('room_request_decision', {
                    requestId,
                    status,
                    username,
                    timestamp: new Date()
                });

                console.log(`📝 Room request ${status} for ${username}`);
            } catch (error) {
                console.error('Room request update notification error:', error);
            }
        });

        // Handle user kicked from room
        socket.on('user_kicked', async (data: { roomId: string, userId: string, username: string }) => {
            try {
                const { roomId, userId, username } = data;
                const userData = socket.data.user;

                if (!userData) {
                    return;
                }

                // Notify the kicked user
                socket.to(roomId).emit('user_kicked_notification', {
                    roomId,
                    userId,
                    username,
                    timestamp: new Date()
                });

                console.log(`👢 User ${username} kicked from room ${roomId}`);
            } catch (error) {
                console.error('User kicked notification error:', error);
            }
        });

        // Handle room deleted
        socket.on('room_deleted', async (data: { roomId: string, ownerId: string, ownerName: string }) => {
            try {
                const { roomId, ownerId, ownerName } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== ownerId) {
                    return;
                }

                // Notify all users in the room
                socket.to(roomId).emit('room_deleted_notification', {
                    roomId,
                    ownerName,
                    timestamp: new Date()
                });

                console.log(`🗑️ Room ${roomId} deleted by ${ownerName}`);
            } catch (error) {
                console.error('Room deleted notification error:', error);
            }
        });

        // Handle user role updated
        socket.on('user_role_updated', async (data: { roomId: string, userId: string, username: string, newRole: string }) => {
            try {
                const { roomId, userId, username, newRole } = data;
                const userData = socket.data.user;

                if (!userData) {
                    return;
                }

                // Notify all users in the room
                socket.to(roomId).emit('user_role_updated_notification', {
                    roomId,
                    userId,
                    username,
                    newRole,
                    timestamp: new Date()
                });

                console.log(`👤 User ${username} role updated to ${newRole} in room ${roomId}`);
            } catch (error) {
                console.error('User role updated notification error:', error);
            }
        });

        // Handle canvas drawing
        socket.on('canvas_draw', async (data: CanvasDrawData) => {
            try {
                console.log(`🎨 Received canvas draw event:`, data);
                const { roomId, userId, username, drawData, timestamp } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    console.log(`❌ Unauthorized canvas draw attempt by ${userId}`);
                    socket.emit('error', { message: 'Unauthorized' });
                    return;
                }

                // Check if user has access to the room
                const room = await prisma.room.findUnique({
                    where: { id: roomId },
                    include: {
                        members: {
                            where: { userId }
                        }
                    }
                });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                const isMember = room.members.length > 0;
                const isOwner = room.ownerId === userId;

                if (!isMember && !isOwner && !room.isPublic) {
                    socket.emit('error', { message: 'Access denied' });
                    return;
                }

                // Save stroke to database (only for 'draw' events to avoid spam)
                if (drawData.type === 'draw') {
                    console.log(`💾 Saving draw stroke to database for room ${roomId}`);
                    const stroke: CanvasStroke = {
                        type: drawData.type,
                        x: drawData.x,
                        y: drawData.y,
                        color: drawData.color,
                        brushSize: drawData.brushSize,
                        tool: drawData.tool,
                        userId,
                        username,
                        timestamp,
                    };

                    try {
                        await canvasService.addStroke(roomId, stroke);
                        console.log(`✅ Stroke saved successfully`);
                    } catch (error) {
                        console.error('Failed to save stroke:', error);
                        // Don't fail the real-time sync if DB save fails
                    }
                } else {
                    console.log(`⏭️ Skipping database save for ${drawData.type} event`);
                }

                // Broadcast drawing data to all users in the room except sender
                socket.to(roomId).emit('canvas_draw_update', {
                    roomId,
                    userId,
                    username,
                    drawData,
                    timestamp
                });

                console.log(`🎨 Canvas draw by ${username} in room ${roomId}`);
            } catch (error) {
                console.error('Canvas draw error:', error);
                socket.emit('error', { message: 'Failed to process canvas draw' });
            }
        });

        // Handle canvas state sync
        socket.on('canvas_state_sync', async (data: CanvasStateData) => {
            try {
                const { roomId, userId, username, canvasState, timestamp } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    socket.emit('error', { message: 'Unauthorized' });
                    return;
                }

                // Check if user has access to the room
                const room = await prisma.room.findUnique({
                    where: { id: roomId },
                    include: {
                        members: {
                            where: { userId }
                        }
                    }
                });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                const isMember = room.members.length > 0;
                const isOwner = room.ownerId === userId;

                if (!isMember && !isOwner && !room.isPublic) {
                    socket.emit('error', { message: 'Access denied' });
                    return;
                }

                // Broadcast canvas state to all users in the room except sender
                socket.to(roomId).emit('canvas_state_updated', {
                    roomId,
                    userId,
                    username,
                    canvasState,
                    timestamp
                });

                console.log(`🖼️ Canvas state sync by ${username} in room ${roomId}`);
            } catch (error) {
                console.error('Canvas state sync error:', error);
                socket.emit('error', { message: 'Failed to sync canvas state' });
            }
        });

        // Handle canvas clear
        socket.on('canvas_clear', async (data: { roomId: string, userId: string, username: string }) => {
            try {
                const { roomId, userId, username } = data;
                const userData = socket.data.user;

                if (!userData || userData.userId !== userId) {
                    socket.emit('error', { message: 'Unauthorized' });
                    return;
                }

                // Check if user has access to the room
                const room = await prisma.room.findUnique({
                    where: { id: roomId },
                    include: {
                        members: {
                            where: { userId }
                        }
                    }
                });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                const isMember = room.members.length > 0;
                const isOwner = room.ownerId === userId;

                if (!isMember && !isOwner && !room.isPublic) {
                    socket.emit('error', { message: 'Access denied' });
                    return;
                }

                // Clear canvas state from database
                try {
                    await canvasService.clearCanvasState(roomId);
                } catch (error) {
                    console.error('Failed to clear canvas state:', error);
                    // Don't fail the real-time sync if DB clear fails
                }

                // Broadcast canvas clear to all users in the room
                socket.to(roomId).emit('canvas_cleared', {
                    roomId,
                    userId,
                    username,
                    timestamp: new Date()
                });

                console.log(`🧹 Canvas cleared by ${username} in room ${roomId}`);
            } catch (error) {
                console.error('Canvas clear error:', error);
                socket.emit('error', { message: 'Failed to clear canvas' });
            }
        });



        // Handle disconnection
        socket.on('disconnect', async (reason) => {
            console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
            try {
                const userData = socket.data.user;
                if (userData) {
                    // Remove user from all rooms they were in
                    const userPresence = await prisma.userPresence.findMany({
                        where: { userId: userData.userId }
                    });

                    for (const presence of userPresence) {
                        socket.to(presence.roomId).emit('user_left', {
                            userId: userData.userId,
                            username: userData.username
                        });
                    }

                    // Remove user presence
                    await prisma.userPresence.deleteMany({
                        where: { userId: userData.userId }
                    });

                    // Remove from connected users
                    connectedUsers.delete(socket.id);

                    // Clean up document update timers for this user
                    for (const [timerKey, timer] of documentUpdateTimers.entries()) {
                        if (timerKey.includes(userData.userId)) {
                            clearTimeout(timer);
                            documentUpdateTimers.delete(timerKey);
                        }
                    }

                    console.log(`🔌 User disconnected: ${userData.username} (${userData.userId})`);
                }
            } catch (error) {
                console.error('Disconnect error:', error);
            }
        });
    });

    console.log('📡 Socket.IO handlers configured');
}; 