import { createRoom } from "../../services/roomService";
import { Request, Response } from "express";

export const createRoomHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, isPublic = false } = req.body;
        const userId = req.user?.id;

        console.log('Create room request:', { name, description, isPublic, userId });

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            res.status(400).json({ error: 'Room name is required and must be a non-empty string' });
            return;
        }

        const room = await createRoom(userId, name.trim(), description?.trim() || undefined, isPublic);

        res.status(201).json({
            message: 'Room created successfully',
            room
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
};

