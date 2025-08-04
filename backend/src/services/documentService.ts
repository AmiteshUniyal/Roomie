import { prisma } from '../index';

export interface DocumentResult {
    success: boolean;
    document?: any;
    documents?: any[];
    error?: string;
    statusCode?: number;
}

// Create a new document
export const createDocument = async (userId: string, title: string, roomId: string): Promise<DocumentResult> => {
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
        return {
            success: false,
            error: 'Room not found',
            statusCode: 404
        };
    }

    const isMember = room.members.length > 0;
    const isOwner = room.ownerId === userId;

    if (!isMember && !isOwner) {
        return {
            success: false,
            error: 'Access denied',
            statusCode: 403
        };
    }

    // Create document
    const document = await prisma.document.create({
        data: {
            title,
            roomId,
            createdBy: userId
        },
        include: {
            creator: {
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
        document
    };
};

// Get documents by room
export const getDocumentsByRoom = async (roomId: string, userId: string): Promise<DocumentResult> => {
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
        return {
            success: false,
            error: 'Room not found',
            statusCode: 404
        };
    }

    const isMember = room.members.length > 0;
    const isOwner = room.ownerId === userId;

    if (!isMember && !isOwner) {
        return {
            success: false,
            error: 'Access denied',
            statusCode: 403
        };
    }

    // Get documents
    const documents = await prisma.document.findMany({
        where: { roomId },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return {
        success: true,
        documents
    };
};

// Get document by ID
export const getDocumentById = async (documentId: string, userId: string): Promise<DocumentResult> => {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            room: {
                include: {
                    members: {
                        where: { userId }
                    }
                }
            },
            creator: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    if (!document) {
        return {
            success: false,
            error: 'Document not found',
            statusCode: 404
        };
    }

    // Check if user has access to the room
    const isMember = document.room.members.length > 0;
    const isOwner = document.room.ownerId === userId;

    if (!isMember && !isOwner) {
        return {
            success: false,
            error: 'Access denied',
            statusCode: 403
        };
    }

    return {
        success: true,
        document
    };
};

// Update document content
export const updateDocumentContent = async (documentId: string, content: string, userId: string): Promise<DocumentResult> => {
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
        return {
            success: false,
            error: 'Document not found',
            statusCode: 404
        };
    }

    // Check if user has edit access
    const isMember = document.room.members.length > 0;
    const isOwner = document.room.ownerId === userId;
    const isCreator = document.createdBy === userId;

    if (!isMember && !isOwner && !isCreator) {
        return {
            success: false,
            error: 'Access denied',
            statusCode: 403
        };
    }

    // Update document
    const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
            content,
            updatedAt: new Date()
        },
        include: {
            creator: {
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
        document: updatedDocument
    };
};

// Update document title
export const updateDocumentTitle = async (documentId: string, title: string, userId: string): Promise<DocumentResult> => {
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
        return {
            success: false,
            error: 'Document not found',
            statusCode: 404
        };
    }

    // Check if user has edit access
    const isMember = document.room.members.length > 0;
    const isOwner = document.room.ownerId === userId;
    const isCreator = document.createdBy === userId;

    if (!isMember && !isOwner && !isCreator) {
        return {
            success: false,
            error: 'Access denied',
            statusCode: 403
        };
    }

    // Update document
    const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
            title,
            updatedAt: new Date()
        },
        include: {
            creator: {
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
        document: updatedDocument
    };
};

// Delete document
export const deleteDocument = async (documentId: string, userId: string): Promise<DocumentResult> => {
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
        return {
            success: false,
            error: 'Document not found',
            statusCode: 404
        };
    }

    // Check if user can delete (owner or creator)
    const isOwner = document.room.ownerId === userId;
    const isCreator = document.createdBy === userId;

    if (!isOwner && !isCreator) {
        return {
            success: false,
            error: 'Access denied',
            statusCode: 403
        };
    }

    // Delete document
    await prisma.document.delete({
        where: { id: documentId }
    });

    return {
        success: true
    };
}; 