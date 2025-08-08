import { getRoomById } from "../../services/roomService";
import { Request, Response } from "express";

export const getRoomByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const userId = req.user?.id;

        if (!userId || !roomId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await getRoomById(roomId, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        // Send response with appropriate status code
        const statusCode = result.statusCode || 200;
        res.status(statusCode).json({ room: result.room });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ error: 'Failed to get room' });
    }
};
