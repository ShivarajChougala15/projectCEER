import express from 'express';
import {
    createBOM,
    getBOMs,
    getBOM,
    guideApproveBOM,
    guideRejectBOM,
    labinchargeApproveBOM,
    labinchargeRejectBOM,
    completeBOM,
} from '../controllers/bom.controllers.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, authorize('student'), createBOM);
router.get('/', protect, getBOMs);
router.get('/:id', protect, getBOM);

router.put('/:id/guide-approve', protect, authorize('faculty'), guideApproveBOM);
router.put('/:id/guide-reject', protect, authorize('faculty'), guideRejectBOM);

router.put('/:id/labincharge-approve', protect, authorize('labincharge', 'admin'), labinchargeApproveBOM);
router.put('/:id/labincharge-reject', protect, authorize('labincharge', 'admin'), labinchargeRejectBOM);

router.put('/:id/complete', protect, authorize('labincharge', 'admin'), completeBOM);

export default router;
