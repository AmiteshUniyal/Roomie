"use client";

import { useState } from "react";
import { Room, Document, UserPresence } from "@/types";
import { documentService } from "@/lib/services/documentService";
import { Loader2, Trash } from "lucide-react";
import RoomRequests from "./RoomRequests";
import { useAppSelector } from "@/lib/store";

interface RoomSidebarProps {
  room: Room;
  documents: Document[];
  activeDocument: Document | null;
  onDocumentChange: (document: Document | null) => void;
  showActiveUsers: boolean;
  roomMembers?: UserPresence[];
}

export default function RoomSidebar({
  room,
  documents,
  activeDocument,
  onDocumentChange,
  roomMembers = [],
}: RoomSidebarProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<
    "documents" | "members" | "requests"
  >("documents");
  const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState<string | null>(
    null
  );

  const isOwner = room.ownerId === user?.id;

  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) return;

    try {
      setIsCreatingDocument(true);

      // Create document through API
      const response = await documentService.createDocument({
        title: newDocumentTitle,
        content: "",
        roomId: room.id,
      });

      // Add to documents list and set as active
      onDocumentChange(response.document);
      setNewDocumentTitle("");
      setShowNewDocumentModal(false);
    } catch (error) {
      console.error("Failed to create document:", error);
      alert("Failed to create document. Please try again.");
    } finally {
      setIsCreatingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeletingDocument(documentId);
    try {
      await documentService.deleteDocument(documentId);

      // Remove from documents list
      const updatedDocuments = documents.filter((doc) => doc.id !== documentId);

      // If the deleted document was active, set the first remaining document as active
      if (activeDocument?.id === documentId) {
        const newActiveDocument =
          updatedDocuments.length > 0 ? updatedDocuments[0] : null;
        onDocumentChange(newActiveDocument);
      }

      // You might want to update the parent component's documents state here
      // For now, we'll rely on the parent to refresh the documents list
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setIsDeletingDocument(null);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "documents"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📄 Documents
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "members"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            👥 Members
          </button>
          {!room.isPublic && (
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "requests"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📝 Requests
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "documents" ? (
          <div className="p-4">
            {/* Documents Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <button
                onClick={() => setShowNewDocumentModal(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Create new document"
              >
                ➕
              </button>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    activeDocument?.id === document.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1"
                      onClick={() => onDocumentChange(document)}
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {document.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated{" "}
                        {new Date(document.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(document.id);
                      }}
                      disabled={isDeletingDocument === document.id}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete document"
                    >
                      {isDeletingDocument === document.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Documents Message */}
            {documents.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-500 text-sm">No documents yet</p>
                <p className="text-gray-400 text-xs">
                  Create your first document to get started
                </p>
              </div>
            )}
          </div>
        ) : activeTab === "members" ? (
          <div className="p-4">
            {/* Members Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Members</h3>
              <span className="text-sm text-gray-500">
                {roomMembers.length} active
              </span>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {roomMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {member.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.isTyping ? "typing..." : "online"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Members Message */}
            {roomMembers.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-500 text-sm">No members online</p>
              </div>
            )}
          </div>
        ) : (
          <RoomRequests roomId={room.id} isOwner={isOwner} />
        )}
      </div>

      {/* Create Document Modal */}
      {showNewDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Document
            </h3>
            <input
              type="text"
              value={newDocumentTitle}
              onChange={(e) => setNewDocumentTitle(e.target.value)}
              placeholder="Enter document title"
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleCreateDocument}
                disabled={!newDocumentTitle.trim() || isCreatingDocument}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreatingDocument ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowNewDocumentModal(false);
                  setNewDocumentTitle("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
