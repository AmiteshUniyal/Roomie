import { prisma } from '../index';

export interface RoomResult {
    success: boolean;
    room?: any;
    error?: string;
    statusCode?: number;
}

// Generate unique room code
const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Create a new room
export const createRoom = async (userId: string, name: string, description?: string, isPublic = false) => {
    // Generate unique room code
    let roomCode: string;
    let existingRoom;
    do {
        roomCode = generateRoomCode();
        existingRoom = await prisma.room.findUnique({
            where: { code: roomCode }
        });
    } while (existingRoom);

    // Create room
    const room = await prisma.room.create({
        data: {
            name,
            description: description || null,
            code: roomCode,
            isPublic,
            ownerId: userId
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    // Add owner as member with OWNER role
    await prisma.roomMember.create({
        data: {
            userId,
            roomId: room.id,
            role: 'OWNER'
        }
    });

    return room;
};

// Get user's rooms
export const getUserRooms = async (userId: string) => {
    return await prisma.room.findMany({
        where: {
            OR: [
                { ownerId: userId },
                {
                    members: {
                        some: {
                            userId
                        }
                    }
                }
            ]
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    members: true,
                    documents: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
};

// Get room by ID with access control
export const getRoomById = async (roomId: string, userId: string): Promise<RoomResult> => {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            },
            documents: {
                orderBy: {
                    updatedAt: 'desc'
                }
            }
        }
    });

    if (!room) {
        return {
            success: false,
            error: 'Room not found',
            statusCode: 404
        };
    }

    // Check if user is member or owner
    const isMember = room.members.some((member: any) => member.userId === userId);
    const isOwner = room.ownerId === userId;

    // For private rooms, if user is not a member/owner, return limited room info for request access
    if (!isMember && !isOwner && !room.isPublic) {
        // Check if user has any pending/approved request
        const existingRequest = await prisma.roomRequest.findFirst({
            where: {
                userId,
                roomId: room.id
            }
        });

        // Return limited room info without sensitive data (documents, members)
        const limitedRoom = {
            id: room.id,
            name: room.name,
            description: room.description,
            code: room.code,
            isPublic: room.isPublic,
            ownerId: room.ownerId,
            owner: room.owner,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            members: [], // Empty for non-members
            documents: [], // Empty for non-members
            userRequest: existingRequest // Include request status if any
        };

        return {
            success: true,
            room: limitedRoom,
            statusCode: 202 // Indicates limited access - requires action
        };
    }

    return {
        success: true,
        room
    };
};

// Join room by code
export const joinRoomByCode = async (roomCode: string, userId: string): Promise<RoomResult> => {
    const room = await prisma.room.findUnique({
        where: { code: roomCode },
        include: {
            members: {
                where: { userId }
            }
        }
    });

    if (!room) {
        return {
            success: false,
            error: 'Room not found',
            statusCode: 404
        };
    }

    // Check if user is already a member
    if (room.members.length > 0) {
        return {
            success: false,
            error: 'Already a member of this room',
            statusCode: 400
        };
    }

    // For private rooms, check if user has an approved request
    if (!room.isPublic) {
        const approvedRequest = await prisma.roomRequest.findFirst({
            where: {
                userId,
                roomId: room.id,
                status: 'APPROVED'
            }
        });

        if (approvedRequest) {
            // User has approved request, add them as member and clean up the request
            await prisma.roomMember.create({
                data: {
                    userId,
                    roomId: room.id,
                    role: 'VIEWER'
                }
            });

            // Delete the approved request since user is now a member
            await prisma.roomRequest.delete({
                where: { id: approvedRequest.id }
            });

            return {
                success: true,
                room
            };
        } else {
            // No approved request, return room info for request access page
            return {
                success: true,
                room,
                statusCode: 202, // Accepted but requires action (request access)
            };
        }
    }

    // For public rooms, directly add user as member
    await prisma.roomMember.create({
        data: {
            userId,
            roomId: room.id,
            role: 'VIEWER'
        }
    });

    return {
        success: true,
        room
    };
};

// Leave room
export const leaveRoom = async (roomId: string, userId: string): Promise<RoomResult> => {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            owner: true
        }
    });

    if (!room) {
        return {
            success: false,
            error: 'Room not found',
            statusCode: 404
        };
    }

    // Check if user is the owner
    if (room.ownerId === userId) {
        return {
            success: false,
            error: 'Room owner cannot leave. Transfer ownership or delete the room.',
            statusCode: 400
        };
    }

    // Remove user from room
    await prisma.roomMember.deleteMany({
        where: {
            userId,
            roomId
        }
    });

    return {
        success: true
    };
}; 