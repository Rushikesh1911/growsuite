import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { SearchController } from '../controllers/SearchController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', SearchController.globalSearch);

export default router;
