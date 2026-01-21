import express from 'express';
import {
    getAdminStats,
    getStaffDirectory,
    bulkRegisterUsers,
    getConsumptionAnalytics,
    getEnvironmentalImpact,
} from '../controllers/admin.controllers.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/staff-directory', getStaffDirectory);
router.post('/bulk-register', bulkRegisterUsers);
router.get('/analytics/consumption', getConsumptionAnalytics);
router.get('/analytics/environmental', getEnvironmentalImpact);

export default router;
