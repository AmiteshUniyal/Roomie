import { getUserRooms } from "../../services/roomService";
import { Request, Response } from "express";

export const getUserRoomsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const rooms = await getUserRooms(userId);

        res.json({ rooms });
    } catch (error) {
        console.error('Get user rooms error:', error);
        res.status(500).json({ error: 'Failed to get user rooms' });
    }
};
