import express from 'express';
import {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    bulkImportEquipment,
    updateEquipmentStatus,
} from '../controllers/equipment.controllers.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
    .get(protect, getEquipment)
    .post(protect, authorize('admin'), upload.single('image'), createEquipment);

router.route('/bulk-import')
    .post(protect, authorize('admin'), bulkImportEquipment);

router.route('/:id')
    .get(protect, getEquipmentById)
    .put(protect, authorize('admin'), upload.single('image'), updateEquipment)
    .delete(protect, authorize('admin'), deleteEquipment);

router.route('/:id/status')
    .put(protect, authorize('admin', 'labincharge'), updateEquipmentStatus);

export default router;
