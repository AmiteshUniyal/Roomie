import { leaveRoom } from "../../services/roomService";
import { Request, Response } from "express";

export const leaveRoomHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const userId = req.user?.id;

        if (!userId || !roomId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await leaveRoom(roomId, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.json({ message: 'Left room successfully' });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({ error: 'Failed to leave room' });
    }
}; 