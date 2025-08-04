import { Request, Response } from 'express';

export const logout = async (_: Request, res: Response): Promise<void> => {
    try {
        // Clear the authentication cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: process.env['NODE_ENV'] === 'production' ? 'none' : 'lax',
            path: '/'
        });

        res.json({
            message: 'Logged out successfully',
            success: true
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
}; 