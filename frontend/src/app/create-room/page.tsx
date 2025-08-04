'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store';
import ProtectedRoute from '@/components/ProtectedRoute';
import roomService from '@/lib/services/roomService';

export default function CreateRoomPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Room name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call the actual API
            const response = await roomService.createRoom(formData);

            // Redirect to the created room
            router.push(`/room/${response.room.id}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create room');
        } finally {
            setIsLoading(false);
        }
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
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Room</h1>
                            <p className="text-gray-600">
                                Set up a collaborative space for your team
                            </p>
                        </div>

                        {/* Create Room Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Room Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter room name"
                                        maxLength={50}
                                    />
                                </div>

                                {/* Room Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                        placeholder="Describe what this room is for..."
                                        maxLength={200}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.description.length}/200 characters
                                    </p>
                                </div>

                                {/* Privacy Setting */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Room Privacy
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="isPublic"
                                                value="true"
                                                checked={formData.isPublic === true}
                                                onChange={handleInputChange}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">Public Room</div>
                                                <div className="text-sm text-gray-500">
                                                    Anyone with the room code can join
                                                </div>
                                            </div>
                                        </label>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="isPublic"
                                                value="false"
                                                checked={formData.isPublic === false}
                                                onChange={handleInputChange}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">Private Room</div>
                                                <div className="text-sm text-gray-500">
                                                    Only invited users can join
                                                </div>
                                            </div>
                                        </label>
                                    </div>
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
                                    disabled={isLoading || !formData.name.trim()}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Creating room...
                                        </div>
                                    ) : (
                                        'Create Room'
                                    )}
                                </button>
                            </form>

                            {/* Tips */}
                            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for a great room</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Use a descriptive name that reflects the room's purpose</li>
                                    <li>• Add a description to help team members understand the room's goals</li>
                                    <li>• Choose privacy settings based on your collaboration needs</li>
                                    <li>• You can always change room settings later</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
} 