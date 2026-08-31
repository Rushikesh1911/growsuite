import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { ClientController } from '../controllers/ClientController';

const router = Router();

// Apply auth & workspace authorization to all routes in this module
router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', ClientController.getClients);
router.post('/import', ClientController.importClients);
router.get('/:id', ClientController.getClient);
router.post('/', ClientController.createClient);
router.put('/:id', ClientController.updateClient);
router.patch('/:id/archive', ClientController.archiveClient);
router.patch('/bulk-archive', ClientController.bulkArchiveClients);
router.post('/:id/notes', ClientController.addNote);
router.post('/:id/activities', ClientController.addActivity);

export default router;
