import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { InvoiceController } from '../controllers/InvoiceController';

const router = Router();

router.get('/public/:id', InvoiceController.getPublicInvoice);
router.get('/public/:id/pdf', InvoiceController.generatePublicPdf);

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', InvoiceController.getInvoices);
router.post('/', InvoiceController.createInvoice);
router.get('/:id', InvoiceController.getInvoice);
router.get('/:id/pdf', InvoiceController.generatePdf);
router.put('/:id', InvoiceController.updateInvoice);
router.post('/:id/send', InvoiceController.sendInvoice);

export default router;
