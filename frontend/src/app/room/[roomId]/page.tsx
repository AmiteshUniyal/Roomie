"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store";
import { useSocket } from "@/hooks/useSocket";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoomHeader from "@/components/room/RoomHeader";
import TextEditor from "@/components/room/TextEditor";
import Whiteboard from "@/components/room/Whiteboard";
import UserPresence from "@/components/room/UserPresence";
import RoomSidebar from "@/components/room/RoomSidebar";
import RequestAccessModal from "@/components/room/RequestAccessModal";
import { Room, Document } from "@/types";
import roomService from "@/lib/services/roomService";
import { documentService } from "@/lib/services/documentService";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const roomId = params.roomId as string;

  const {
    isConnected,
    isConnecting,
    connect,
    joinRoom,
    roomMembers,
    onUserJoined,
    onUserLeft,
  } = useSocket({
    userId: user?.id,
    username: user?.username,
    roomId: roomId,
  });

  const [room, setRoom] = useState<Room | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<"editor" | "whiteboard">("editor");
  const [showActiveUsers, setShowActiveUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"documents" | "members" | "requests">("documents");

  // Check for pending requests if user is owner
  useEffect(() => {
    const checkPendingRequests = async () => {
      if (room && user && room.ownerId === user.id && !room.isPublic) {
        try {
          const response = await roomService.getRoomRequests(room.id);
          const pendingRequests = response.requests?.filter(
            (request: any) => request.status === "pending"
          ) || [];
          setPendingRequestsCount(pendingRequests.length);
        } catch (error) {
          console.error("Failed to fetch pending requests:", error);
        }
      }
    };

    checkPendingRequests();
  }, [room, user]);

  // Handle user joined/left events
  useEffect(() => {
    const handleUserJoined = (userData: {
      userId: string;
      username: string;
    }) => {
      console.log("👤 User joined:", userData);
    };

    const handleUserLeft = (userData: { userId: string; username: string }) => {
      console.log("👋 User left:", userData);
    };

    onUserJoined(handleUserJoined);
    onUserLeft(handleUserLeft);
  }, [onUserJoined, onUserLeft]);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isConnected && !isConnecting) {
      console.log("🔌 Connecting to socket server...");
      connect(user.id, user.username).catch((error) => {
        console.error("❌ Failed to connect to socket:", error);
      });
    }
  }, [isAuthenticated, user, isConnected, isConnecting, connect]);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) {
        router.push("/dashboard");
        return;
      }

      //   ProtectedRoute will handle it
      if (!isAuthenticated) {
        console.log("🔐 Not authenticated, waiting...");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("🏠 Fetching room data for:", roomId);
        // Fetch room data
        const roomResponse = await roomService.getRoom(roomId);
        setRoom(roomResponse.room);
        console.log("✅ Room data loaded:", roomResponse.room);

        // Check if this is a limited access response (status 202)
        if (roomResponse.statusCode === 202) {
          // User has limited access to private room - show request access interface
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // Check if user has access to private room (fallback check)
        const isMember = roomResponse.room.members?.some((member: any) => member.userId === user?.id);
        const isOwner = roomResponse.room.ownerId === user?.id;
        
        if (!roomResponse.room.isPublic && !isMember && !isOwner) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // Fetch documents from API
        try {
          const documentsResponse = await documentService.getDocumentsByRoom(
            roomId
          );
          setDocuments(documentsResponse.documents || []);

          // Set first document as active if available
          if (
            documentsResponse.documents &&
            documentsResponse.documents.length > 0
          ) {
            setActiveDocument(documentsResponse.documents[0]);
          }
        } catch (error) {
          console.error("Failed to fetch documents:", error);
          setDocuments([]);
          setActiveDocument(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Failed to fetch room:", error);
        setError("Room not found or access denied");
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, isAuthenticated, router, user]);

  useEffect(() => {
    if (isConnected && room && user) {
      // Join the room via socket
      console.log("🚪 Joining room via socket:", {
        roomId: room.id,
        userId: user.id,
        username: user.username,
      });
      joinRoom(room.id, user.id, user.username);
    } else {
      console.log("⏳ Waiting to join room:", {
        isConnected,
        room: !!room,
        user: !!user,
      });
    }
  }, [isConnected, room, user, joinRoom]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading room...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!room) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Room Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The room you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Private Room
            </h2>
            <p className="text-gray-600 mb-6">
              This room is private. You need to request access to join.
            </p>
            <div className="space-y-3 space-x-3">
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Access
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <RequestAccessModal
          roomId={roomId}
          roomName={room.name}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setAccessDenied(false);
            window.location.reload();
          }}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Room Header */}
        <RoomHeader
          room={room}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isConnected={isConnected}
          onToggleActiveUsers={() => setShowActiveUsers(!showActiveUsers)}
          user={user}
        />

        {/* Pending Requests Notification */}
        {room.ownerId === user?.id && pendingRequestsCount > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-yellow-600">🔔</div>
                <span className="text-sm text-yellow-800">
                  You have {pendingRequestsCount} pending room request{pendingRequestsCount > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setSidebarTab("requests");
                }}
                className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
              >
                View Requests →
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 flex">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Tab Content */}
            <div className="flex-1 relative">
              {activeTab === "editor" ? (
                <TextEditor
                  document={activeDocument}
                  roomId={roomId}
                  isConnected={isConnected}
                />
              ) : (
                <Whiteboard roomId={roomId} isConnected={isConnected} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <RoomSidebar
            room={room}
            documents={documents}
            activeDocument={activeDocument}
            onDocumentChange={(document) => {
              setActiveDocument(document);
              // Update documents list if needed
              if (document && !documents.find((d) => d.id === document.id)) {
                setDocuments((prev) => [...prev, document]);
              }
            }}
            showActiveUsers={showActiveUsers}
            roomMembers={roomMembers}
            switchToTab={sidebarTab}
          />
        </div>

        {/* User Presence Overlay */}
        <UserPresence roomId={roomId} />
      </div>
    </ProtectedRoute>
  );
}
