'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/store';
import roomService from '@/lib/services/roomService';

interface RoomRequest {
    id: string;
    userId: string;
    username: string;
    roomId: string;
    roomName: string;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

interface RoomRequestsProps {
    roomId: string;
    isOwner: boolean;
}

export default function RoomRequests({ roomId, isOwner }: RoomRequestsProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [requests, setRequests] = useState<RoomRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (isOwner) {
                // Fetch requests for this room (owner view)
                const response = await roomService.getRoomRequests(roomId);
                setRequests(response.requests || []);
            } else {
                // Fetch user's own requests
                const response = await roomService.getUserRequests();
                setRequests(response.requests || []);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            setError('Failed to load requests');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [roomId, isOwner]);

    const handleApproveRequest = async (requestId: string) => {
        try {
            await roomService.approveRoomRequest(requestId);
            // Refresh the requests list
            fetchRequests();
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert('Failed to approve request. Please try again.');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await roomService.rejectRoomRequest(requestId);
            // Refresh the requests list
            fetchRequests();
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert('Failed to reject request. Please try again.');
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">Loading requests...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="p-4">
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500 text-sm">
                        {isOwner ? 'No pending requests' : 'No requests sent'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {isOwner ? 'Room Requests' : 'My Requests'}
                </h3>
                <p className="text-sm text-gray-500">
                    {isOwner ? 'Manage access requests for this room' : 'Track your room access requests'}
                </p>
            </div>

            <div className="space-y-3">
                {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium text-gray-900">
                                        {isOwner ? request.username : request.roomName}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {request.status}
                                    </span>
                                </div>

                                {request.message && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        "{request.message}"
                                    </p>
                                )}

                                <p className="text-xs text-gray-500">
                                    Requested {formatDate(request.createdAt)}
                                </p>
                            </div>

                            {isOwner && request.status === 'pending' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleApproveRequest(request.id)}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(request.id)}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 