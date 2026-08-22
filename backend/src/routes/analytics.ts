import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/overview', AnalyticsController.getOverview);

export default router;
