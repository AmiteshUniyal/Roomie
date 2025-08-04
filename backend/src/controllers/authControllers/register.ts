import { findUserByEmailOrUsername } from "../../services/authService";
import { createUser } from "../../services/authService";
import { generateToken } from "../../middleware/auth";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        // Check if user exists
        const existingUser = await findUserByEmailOrUsername(email, username);
        if (existingUser) {
            res.status(400).json({ error: 'User with this email or username already exists' });
            return;
        }

        // Create user
        const user = await createUser(username, email, password);

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'User registered successfully',
            user,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};