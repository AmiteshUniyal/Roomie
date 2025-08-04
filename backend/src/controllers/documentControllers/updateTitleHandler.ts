import { updateDocumentTitle } from "../../services/documentService";
import { Request, Response } from "express";

export const updateDocumentTitleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId } = req.params;
        const { title } = req.body;
        const userId = req.user?.id;

        if (!userId || !documentId || !title) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await updateDocumentTitle(documentId, title, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.json({
            message: 'Document title updated successfully',
            document: result.document
        });
    } catch (error) {
        console.error('Update document title error:', error);
        res.status(500).json({ error: 'Failed to update document title' });
    }
};