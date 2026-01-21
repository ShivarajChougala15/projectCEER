import express from 'express';
import {
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    bulkImportMaterials,
} from '../controllers/material.controllers.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
    .get(protect, getMaterials)
    .post(protect, authorize('admin'), upload.single('image'), createMaterial);

router.route('/bulk-import')
    .post(protect, authorize('admin'), bulkImportMaterials);

router.route('/:id')
    .get(protect, getMaterial)
    .put(protect, authorize('admin'), upload.single('image'), updateMaterial)
    .delete(protect, authorize('admin'), deleteMaterial);

export default router;
