import { generateToken } from "../../middleware/auth";
import { authenticateUser } from "../../services/authService";
import { Request, Response } from "express";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Authenticate user
        const result = await authenticateUser(email, password);
        if (!result.success) {
            res.status(401).json({ error: result.error });
            return;
        }

        // Generate JWT token
        const token = generateToken({
            id: result.user?.id!,
            username: result.user?.username!,
            email: result.user?.email!
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login successful',
            user: result.user,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};
