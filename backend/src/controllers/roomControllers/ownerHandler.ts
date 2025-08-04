import { Request, Response } from 'express';
import { kickUserFromRoom, deleteRoom, updateUserRole } from '../../services/roomOwnerService';

// Kick user from room
export const kickUserHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, userId } = req.params;
        const ownerId = req.user?.id;

        if (!ownerId || !roomId || !userId) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        const result = await kickUserFromRoom(roomId, userId, ownerId);

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.json({
            message: 'User kicked successfully',
            room: result.room
        });
    } catch (error) {
        console.error('Kick user error:', error);
        res.status(500).json({ error: 'Failed to kick user' });
    }
};

// Delete room (owner only)
export const deleteRoomHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const ownerId = req.user?.id;

        if (!ownerId || !roomId) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        const result = await deleteRoom(roomId, ownerId);

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.json({
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
};

// Update user role
export const updateUserRoleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, userId } = req.params;
        const { role } = req.body;
        const ownerId = req.user?.id;

        if (!ownerId || !roomId || !userId) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        if (!role || !['OWNER', 'EDITOR', 'VIEWER'].includes(role)) {
            res.status(400).json({ error: 'Invalid role. Must be OWNER, EDITOR, or VIEWER' });
            return;
        }

        const result = await updateUserRole(roomId, userId, role, ownerId);

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.json({
            message: 'User role updated successfully',
            member: result.member
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
}; 