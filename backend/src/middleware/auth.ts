import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email: string;
            };
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Check both cookie and authorization header for backward compatibility
    const token = req.cookies?.['token'] ||
        (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as {
            id: string;
            username: string;
            email: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
    return;
};

export const generateToken = (payload: { id: string; username: string; email: string }) => {
    const secret = process.env['JWT_SECRET'];
    const expiresIn = '7d';

    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(payload, secret, { expiresIn });
}; 