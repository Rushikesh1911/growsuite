import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { DealController } from '../controllers/DealController';

const router = Router();

// Apply auth & workspace authorization to all routes in this module
router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', DealController.getDeals);
router.post('/', DealController.createDeal);
router.put('/:id', DealController.updateDeal);
router.post('/:id/convert', DealController.convertDeal);
router.post('/:id/notes', DealController.addNote);

export default router;
