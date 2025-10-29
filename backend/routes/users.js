import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/user.js';
const router = express.Router();

// Get all users (protected)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//  Purpose of this fil
// In Express.js, a router organizes related routes in one place.
// This router handles user-related functionality, currently just fetching all users.
// It connects HTTP requests to controller logic (here, inline in the route).
// It also uses JWT middleware (protect) to make the route protected

export default router;
