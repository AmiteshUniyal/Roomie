'use client';

import { useState } from 'react';
import { Room, Document, UserPresence } from '@/types';
import { documentService } from '@/lib/services/documentService';

interface RoomSidebarProps {
    room: Room;
    documents: Document[];
    activeDocument: Document | null;
    onDocumentChange: (document: Document) => void;
    isConnected: boolean;
    showActiveUsers: boolean;
    roomMembers?: UserPresence[];
}

export default function RoomSidebar({ room, documents, activeDocument, onDocumentChange, isConnected, roomMembers = [] }: RoomSidebarProps) {
    const [activeTab, setActiveTab] = useState<'documents' | 'members'>('documents');
    const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
    const [newDocumentTitle, setNewDocumentTitle] = useState('');
    const [isCreatingDocument, setIsCreatingDocument] = useState(false);

    const handleCreateDocument = async () => {
        if (!newDocumentTitle.trim()) return;

        try {
            setIsCreatingDocument(true);

            // Create document through API
            const response = await documentService.createDocument({
                title: newDocumentTitle,
                content: '',
                roomId: room.id,
            });

            // Add to documents list and set as active
            onDocumentChange(response.document);
            setNewDocumentTitle('');
            setShowNewDocumentModal(false);
        } catch (error) {
            console.error('Failed to create document:', error);
            // You could add a toast notification here
        } finally {
            setIsCreatingDocument(false);
        }
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-4 py-3">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'documents'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📄 Documents
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'members'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        👥 Members
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'documents' ? (
                    <div className="p-4">
                        {/* Documents Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                            <button
                                onClick={() => setShowNewDocumentModal(true)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                ➕
                            </button>
                        </div>

                        {/* Documents List */}
                        <div className="space-y-2">
                            {documents.map((document) => (
                                <div
                                    key={document.id}
                                    onClick={() => onDocumentChange(document)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${activeDocument?.id === document.id
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                {document.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Updated {new Date(document.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 p-1">
                                            ⋯
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {documents.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-4xl mb-2">📄</div>
                                    <p className="text-gray-500 text-sm">No documents yet</p>
                                    <button
                                        onClick={() => setShowNewDocumentModal(true)}
                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        Create your first document
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        {/* Members Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Room Members</h3>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs text-gray-500">
                                    {isConnected ? 'Live' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {/* Members List */}
                        <div className="space-y-3">
                            {roomMembers.length > 0 ? (
                                roomMembers.map((member) => (
                                    <div key={member.userId} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {member.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {member.username}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-xs text-gray-500">Online</span>
                                                {member.isTyping && (
                                                    <span className="text-xs text-blue-500">typing...</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-4xl mb-2">👥</div>
                                    <p className="text-gray-500 text-sm">No members online</p>
                                    <p className="text-xs text-gray-400 mt-1">Members will appear here when they join</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* New Document Modal */}
            {showNewDocumentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Document</h3>
                        <input
                            type="text"
                            value={newDocumentTitle}
                            onChange={(e) => setNewDocumentTitle(e.target.value)}
                            placeholder="Document title..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowNewDocumentModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDocument}
                                disabled={!newDocumentTitle.trim() || isCreatingDocument}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isCreatingDocument ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 