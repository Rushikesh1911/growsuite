import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { CustomFieldController } from '../controllers/CustomFieldController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', CustomFieldController.getFields);
router.post('/', CustomFieldController.createField);
router.put('/:id', CustomFieldController.updateField);
router.delete('/:id', CustomFieldController.deleteField);

export default router;
