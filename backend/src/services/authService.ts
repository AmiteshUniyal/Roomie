import bcrypt from 'bcryptjs';
import { prisma } from '../index';

export interface AuthResult {
    success: boolean;
    user?: {
        id: string;
        username: string;
        email: string;
        avatar: string | null;
        createdAt: Date;
    };
    error?: string;
}

// Find user by email or username
export const findUserByEmailOrUsername = async (email: string, username: string) => {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    });
};

// Create new user
export const createUser = async (username: string, email: string, password: string) => {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        },
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            createdAt: true
        }
    });
};

// Authenticate user
export const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            username: true,
            email: true,
            password: true,
            avatar: true,
            createdAt: true
        }
    });

    if (!user) {
        return {
            success: false,
            error: 'Invalid credentials'
        };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return {
            success: false,
            error: 'Invalid credentials'
        };
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
        success: true,
        user: userWithoutPassword
    };
};

// Get user by ID
export const getUserById = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
        }
    });
}; 