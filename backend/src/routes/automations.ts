import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { AutomationController } from '../controllers/AutomationController';

const router = Router();

// Require auth and workspace access for all routes
router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', AutomationController.getAutomations);
router.get('/:id', AutomationController.getAutomation);
router.post('/', AutomationController.createAutomation);
router.put('/:id', AutomationController.updateAutomation);
router.delete('/:id', AutomationController.deleteAutomation);

export default router;
