import { Router } from 'express';
import { RazorpayController } from '../controllers/RazorpayController';

const router = Router();

// Note: These routes are public because the client (who doesn't have an account) needs to pay the invoice
router.post('/create-order/:invoiceId', RazorpayController.createOrder);
router.post('/verify', RazorpayController.verifyPayment);

export default router;
