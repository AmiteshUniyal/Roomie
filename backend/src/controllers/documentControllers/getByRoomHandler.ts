import { getDocumentsByRoom } from "../../services/documentService";
import { Request, Response } from "express";

export const getDocumentsByRoomHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const userId = req.user?.id;

        if (!userId || !roomId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await getDocumentsByRoom(roomId, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.json({ documents: result.documents });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Failed to get documents' });
    }
};