import { deleteDocument } from "../../services/documentService";
import { Request, Response } from "express";

export const deleteDocumentHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId } = req.params;
        const userId = req.user?.id;

        if (!userId || !documentId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await deleteDocument(documentId, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
}; 