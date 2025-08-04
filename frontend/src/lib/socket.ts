import { io, Socket } from 'socket.io-client';
import { SocketEvents, UserPresence } from '@/types';
import config from './config';

class SocketManager {
    private socket: Socket | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private userId: string | null = null;
    private username: string | null = null;
    private isConnecting = false;

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
            if (this.isConnecting) {
                console.log('🔄 Already attempting to connect...');
                return;
            }

            try {
                this.isConnecting = true;
                this.userId = userId;
                this.username = username;
                
                console.log('🔌 Attempting to connect to socket server:', config.socketUrl);
                console.log('👤 User:', { userId, username });

                // Disconnect existing socket if any
                if (this.socket) {
                    this.socket.disconnect();
                    this.socket = null;
                }

                // Connect to the backend server with improved options
                this.socket = io(config.socketUrl, {
                    transports: ['websocket', 'polling'],
                    autoConnect: true,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    timeout: 20000
                });

                this.setupEventListeners();
                this.setupConnectionHandlers(resolve, reject);

                // Authenticate after connection
                this.socket.on('connect', () => {
                    console.log('✅ Connected to socket server');
                    this.isConnected = true;
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    
                    console.log('🔐 Authenticating user...');
                    this.socket?.emit('authenticate', { userId, username });
                });
            } catch (error) {
                this.isConnecting = false;
                console.error('❌ Socket connection error:', error);
                reject(error);
            }
        });
    }

    // Disconnect from the server
    public disconnect(): void {
        if (this.socket) {
            console.log('🔌 Disconnecting from socket server');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.isConnecting = false;
            this.userId = null;
            this.username = null;
        }
    }

    // Join a room
    public joinRoom(roomId: string, userId: string, username: string): void {
        if (this.socket && this.isConnected) {
            console.log('🚪 Joining room:', { roomId, userId, username });
            this.socket.emit('join_room', { roomId });
        } else {
            console.log('❌ Cannot join room - socket not connected');
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
                username: this.username || 'Unknown',
                timestamp: Date.now(),
            });
        } else {
            console.log('❌ Cannot send document update - socket not connected');
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
                roomId,
                userId,
                username,
                isTyping,
            });
        }
    }

    // Send canvas draw data
    public sendCanvasDraw(roomId: string, userId: string, data: {
        x: number;
        y: number;
        color: string;
        tool: 'pen' | 'eraser' | 'brush';
        strokeWidth: number;
        type?: 'start' | 'draw' | 'end';
    }): void {
        if (this.socket && this.isConnected) {
            const drawData = {
                roomId,
                userId,
                username: this.username || 'Unknown',
                drawData: {
                    type: data.type || 'draw',
                    x: data.x,
                    y: data.y,
                    color: data.color,
                    brushSize: data.strokeWidth,
                    tool: data.tool,
                },
                timestamp: Date.now(),
            };
            console.log(`🎨 Sending canvas draw event:`, drawData);
            this.socket.emit('canvas_draw', drawData);
        } else {
            console.log(`❌ Cannot send canvas draw - socket not connected or not available`);
        }
    }

    // Clear canvas
    public clearCanvas(roomId: string, userId: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('canvas_clear', {
                roomId,
                userId,
                username: this.username || 'Unknown',
            });
        }
    }

    // Listen for document updates
    public onDocumentUpdate(callback: (data: SocketEvents['doc:update']) => void): void {
        if (this.socket) {
            this.socket.on('document_update_realtime', callback);
        }
    }

    // Listen for user joined events
    public onUserJoined(callback: (data: SocketEvents['user:joined']) => void): void {
        if (this.socket) {
            this.socket.on('user_joined', callback);
        }
    }

    // Listen for user left events
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
    public onCanvasDraw(callback: (data: SocketEvents['canvas:draw']) => void): void {
        if (this.socket) {
            this.socket.on('canvas_draw_update', (data) => {
                console.log(`🎨 Received canvas draw update:`, data);
                callback(data);
            });
        }
    }

    // Listen for canvas clear events
    public onCanvasClear(callback: (data: SocketEvents['canvas:clear']) => void): void {
        if (this.socket) {
            this.socket.on('canvas_cleared', callback);
        }
    }

    // Listen for canvas state loaded events
    public onCanvasStateLoaded(callback: (data: SocketEvents['canvas:state:loaded']) => void): void {
        if (this.socket) {
            this.socket.on('canvas_state_loaded', (data) => {
                console.log(`📂 Received canvas state loaded:`, data);
                callback(data);
            });
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
                console.log('🔄 Server disconnected, attempting to reconnect...');
                setTimeout(() => {
                    if (this.socket && !this.isConnected) {
                        this.socket.connect();
                    }
                }, 1000);
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.isConnected = false;
            this.isConnecting = false;

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                    if (this.socket) {
                        this.socket.connect();
                    }
                }, this.reconnectDelay * this.reconnectAttempts);
            } else {
                console.error('❌ Max reconnection attempts reached');
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
            this.isConnecting = false;
            reject(error);
        });
    }
}

// Export singleton instance
export const socketManager = SocketManager.getInstance();
export default socketManager; 