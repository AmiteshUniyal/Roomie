import { createRoom } from "../../services/roomService";
import { Request, Response } from "express";

export const createRoomHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, isPublic = false } = req.body;
        const userId = req.user?.id;

        if (!userId || !name) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const room = await createRoom(userId, name, description, isPublic);

        res.status(201).json({
            message: 'Room created successfully',
            room
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
};

