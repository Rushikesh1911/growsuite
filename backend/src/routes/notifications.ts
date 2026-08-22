import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

// All notification routes require auth and a valid workspace context
router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', NotificationController.getNotifications);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
