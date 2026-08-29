import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { BillingController } from '../controllers/BillingController';
import express from 'express';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';

const router = Router();

// Protected routes (requireAuth + requireWorkspaceAccess)
router.get('/', requireAuth, requireWorkspaceAccess, BillingController.getBillingState);
router.post('/checkout', requireAuth, requireWorkspaceAccess, BillingController.createCheckout);

export default router;
