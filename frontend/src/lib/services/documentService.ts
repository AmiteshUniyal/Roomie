import api from '@/lib/api';
import { Document } from '@/types';

// Document service interfaces
export interface CreateDocumentData {
    title: string;
    content: string;
    roomId: string;
}

export interface UpdateDocumentData {
    title?: string;
    content?: string;
}

export interface DocumentResponse {
    document: Document;
    message: string;
}

export interface DocumentsResponse {
    documents: Document[];
    message: string;
}

// Document service class
class DocumentService {
    // Create a new document
    async createDocument(documentData: CreateDocumentData): Promise<DocumentResponse> {
        return api.post<DocumentResponse>('/documents', documentData);
    }

    // Get document by ID
    async getDocument(documentId: string): Promise<DocumentResponse> {
        return api.get<DocumentResponse>(`/documents/${documentId}`);
    }

    // Get documents by room
    async getDocumentsByRoom(roomId: string): Promise<DocumentsResponse> {
        return api.get<DocumentsResponse>(`/documents/room/${roomId}`);
    }

    // Update document title
    async updateDocumentTitle(documentId: string, title: string): Promise<DocumentResponse> {
        return api.patch<DocumentResponse>(`/documents/${documentId}/title`, { title });
    }

    // Update document content
    async updateDocumentContent(documentId: string, content: string): Promise<DocumentResponse> {
        return api.patch<DocumentResponse>(`/documents/${documentId}/content`, { content });
    }

    // Delete document
    async deleteDocument(documentId: string): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/documents/${documentId}`);
    }
}

// Export singleton instance
export const documentService = new DocumentService();
export default documentService; 