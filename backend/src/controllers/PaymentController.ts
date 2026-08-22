import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '../../generated/prisma';
import { NotificationService } from '../services/NotificationService';
import { SocketService } from '../socket';

const prisma = new PrismaClient();

export class PaymentController {
  // Record a payment transactionally
  static async createPayment(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const { invoiceId, amount, method, reference, date, notes } = req.body;

      if (!invoiceId || !amount) {
        res.status(400).json({ error: 'Missing required fields (invoiceId, amount)' });
        return;
      }

      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        res.status(400).json({ error: 'Payment amount must be greater than zero' });
        return;
      }

      // Find the invoice
      const invoice = await prisma.invoice.findFirst({
        where: { id: Number(invoiceId), workspaceId },
        include: { client: true }
      });

      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found in your workspace.' });
        return;
      }

      // Calculate new balances and status
      const newAmountPaid = Number(invoice.amountPaid) + paymentAmount;
      let newBalanceDue = Number(invoice.total) - newAmountPaid;
      
      // Ensure balance doesn't go below 0 (overpayment can be handled as balanceDue = 0)
      if (newBalanceDue < 0) {
        newBalanceDue = 0;
      }

      let newStatus = invoice.status;
      if (newBalanceDue === 0) {
        newStatus = 'PAID';
      } else if (newAmountPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      // Execute transactionally
      const result = await prisma.$transaction(async (tx: any) => {
        // Create payment
        const payment = await tx.payment.create({
          data: {
            amount: paymentAmount,
            method: method || 'OTHER',
            reference: reference || null,
            date: date ? new Date(date) : new Date(),
            invoiceId: invoice.id,
            workspaceId: workspaceId,
          }
        });

        // Update Invoice
        const updatedInvoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            status: newStatus,
          }
        });

        // Log Activity
        await tx.activityLog.create({
          data: {
            action: 'PAYMENT_RECEIVED',
            title: `Payment of ${paymentAmount.toFixed(2)} received for Invoice ${invoice.invoiceNumber}`,
            description: notes || `Method: ${method || 'Other'}`,
            workspaceId: workspaceId,
            actorId: (req.user as any)?.userId || null,
            clientId: invoice.clientId,
            invoiceId: invoice.id,
            paymentId: payment.id,
          }
        });

        // Trigger Notification
        if (newStatus === 'PAID' && invoice.status !== 'PAID') {
          const admins = await tx.workspaceMember.findMany({
            where: { workspaceId, role: { in: ['OWNER', 'ADMIN'] } },
          });
          const formattedAmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.total));
          for (const admin of admins) {
            if (admin.userId === (req.user as any)?.userId) continue;
            await NotificationService.create({
              userId: admin.userId,
              workspaceId,
              type: 'INVOICE_PAID',
              title: 'Invoice paid',
              body: `${invoice.invoiceNumber} was paid — ${formattedAmt}.`,
              link: `/dashboard/invoices/${invoice.id}`
            });
          }
        } else if (newStatus === 'PARTIALLY_PAID') {
          const admins = await tx.workspaceMember.findMany({
            where: { workspaceId, role: { in: ['OWNER', 'ADMIN'] } },
          });
          const formattedAmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paymentAmount);
          for (const admin of admins) {
            if (admin.userId === (req.user as any)?.userId) continue;
            await NotificationService.create({
              userId: admin.userId,
              workspaceId,
              type: 'INVOICE_PARTIALLY_PAID',
              title: 'Partial payment received',
              body: `${formattedAmt} received for ${invoice.invoiceNumber}.`,
              link: `/dashboard/invoices/${invoice.id}`
            });
          }
        }

        return { payment, invoice: updatedInvoice };
      });

      res.status(201).json(result);
      SocketService.emitToWorkspace(workspaceId, 'payment_created', result.payment);
      SocketService.emitToWorkspace(workspaceId, 'invoice_updated', result.invoice);
    } catch (error) {
      console.error('Error recording payment:', error);
      res.status(500).json({ error: 'Failed to record payment' });
    }
  }

  // Get all payments for a workspace
  static async getPayments(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const payments = await prisma.payment.findMany({
        where: { workspaceId },
        include: {
          invoice: {
            include: { client: true }
          }
        },
        orderBy: { date: 'desc' }
      });
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  }
}
