import { Router } from 'express';
import { createDocumentHandler } from '../controllers/documentControllers/createHandler';
import { getDocumentsByRoomHandler } from '../controllers/documentControllers/getByRoomHandler';
import { getDocumentByIdHandler } from '../controllers/documentControllers/getByIdHandler';
import { updateDocumentContentHandler } from '../controllers/documentControllers/updateContentHandler';
import { updateDocumentTitleHandler } from '../controllers/documentControllers/updateTitleHandler';
import { deleteDocumentHandler } from '../controllers/documentControllers/deleteHandler';

const router = Router();

// Create a new document
router.post('/', createDocumentHandler);

// Get documents by room
router.get('/room/:roomId', getDocumentsByRoomHandler);

// Get document by ID
router.get('/:documentId', getDocumentByIdHandler);

// Update document content
router.patch('/:documentId/content', updateDocumentContentHandler);

// Update document title
router.patch('/:documentId/title', updateDocumentTitleHandler);

// Delete document
router.delete('/:documentId', deleteDocumentHandler);

export default router; 