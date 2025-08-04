import { updateDocumentContent } from "../../services/documentService";
import { Request, Response } from "express";

export const updateDocumentContentHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;

        if (!userId || !documentId || !content) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }   
        
        const result = await updateDocumentContent(documentId, content, userId);
        if (!result.success) {
            res.status(result.statusCode!).json({ error: result.error });
            return;
        }

        res.json({
            message: 'Document updated successfully',
            document: result.document
        });
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
};
