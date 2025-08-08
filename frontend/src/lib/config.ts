export const config = {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',

    // Socket.IO Configuration
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',

    // App Configuration
    appName: 'Roomie',
    appDescription: 'Real-time collaborative document editor',

    // Feature Flags
    features: {
        whiteboard: true,
        realTimeEditing: true,
        userPresence: true,
        roomRequests: true,
    },
};

export default config; 