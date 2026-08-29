import { Router } from 'express';
import { BillingController } from '../controllers/BillingController';
import express from 'express';

const router = Router();

// Handle webhook (must receive raw buffer)
router.post('/', express.raw({ type: 'application/json' }), BillingController.handleWebhook);

export default router;
