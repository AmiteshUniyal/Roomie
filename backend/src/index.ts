import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import documentRoutes from './routes/documents';

import { authenticateToken } from './middleware/auth';
import { setupSocketHandlers } from './services/socket';

export const prisma = new PrismaClient();

const app = express();
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: process.env['SOCKET_CORS_ORIGIN'] || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: process.env['CORS_ORIGIN'] || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        message: 'Roomie Backend is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', authenticateToken, roomRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env['NODE_ENV'] === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env['PORT'] || 3001;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.IO server ready`);
            console.log(`🌍 Environment: ${process.env['NODE_ENV']}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

//shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down');
    await prisma.$disconnect();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down');
    await prisma.$disconnect();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

startServer(); 