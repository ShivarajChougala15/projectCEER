import express from 'express';
import {
    getInventory,
    getInventoryItem,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
} from '../controllers/inventory.controllers.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getInventory)
    .post(authorize('labincharge', 'admin'), addInventoryItem);

router
    .route('/:id')
    .get(getInventoryItem)
    .put(authorize('labincharge', 'admin'), updateInventoryItem)
    .delete(authorize('admin'), deleteInventoryItem);

router.put('/:id/stock', authorize('labincharge', 'admin'), updateStock);

export default router;
