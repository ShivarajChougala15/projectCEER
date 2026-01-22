import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    getAvailableStudents,
} from '../controllers/user.controllers.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Available students route - accessible to faculty and admin
router.get('/available-students', authorize('faculty', 'admin'), getAvailableStudents);

// Admin-only routes
router.use(authorize('admin'));

router.route('/').get(getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

router.put('/:id/reset-password', resetPassword);

export default router;
