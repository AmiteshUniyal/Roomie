import { Router } from 'express';
import { register } from '../controllers/authControllers/register';
import { login } from '../controllers/authControllers/login';
import { logout } from '../controllers/authControllers/logout';
import { getProfile } from '../controllers/authControllers/getProfile';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', logout);

// Get current user profile
router.get('/me', authenticateToken, getProfile);

export default router; 