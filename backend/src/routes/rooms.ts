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

const router = Router();

// Create a new room
router.post('/', createRoomHandler);

// Get user's rooms
router.get('/user', getUserRoomsHandler);

// Get user's requests
router.get('/requests', getUserRequestsHandler);

// Get room by ID
router.get('/:roomId', getRoomByIdHandler);

// Join room by code
router.post('/join/:roomCode', joinRoomHandler);

// Leave room
router.post('/:roomId/leave', leaveRoomHandler);

// Room request routes
router.post('/:roomId/request', createRoomRequestHandler);
router.get('/:roomId/requests', getRoomRequestsHandler);
router.post('/requests/:requestId/approve', approveRoomRequestHandler);
router.post('/requests/:requestId/reject', rejectRoomRequestHandler);

// Owner control routes
router.delete('/:roomId/members/:userId', kickUserHandler);
router.delete('/:roomId', deleteRoomHandler);
router.put('/:roomId/members/:userId/role', updateUserRoleHandler);

export default router; 