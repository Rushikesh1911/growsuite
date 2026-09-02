"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayController = void 0;
const prisma_1 = require("../../generated/prisma");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new prisma_1.PrismaClient();
class RazorpayController {
    /**
     * Initialize a Razorpay Order for a specific invoice
     */
    static async createOrder(req, res) {
        const { invoiceId } = req.params;
        try {
            // 1. Fetch the invoice and the workspace's razorpay keys
            const invoice = await prisma.invoice.findUnique({
                where: { id: parseInt(invoiceId) },
                include: { workspace: true, client: true }
            });
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            if (invoice.status === 'PAID') {
                res.status(400).json({ error: 'Invoice is already paid' });
                return;
            }
            const { razorpayKeyId, razorpayKeySecret } = invoice.workspace;
            if (!razorpayKeyId || !razorpayKeySecret) {
                res.status(400).json({ error: 'This workspace has not configured Razorpay payments yet.' });
                return;
            }
            // 2. Initialize Razorpay instance
            const razorpay = new razorpay_1.default({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret
            });
            // 3. Create the order
            // Razorpay expects amount in the smallest currency sub-unit (e.g. paise for INR, cents for USD)
            const amountInPaise = Math.round(Number(invoice.total) * 100);
            const options = {
                amount: amountInPaise,
                currency: invoice.currency,
                receipt: invoice.invoiceNumber,
                notes: {
                    invoiceId: invoice.id.toString(),
                    clientId: invoice.clientId.toString()
                }
            };
            const order = await razorpay.orders.create(options);
            // 4. Update the invoice with the order ID
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: { razorpayOrderId: order.id }
            });
            res.status(200).json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: razorpayKeyId,
                client: invoice.client,
                workspaceName: invoice.workspace.name
            });
        }
        catch (error) {
            console.error('Razorpay Create Order Error:', error);
            res.status(500).json({ error: 'Failed to create payment order' });
        }
    }
    /**
     * Verify the payment signature and mark invoice as PAID
     */
    static async verifyPayment(req, res) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoiceId) {
            res.status(400).json({ error: 'Missing required payment verification parameters' });
            return;
        }
        try {
            const invoice = await prisma.invoice.findUnique({
                where: { id: parseInt(invoiceId) },
                include: { workspace: true }
            });
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            const { razorpayKeySecret } = invoice.workspace;
            if (!razorpayKeySecret) {
                res.status(400).json({ error: 'Workspace missing Razorpay configuration' });
                return;
            }
            // 1. Verify the signature
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', razorpayKeySecret)
                .update(body.toString())
                .digest('hex');
            if (expectedSignature !== razorpay_signature) {
                res.status(400).json({ error: 'Invalid payment signature' });
                return;
            }
            // 2. Transaction successful! Update invoice to PAID and record payment
            await prisma.$transaction(async (tx) => {
                // Mark Invoice PAID
                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        status: 'PAID',
                        amountPaid: invoice.total,
                        balanceDue: 0,
                        razorpayPaymentId: razorpay_payment_id
                    }
                });
                // Record a Payment
                await tx.payment.create({
                    data: {
                        amount: invoice.total,
                        method: 'Razorpay',
                        reference: razorpay_payment_id,
                        invoiceId: invoice.id,
                        workspaceId: invoice.workspaceId
                    }
                });
                // Log Activity
                await tx.activityLog.create({
                    data: {
                        action: 'PAYMENT_RECEIVED',
                        title: `Payment received for ${invoice.invoiceNumber}`,
                        description: `A payment of ${invoice.currency} ${invoice.total} was successfully collected via Razorpay.`,
                        workspaceId: invoice.workspaceId,
                        invoiceId: invoice.id
                    }
                });
            });
            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        }
        catch (error) {
            console.error('Razorpay Verification Error:', error);
            res.status(500).json({ error: 'Failed to verify payment' });
        }
    }
}
exports.RazorpayController = RazorpayController;
//# sourceMappingURL=RazorpayController.js.map