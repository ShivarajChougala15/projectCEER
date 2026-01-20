import express from 'express';
import {
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
} from '../controllers/team.controllers.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getTeams).post(authorize('admin', 'faculty'), createTeam);

router
    .route('/:id')
    .get(getTeam)
    .put(authorize('admin', 'faculty'), updateTeam)
    .delete(authorize('admin'), deleteTeam);

export default router;
