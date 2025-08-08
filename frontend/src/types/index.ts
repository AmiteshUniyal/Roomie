// User types
export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    createdAt: Date;
}

// Document types
export interface Document {
    id: string;
    title: string;
    content: string;
    roomId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Room types
export interface RoomMember {
    id: string;
    userId: string;
    roomId: string;
    role: 'OWNER' | 'ADMIN' | 'VIEWER';
    createdAt: Date;
    user: {
        id: string;
        username: string;
        avatar?: string;
    };
}

export interface RoomRequest {
    id: string;
    userId: string;
    roomId: string;
    message?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
    updatedAt: Date;
}

export interface Room {
    id: string;
    name: string;
    description?: string;
    code: string; // Room code for sharing
    ownerId: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner?: {
        id: string;
        username: string;
        avatar?: string;
    };
    members?: RoomMember[];
    documents?: Document[];
    userRequest?: RoomRequest; // For limited access responses
}

// User presence in room
export interface UserPresence {
    userId: string;
    username: string;
    avatar?: string;
    cursorPosition?: {
        x: number;
        y: number;
    };
    isTyping: boolean;
    lastSeen: Date;
}

// Socket event types
export interface SocketEvents {
    // Connection events
    'user:join': {
        userId: string;
        username: string;
        roomId: string;
    };
    'user:leave': {
        userId: string;
        roomId: string;
    };
    'user:joined': UserPresence;
    'user:left': {
        userId: string;
        username: string;
    };

    // Document editing events
    'doc:update': {
        documentId: string;
        content: string;
        userId: string;
        username: string;
        timestamp: number;
    };
    'doc:sync': {
        roomId: string;
        content: string;
        version: number;
    };

    // Cursor and presence events
    'user:cursor': {
        userId: string;
        username: string;
        position: {
            x: number;
            y: number;
        };
        roomId: string;
    };
    'user:typing': {
        userId: string;
        username: string;
        isTyping: boolean;
        roomId: string;
    };

    // Room management events
    'room:create': {
        name: string;
        description?: string;
        isPublic: boolean;
        ownerId: string;
    };
    'room:join': {
        roomId: string;
        userId: string;
    };
    'room:leave': {
        roomId: string;
        userId: string;
    };
    'room:kick': {
        roomId: string;
        userId: string;
        kickedBy: string;
    };

    // Whiteboard events
    'canvas:draw': {
        roomId: string;
        userId: string;
        username: string;
        drawData: {
            type: 'start' | 'draw' | 'end';
            x: number;
            y: number;
            color: string;
            brushSize: number;
            tool: 'pen' | 'eraser';
        };
        timestamp: number;
    };
    'canvas:clear': {
        roomId: string;
        userId: string;
        username: string;
        timestamp: Date;
    };
    'canvas:state:loaded': {
        roomId: string;
        strokes: Array<{
            type: 'start' | 'draw' | 'end';
            x: number;
            y: number;
            color: string;
            brushSize: number;
            tool: 'pen' | 'eraser';
            userId: string;
            username: string;
            timestamp: number;
        }>;
        lastUpdated: Date;
    };
} 