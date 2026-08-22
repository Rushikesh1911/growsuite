import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { ActivityController } from '../controllers/ActivityController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', ActivityController.getFeed);

export default router;
