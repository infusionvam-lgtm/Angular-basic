import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', protect, getMe);

export default router;



// Purpose of this file
// In Express.js, a router groups related endpoints (routes) together.
// This file specifically handles authentication routes: register, login, and getting the current user.
// It connects HTTP requests to controller functions that handle the logic.