import { getDocumentById } from "../../services/documentService";
import { Request, Response } from "express";

export const getDocumentByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId } = req.params;
        const userId = req.user?.id;

        if (!userId || !documentId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await getDocumentById(documentId, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.json({ document: result.document });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ error: 'Failed to get document' });
    }
};
