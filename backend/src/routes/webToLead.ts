import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { WebToLeadController } from '../controllers/WebToLeadController';

const router = Router();

// Public routes for embedding and submitting
router.get('/public/:publicId', WebToLeadController.getPublicFormConfig);
router.post('/public/:publicId/submit', WebToLeadController.submitForm);

// Protected routes for managing forms
router.use(requireAuth);
router.get('/', WebToLeadController.getForms);
router.post('/', WebToLeadController.createForm);
router.put('/:id', WebToLeadController.updateForm);
router.delete('/:id', WebToLeadController.deleteForm);

export default router;
