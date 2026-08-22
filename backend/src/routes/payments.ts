import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceAccess);

router.get('/', PaymentController.getPayments);
router.post('/', PaymentController.createPayment);

export default router;
