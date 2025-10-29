import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './models/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ Failed to connect to DB:', err));

//   Purpose of this file
// This file starts your Express server.
// It sets up middleware, routes, and connects to the database.
// It’s the central place where your backend app “comes alive.”