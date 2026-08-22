import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { CalendarController } from '../controllers/CalendarController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', CalendarController.getCalendarEvents);

export default router;
