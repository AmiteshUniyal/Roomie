import { prisma } from '../index';

export interface OwnerResult {
    success: boolean;
    room?: any;
    member?: any;
    error?: string;
    statusCode?: number;
}

// Kick user from room
export const kickUserFromRoom = async (roomId: string, userId: string, ownerId: string): Promise<OwnerResult> => {
    try {
        // Check if room exists and user is owner
        const room = await prisma.room.findUnique({
            where: { id: roomId },
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

        if (room.ownerId !== ownerId) {
            return {
                success: false,
                error: 'Only room owner can kick users',
                statusCode: 403
            };
        }

        // Check if user is trying to kick themselves
        if (userId === ownerId) {
            return {
                success: false,
                error: 'Room owner cannot kick themselves',
                statusCode: 400
            };
        }

        // Check if user is a member
        if (room.members.length === 0) {
            return {
                success: false,
                error: 'User is not a member of this room',
                statusCode: 400
            };
        }

        // Remove user from room
        await prisma.roomMember.delete({
            where: {
                userId_roomId: {
                    userId,
                    roomId
                }
            }
        });

        // Remove user presence
        await prisma.userPresence.deleteMany({
            where: {
                userId,
                roomId
            }
        });

        // Get updated room info
        const updatedRoom = await prisma.room.findUnique({
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
                }
            }
        });

        return {
            success: true,
            room: updatedRoom
        };
    } catch (error) {
        console.error('Kick user from room error:', error);
        return {
            success: false,
            error: 'Failed to kick user from room',
            statusCode: 500
        };
    }
};

// Delete room (owner only)
export const deleteRoom = async (roomId: string, ownerId: string): Promise<OwnerResult> => {
    try {
        // Check if room exists and user is owner
        const room = await prisma.room.findUnique({
            where: { id: roomId }
        });

        if (!room) {
            return {
                success: false,
                error: 'Room not found',
                statusCode: 404
            };
        }

        if (room.ownerId !== ownerId) {
            return {
                success: false,
                error: 'Only room owner can delete the room',
                statusCode: 403
            };
        }

        // Delete room and all related data (cascade)
        await prisma.room.delete({
            where: { id: roomId }
        });

        return {
            success: true
        };
    } catch (error) {
        console.error('Delete room error:', error);
        return {
            success: false,
            error: 'Failed to delete room',
            statusCode: 500
        };
    }
};

// Update user role
export const updateUserRole = async (roomId: string, userId: string, role: string, ownerId: string): Promise<OwnerResult> => {
    try {
        // Check if room exists and user is owner
        const room = await prisma.room.findUnique({
            where: { id: roomId },
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

        if (room.ownerId !== ownerId) {
            return {
                success: false,
                error: 'Only room owner can update user roles',
                statusCode: 403
            };
        }

        // Check if user is a member
        if (room.members.length === 0) {
            return {
                success: false,
                error: 'User is not a member of this room',
                statusCode: 400
            };
        }

        // Check if trying to change owner role
        if (userId === ownerId && role !== 'OWNER') {
            return {
                success: false,
                error: 'Cannot change room owner role',
                statusCode: 400
            };
        }

        // Update user role
        const updatedMember = await prisma.roomMember.update({
            where: {
                userId_roomId: {
                    userId,
                    roomId
                }
            },
            data: { role: role as any },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        return {
            success: true,
            member: updatedMember
        };
    } catch (error) {
        console.error('Update user role error:', error);
        return {
            success: false,
            error: 'Failed to update user role',
            statusCode: 500
        };
    }
}; 