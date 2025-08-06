import { Router } from 'express';
import { createDocumentHandler } from '../controllers/documentControllers/createHandler';
import { getDocumentsByRoomHandler } from '../controllers/documentControllers/getByRoomHandler';
import { getDocumentByIdHandler } from '../controllers/documentControllers/getByIdHandler';
import { updateDocumentContentHandler } from '../controllers/documentControllers/updateContentHandler';
import { updateDocumentTitleHandler } from '../controllers/documentControllers/updateTitleHandler';
import { deleteDocumentHandler } from '../controllers/documentControllers/deleteHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Create a new document
router.post('/', authenticateToken, createDocumentHandler);

// Get documents by room
router.get('/room/:roomId', authenticateToken, getDocumentsByRoomHandler);

// Get document by ID
router.get('/:documentId', authenticateToken, getDocumentByIdHandler);

// Update document content
router.patch('/:documentId/content', authenticateToken, updateDocumentContentHandler);

// Update document title
router.patch('/:documentId/title', authenticateToken, updateDocumentTitleHandler);

// Delete document
router.delete('/:documentId', authenticateToken, deleteDocumentHandler);

export default router; 