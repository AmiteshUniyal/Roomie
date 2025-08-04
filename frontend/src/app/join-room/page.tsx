'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store';
import ProtectedRoute from '@/components/ProtectedRoute';
import roomService from '@/lib/services/roomService';

export default function JoinRoomPage() {
    const [roomCode, setRoomCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setRoomCode(value);

        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomCode.trim()) {
            setError('Room code is required');
            return;
        }

        if (roomCode.length < 6) {
            setError('Room code must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call the actual API
            const response = await roomService.joinRoom({ roomCode });

            // Redirect to the joined room
            router.push(`/room/${response.room.id}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to join room');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').toUpperCase();
        setRoomCode(pastedText);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/dashboard" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">R</span>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Roomie
                                </span>
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join a Room</h1>
                            <p className="text-gray-600">
                                Enter the room code to join an existing collaboration space
                            </p>
                        </div>

                        {/* Join Room Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Room Code */}
                                <div>
                                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Code *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="roomCode"
                                            name="roomCode"
                                            value={roomCode}
                                            onChange={handleInputChange}
                                            onPaste={handlePaste}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-lg font-mono tracking-wider"
                                            placeholder="Enter room code"
                                            maxLength={10}
                                            autoComplete="off"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            🔗
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Room codes are usually 6-8 characters long
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !roomCode.trim()}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Joining room...
                                        </div>
                                    ) : (
                                        'Join Room'
                                    )}
                                </button>
                            </form>

                            {/* Help Section */}
                            <div className="mt-8 space-y-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-2">💡 How to get a room code</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Ask the room owner to share the room code with you</li>
                                        <li>• Room codes are usually shared via chat, email, or messaging</li>
                                        <li>• Make sure you have permission to join the room</li>
                                        <li>• Private rooms require approval from the room owner</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Troubleshooting</h3>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                        <li>• Double-check the room code spelling</li>
                                        <li>• Room codes are case-insensitive</li>
                                        <li>• Make sure the room still exists and is active</li>
                                        <li>• Contact the room owner if you're having trouble joining</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Alternative Actions */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600 mb-4">
                                Don't have a room code?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/create-room"
                                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                                >
                                    Create Your Own Room
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-all duration-200"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
} 