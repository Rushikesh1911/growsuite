import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { LeadController } from '../controllers/LeadController';

const router = Router();

// Public Web-to-Lead endpoint
router.post('/web', LeadController.createFromWeb);

// Apply auth & workspace authorization to all routes in this module
router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', LeadController.getLeads);
router.post('/import', LeadController.importLeads);
router.get('/:id', LeadController.getLeadById);
router.post('/', LeadController.createLead);
router.patch('/bulk-archive', LeadController.bulkArchive);
router.put('/:id', LeadController.updateLead);
router.patch('/:id', LeadController.updateLead);
router.post('/:id/convert-to-deal', LeadController.convertToDeal);
router.post('/:id/email', LeadController.sendEmail);
router.post('/:id/notes', LeadController.addNote);

export default router;
