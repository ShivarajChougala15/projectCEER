import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.config.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import bomRoutes from './routes/bom.routes.js';
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import materialRoutes from './routes/material.routes.js';
import equipmentRoutes from './routes/equipment.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Project CEER API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
