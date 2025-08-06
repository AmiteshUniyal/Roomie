import { Router } from 'express';
import { createRoomHandler } from '../controllers/roomControllers/createHandler';
import { getUserRoomsHandler } from '../controllers/roomControllers/getUserRoomsHandler';
import { getRoomByIdHandler } from '../controllers/roomControllers/getByIdHandler';
import { joinRoomHandler } from '../controllers/roomControllers/joinHandler';
import { leaveRoomHandler } from '../controllers/roomControllers/leaveHandler';
import {
    createRoomRequestHandler,
    getRoomRequestsHandler,
    approveRoomRequestHandler,
    rejectRoomRequestHandler,
    getUserRequestsHandler
} from '../controllers/roomControllers/requestHandler';
import {
    kickUserHandler,
    deleteRoomHandler,
    updateUserRoleHandler
} from '../controllers/roomControllers/ownerHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Create a new room
router.post('/', authenticateToken, createRoomHandler);

// Get user's rooms
router.get('/user', authenticateToken, getUserRoomsHandler);

// Get user's requests
router.get('/requests', authenticateToken, getUserRequestsHandler);

// Get room by ID
router.get('/:roomId', authenticateToken, getRoomByIdHandler);

// Join room by code
router.post('/join/:roomCode', authenticateToken, joinRoomHandler);

// Leave room
router.post('/:roomId/leave', authenticateToken, leaveRoomHandler);

// Room request routes
router.post('/:roomId/request', authenticateToken, createRoomRequestHandler);
router.get('/:roomId/requests', authenticateToken, getRoomRequestsHandler);
router.post('/requests/:requestId/approve', authenticateToken, approveRoomRequestHandler);
router.post('/requests/:requestId/reject', authenticateToken, rejectRoomRequestHandler);

// Owner control routes
router.delete('/:roomId/members/:userId', authenticateToken, kickUserHandler);
router.delete('/:roomId', authenticateToken, deleteRoomHandler);
router.put('/:roomId/members/:userId/role', authenticateToken, updateUserRoleHandler);

export default router; 