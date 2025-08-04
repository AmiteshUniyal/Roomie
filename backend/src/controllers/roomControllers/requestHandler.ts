import { Request, Response } from 'express';
import {
    createRoomRequest,
    getRoomRequests,
    approveRoomRequest,
    rejectRoomRequest,
    getUserRequests
} from '../../services/roomRequestService';

// Create a room request
export const createRoomRequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const { message } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await createRoomRequest(userId || '', roomId || '', message || '');

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.status(201).json({
            message: 'Room request created successfully',
            request: result.request
        });
    } catch (error) {
        console.error('Create room request error:', error);
        res.status(500).json({ error: 'Failed to create room request' });
    }
};

// Get room requests (for room owner)
export const getRoomRequestsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await getRoomRequests(roomId || '', userId || '');

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.json({
            requests: result.requests
        });
    } catch (error) {
        console.error('Get room requests error:', error);
        res.status(500).json({ error: 'Failed to get room requests' });
    }
};

// Approve room request
export const approveRoomRequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await approveRoomRequest(requestId || '', userId || '');

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.json({
            message: 'Room request approved successfully',
            request: result.request
        });
    } catch (error) {
        console.error('Approve room request error:', error);
        res.status(500).json({ error: 'Failed to approve room request' });
    }
};

// Reject room request
export const rejectRoomRequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await rejectRoomRequest(requestId || '', userId || '');

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.json({
            message: 'Room request rejected successfully',
            request: result.request
        });
    } catch (error) {
        console.error('Reject room request error:', error);
        res.status(500).json({ error: 'Failed to reject room request' });
    }
};

// Get user's requests
export const getUserRequestsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const result = await getUserRequests(userId || '');

        if (!result.success) {
            res.status(result.statusCode || 400).json({ error: result.error });
            return;
        }

        res.json({
            requests: result.requests
        });
    } catch (error) {
        console.error('Get user requests error:', error);
        res.status(500).json({ error: 'Failed to get user requests' });
    }
}; 