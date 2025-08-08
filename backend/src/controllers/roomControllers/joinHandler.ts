import { Request, Response } from "express";
import { joinRoomByCode } from "../../services/roomService";

export const joinRoomHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomCode } = req.params;
        const userId = req.user?.id;

        if (!userId || !roomCode) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await joinRoomByCode(roomCode, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.json({
            message: 'Joined room successfully',
            room: result.room
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ error: 'Failed to join room' });
    }
};