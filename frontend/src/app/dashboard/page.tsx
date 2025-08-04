'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { logoutUser } from '@/lib/slices/authSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Room } from '@/types';
import { roomService } from '@/lib/services/roomService';

export default function DashboardPage() {
    const [userRooms, setUserRooms] = useState<Room[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    // Fetch user's rooms
    useEffect(() => {
        const fetchUserRooms = async () => {
            if (!user?.id) return;

            try {
                setIsLoadingRooms(true);
                setError(null);
                const response = await roomService.getUserRooms();
                setUserRooms(response.rooms || []);
            } catch (error) {
                console.error('Failed to fetch user rooms:', error);
                setError('Failed to load your rooms. Please try again.');
                setUserRooms([]);
            } finally {
                setIsLoadingRooms(false);
            }
        };

        fetchUserRooms();
    }, [user?.id]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">R</span>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Roomie
                                </span>
                            </Link>

                            {/* User Menu */}
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.username}! 👋
                        </h1>
                        <p className="text-gray-600">
                            Ready to collaborate? Create a new room or join an existing one.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <Link
                            href="/create-room"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-center"
                        >
                            ✨ Create New Room
                        </Link>
                        <Link
                            href="/join-room"
                            className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-all duration-200 text-center"
                        >
                            🔗 Join Room
                        </Link>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="text-red-600 mr-3">⚠️</div>
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* User's Rooms */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Your Rooms</h2>
                            <span className="text-sm text-gray-500">
                                {userRooms.length} room{userRooms.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {isLoadingRooms ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                                <span className="text-gray-600">Loading your rooms...</span>
                            </div>
                        ) : userRooms.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏠</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms yet</h3>
                                <p className="text-gray-600 mb-6">
                                    Create your first room to start collaborating with your team.
                                </p>
                                <Link
                                    href="/create-room"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                                >
                                    Create Your First Room
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {userRooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">{room.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${room.isPublic
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {room.isPublic ? 'Public' : 'Private'}
                                            </span>
                                        </div>
                                        {room.description && (
                                            <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Updated {formatDate(room.updatedAt)}</span>
                                            <Link
                                                href={`/room/${room.id}`}
                                                className="text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Open →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">{userRooms.length}</div>
                            <div className="text-gray-600">Total Rooms</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {userRooms.filter(room => room.isPublic).length}
                            </div>
                            <div className="text-gray-600">Public Rooms</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                {userRooms.filter(room => !room.isPublic).length}
                            </div>
                            <div className="text-gray-600">Private Rooms</div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
} 