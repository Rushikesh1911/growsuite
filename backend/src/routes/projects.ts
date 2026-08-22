import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { ProjectController } from '../controllers/ProjectController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/', ProjectController.createProject);
router.get('/:id/tasks', ProjectController.getProjectTasks);
router.post('/:id/tasks', ProjectController.createTask);
router.put('/:id', ProjectController.updateProject);
router.patch('/:id/archive', ProjectController.archiveProject);
router.patch('/:id/unarchive', ProjectController.unarchiveProject);
router.delete('/:id', ProjectController.deleteProject);

export default router;
