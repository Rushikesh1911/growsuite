import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { TaskController } from '../controllers/TaskController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', TaskController.getAllTasks);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;
