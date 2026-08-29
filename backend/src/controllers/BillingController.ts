import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PlanService } from '../services/PlanService';
import { PrismaClient } from '../../generated/prisma';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Razorpay constants (would normally be in an environment variable)
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'your-webhook-secret';

export class BillingController {
  
  static async getBillingState(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const usage = await PlanService.getUsage(workspaceId);
      res.json(usage);
    } catch (error) {
      console.error('Error fetching billing state:', error);
      res.status(500).json({ error: 'Failed to fetch billing state' });
    }
  }

  static async createCheckout(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const { plan, cycle } = req.body;
      
      if (plan !== 'PRO') {
        res.status(400).json({ error: 'Only PRO plan upgrades are currently supported' });
        return;
      }

      // Implementation placeholder for Razorpay order generation.
      // In a real integration, we'd use razorpay-node library to create an order here.
      // E.g., await razorpay.orders.create({ amount: 99900, currency: "INR", receipt: "receipt#1" })
      
      const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      
      res.json({
        provider: 'RAZORPAY',
        orderId: mockOrderId,
        amount: cycle === 'YEARLY' ? 999900 : 99900,
        currency: 'INR'
      });
      
    } catch (error) {
      console.error('Error creating checkout:', error);
      res.status(500).json({ error: 'Failed to initiate checkout' });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      // In Express, when using express.raw, the body is a Buffer
      const payload = req.body.toString('utf8');
      const signature = req.headers['x-razorpay-signature'] as string;

      if (!signature) {
        res.status(400).json({ error: 'Missing signature' });
        return;
      }

      // Verify the Razorpay signature
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      if (expectedSignature !== signature) {
        res.status(400).json({ error: 'Invalid signature' });
        return;
      }

      const event = JSON.parse(payload);
      
      // Handle subscription events
      if (event.event === 'subscription.charged') {
        const sub = event.payload.subscription.entity;
        
        // Ensure idempotency
        await prisma.subscription.upsert({
          where: { providerSubscriptionId: sub.id },
          update: {
            status: 'ACTIVE',
            currentPeriodStart: new Date(sub.current_start * 1000),
            currentPeriodEnd: new Date(sub.current_end * 1000),
          },
          create: {
            // Note: In reality, we'd map this back to a workspace via notes or a pending checkout record
            workspaceId: parseInt(sub.notes.workspaceId, 10), 
            plan: 'PRO',
            status: 'ACTIVE',
            provider: 'RAZORPAY',
            providerSubscriptionId: sub.id,
            providerCustomerId: sub.customer_id,
            billingCycle: sub.period === 'yearly' ? 'YEARLY' : 'MONTHLY',
            currentPeriodStart: new Date(sub.current_start * 1000),
            currentPeriodEnd: new Date(sub.current_end * 1000),
          }
        });
      } else if (event.event === 'subscription.cancelled') {
        const sub = event.payload.subscription.entity;
        await prisma.subscription.update({
          where: { providerSubscriptionId: sub.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(sub.canceled_at * 1000)
          }
        });
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}
