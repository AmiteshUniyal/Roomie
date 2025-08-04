import { createDocument } from "../../services/documentService";
import { Request, Response } from "express";

export const createDocumentHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, roomId } = req.body;
        const userId = req.user?.id;

        if (!userId || !title || !roomId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await createDocument(userId, title, roomId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.status(201).json({
            message: 'Document created successfully',
            document: result.document
        });
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
};