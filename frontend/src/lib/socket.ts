import { io, Socket } from 'socket.io-client';
import { SocketEvents, UserPresence } from '@/types';
import config from './config';

class SocketManager {
    private socket: Socket | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    // Singleton pattern
    private static instance: SocketManager;

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    // Connect to the server
    public connect(userId: string, username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔌 Attempting to connect to socket server:', config.socketUrl);
                console.log('👤 User:', { userId, username });

                // Connect to the backend server
                this.socket = io(config.socketUrl, {
                    transports: ['websocket', 'polling'],
                    autoConnect: true,
                });

                this.setupEventListeners();
                this.setupConnectionHandlers(resolve, reject);

                // Authenticate after connection
                this.socket.on('connect', () => {
                    console.log('🔐 Authenticating user...');
                    this.socket?.emit('authenticate', { userId, username });
                });
            } catch (error) {
                console.error('❌ Socket connection error:', error);
                reject(error);
            }
        });
    }

    // Disconnect from the server
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Join a room
    public joinRoom(roomId: string, userId: string, username: string): void {
        if (this.socket && this.isConnected) {
            console.log('🚪 Joining room:', { roomId, userId, username });
            this.socket.emit('join_room', { roomId });
        }
    }

    // Leave a room
    public leaveRoom(roomId: string, userId: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave_room', { roomId, userId });
        }
    }

    // Send document update
    public sendDocumentUpdate(documentId: string, content: string, userId: string, roomId: string): void {
        if (this.socket && this.isConnected) {
            console.log('📤 Sending document update:', { documentId, content: content.substring(0, 50), userId, roomId });
            this.socket.emit('document_update', {
                documentId,
                content,
                userId,
                roomId,
                username: (this.socket as any).data?.user?.username || 'Unknown',
                timestamp: Date.now(),
            });
        }
    }

    // Send cursor position
    public sendCursorPosition(roomId: string, userId: string, username: string, position: { x: number; y: number }): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('cursor_update', {
                userId,
                username,
                position,
                roomId,
            });
        }
    }

    // Send typing indicator
    public sendTypingIndicator(roomId: string, userId: string, username: string, isTyping: boolean): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing_indicator', {
                userId,
                username,
                isTyping,
                roomId,
            });
        }
    }

    // Send canvas drawing data
    public sendCanvasDraw(roomId: string, userId: string, data: {
        x: number;
        y: number;
        color: string;
        tool: 'pen' | 'eraser' | 'highlighter';
        strokeWidth: number;
        type?: 'start' | 'draw' | 'end';
    }): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('canvas_draw', {
                roomId,
                userId,
                username: (this.socket as any).data?.user?.username || 'Unknown',
                drawData: {
                    type: data.type || 'draw',
                    x: data.x,
                    y: data.y,
                    color: data.color,
                    brushSize: data.strokeWidth,
                    tool: data.tool,
                },
                timestamp: Date.now(),
            });
        }
    }

    // Clear canvas
    public clearCanvas(roomId: string, userId: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('canvas_clear', {
                roomId,
                userId,
                username: (this.socket as any).data?.user?.username || 'Unknown',
            });
        }
    }

    // Listen for document updates
    public onDocumentUpdate(callback: (data: SocketEvents['doc:update']) => void): void {
        if (this.socket) {
            this.socket.on('document_updated', callback);
            this.socket.on('document_update_realtime', callback);
        }
    }

    // Listen for user joined
    public onUserJoined(callback: (data: SocketEvents['user:joined']) => void): void {
        if (this.socket) {
            this.socket.on('user_joined', callback);
        }
    }

    // Listen for user left
    public onUserLeft(callback: (data: SocketEvents['user:left']) => void): void {
        if (this.socket) {
            this.socket.on('user_left', callback);
        }
    }

    // Listen for cursor updates
    public onCursorUpdate(callback: (data: SocketEvents['user:cursor']) => void): void {
        if (this.socket) {
            this.socket.on('cursor_update', callback);
        }
    }

    // Listen for typing indicators
    public onTypingIndicator(callback: (data: SocketEvents['user:typing']) => void): void {
        if (this.socket) {
            this.socket.on('typing_indicator', callback);
        }
    }

    // Listen for canvas draw events
    public onCanvasDraw(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('canvas_draw_update', callback);
        }
    }

    // Listen for canvas clear events
    public onCanvasClear(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('canvas_cleared', callback);
        }
    }

    // Listen for canvas state loaded events
    public onCanvasStateLoaded(callback: (data: SocketEvents['canvas:state:loaded']) => void): void {
        if (this.socket) {
            this.socket.on('canvas_state_loaded', callback);
        }
    }

    // Listen for room members
    public onRoomMembers(callback: (data: UserPresence[]) => void): void {
        if (this.socket) {
            this.socket.on('room_members', callback);
        }
    }

    // Remove all listeners
    public removeAllListeners(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    // Get connection status
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    // Get socket instance
    public getSocket(): Socket | null {
        return this.socket;
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Connected to socket server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server:', reason);
            this.isConnected = false;

            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.socket?.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.isConnected = false;

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                    this.socket?.connect();
                }, this.reconnectDelay * this.reconnectAttempts);
            }
        });

        // Authentication events
        this.socket.on('authenticated', (data: { success: boolean; error?: string }) => {
            if (data.success) {
                console.log('✅ User authenticated successfully');
            } else {
                console.error('❌ Authentication failed:', data.error);
            }
        });

        this.socket.on('error', (data: { message: string }) => {
            console.error('❌ Socket error:', data.message);
        });
    }

    private setupConnectionHandlers(resolve: () => void, reject: (error: Error) => void): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            resolve();
        });

        this.socket.on('connect_error', (error) => {
            reject(error);
        });
    }
}

// Export singleton instance
export const socketManager = SocketManager.getInstance();
export default socketManager; 