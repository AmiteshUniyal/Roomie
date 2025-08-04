import api from '@/lib/api';
import { Room, Document } from '@/types';

// Room service interfaces
export interface CreateRoomData {
    name: string;
    description?: string;
    isPublic: boolean;
}

export interface JoinRoomData {
    roomCode: string;
}

export interface RoomResponse {
    room: Room;
    message: string;
}

export interface RoomsResponse {
    rooms: Room[];
    message: string;
}

export interface DocumentsResponse {
    documents: Document[];
    message: string;
}

// Room service class
class RoomService {
    // Create a new room
    async createRoom(roomData: CreateRoomData): Promise<RoomResponse> {
        return api.post<RoomResponse>('/rooms', roomData);
    }

    // Join a room by code
    async joinRoom(joinData: JoinRoomData): Promise<RoomResponse> {
        return api.post<RoomResponse>(`/rooms/join/${joinData.roomCode}`);
    }

    // Get room by ID
    async getRoom(roomId: string): Promise<RoomResponse> {
        return api.get<RoomResponse>(`/rooms/${roomId}`);
    }

    // Get user's rooms
    async getUserRooms(): Promise<RoomsResponse> {
        return api.get<RoomsResponse>('/rooms/user');
    }

    // Leave a room
    async leaveRoom(roomId: string): Promise<{ message: string }> {
        return api.post<{ message: string }>(`/rooms/${roomId}/leave`);
    }

    // Delete a room (owner only)
    async deleteRoom(roomId: string): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/rooms/${roomId}`);
    }

    // Get room documents
    async getRoomDocuments(roomId: string): Promise<DocumentsResponse> {
        return api.get<DocumentsResponse>(`/rooms/${roomId}/documents`);
    }

    // Request access to private room
    async requestRoomAccess(roomId: string): Promise<{ message: string }> {
        return api.post<{ message: string }>(`/rooms/${roomId}/request`);
    }

    // Approve room request (owner only)
    async approveRoomRequest(roomId: string, userId: string): Promise<{ message: string }> {
        return api.post<{ message: string }>(`/rooms/${roomId}/approve`, { userId });
    }

    // Reject room request (owner only)
    async rejectRoomRequest(roomId: string, userId: string): Promise<{ message: string }> {
        return api.post<{ message: string }>(`/rooms/${roomId}/reject`, { userId });
    }

    // Kick user from room (owner only)
    async kickUser(roomId: string, userId: string): Promise<{ message: string }> {
        return api.post<{ message: string }>(`/rooms/${roomId}/kick`, { userId });
    }
}

// Export singleton instance
export const roomService = new RoomService();
export default roomService; 