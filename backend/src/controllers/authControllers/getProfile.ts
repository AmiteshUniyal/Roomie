import { getUserById } from "../../services/authService";
import { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const user = await getUserById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
}; 