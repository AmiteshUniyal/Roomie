import { prisma } from '../index';

export interface RoomRequestResult {
    success: boolean;
    request?: any;
    requests?: any[];
    error?: string;
    statusCode?: number;
}

// Create a room request
export const createRoomRequest = async (userId: string, roomId: string, message?: string): Promise<RoomRequestResult> => {
    try {
        // Check if room exists
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

        // Check if user is already a member
        const existingMember = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId
                }
            }
        });

        if (existingMember) {
            return {
                success: false,
                error: 'User is already a member of this room',
                statusCode: 400
            };
        }

        // Check if user is the owner
        if (room.ownerId === userId) {
            return {
                success: false,
                error: 'Room owner cannot request to join their own room',
                statusCode: 400
            };
        }

        // Check if there's already a pending request
        const existingRequest = await prisma.roomRequest.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId
                }
            }
        });

        if (existingRequest) {
            if (existingRequest.status === 'PENDING') {
                return {
                    success: false,
                    error: 'Request already pending',
                    statusCode: 400
                };
            } else if (existingRequest.status === 'REJECTED') {
                // Update existing rejected request to pending
                const updatedRequest = await prisma.roomRequest.update({
                    where: { id: existingRequest.id },
                    data: {
                        status: 'PENDING',
                        message: message || null,
                        updatedAt: new Date()
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        },
                        room: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                });

                return {
                    success: true,
                    request: updatedRequest
                };
            }
        }

        // Create new request
        const request = await prisma.roomRequest.create({
            data: {
                userId,
                roomId,
                message: message || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return {
            success: true,
            request
        };
    } catch (error) {
        console.error('Create room request error:', error);
        return {
            success: false,
            error: 'Failed to create room request',
            statusCode: 500
        };
    }
};

// Get room requests (for room owner)
export const getRoomRequests = async (roomId: string, userId: string): Promise<RoomRequestResult> => {
    try {
        // Check if user is the room owner
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

        if (room.ownerId !== userId) {
            return {
                success: false,
                error: 'Only room owner can view requests',
                statusCode: 403
            };
        }

        // Get all requests for the room
        const requests = await prisma.roomRequest.findMany({
            where: { roomId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            requests
        };
    } catch (error) {
        console.error('Get room requests error:', error);
        return {
            success: false,
            error: 'Failed to get room requests',
            statusCode: 500
        };
    }
};

// Approve room request
export const approveRoomRequest = async (requestId: string, userId: string): Promise<RoomRequestResult> => {
    try {
        // Get the request
        const request = await prisma.roomRequest.findUnique({
            where: { id: requestId },
            include: {
                room: true
            }
        });

        if (!request) {
            return {
                success: false,
                error: 'Request not found',
                statusCode: 404
            };
        }

        // Check if user is the room owner
        if (request.room.ownerId !== userId) {
            return {
                success: false,
                error: 'Only room owner can approve requests',
                statusCode: 403
            };
        }

        // Check if request is pending
        if (request.status !== 'PENDING') {
            return {
                success: false,
                error: 'Request is not pending',
                statusCode: 400
            };
        }

        // Update request status only (user will join via room code)
        const updatedRequest = await prisma.roomRequest.update({
            where: { id: requestId },
            data: { status: 'APPROVED' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return {
            success: true,
            request: updatedRequest
        };
    } catch (error) {
        console.error('Approve room request error:', error);
        return {
            success: false,
            error: 'Failed to approve room request',
            statusCode: 500
        };
    }
};

// Reject room request
export const rejectRoomRequest = async (requestId: string, userId: string): Promise<RoomRequestResult> => {
    try {
        // Get the request
        const request = await prisma.roomRequest.findUnique({
            where: { id: requestId },
            include: {
                room: true
            }
        });

        if (!request) {
            return {
                success: false,
                error: 'Request not found',
                statusCode: 404
            };
        }

        // Check if user is the room owner
        if (request.room.ownerId !== userId) {
            return {
                success: false,
                error: 'Only room owner can reject requests',
                statusCode: 403
            };
        }

        // Check if request is pending
        if (request.status !== 'PENDING') {
            return {
                success: false,
                error: 'Request is not pending',
                statusCode: 400
            };
        }

        // Update request status
        const updatedRequest = await prisma.roomRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return {
            success: true,
            request: updatedRequest
        };
    } catch (error) {
        console.error('Reject room request error:', error);
        return {
            success: false,
            error: 'Failed to reject room request',
            statusCode: 500
        };
    }
};

// Get user's pending requests
export const getUserRequests = async (userId: string): Promise<RoomRequestResult> => {
    try {
        const requests = await prisma.roomRequest.findMany({
            where: { userId },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        owner: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            requests
        };
    } catch (error) {
        console.error('Get user requests error:', error);
        return {
            success: false,
            error: 'Failed to get user requests',
            statusCode: 500
        };
    }
}; 