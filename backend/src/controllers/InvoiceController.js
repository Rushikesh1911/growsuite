"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const prisma_1 = require("../../generated/prisma");
const EmailService_1 = require("../services/EmailService");
const ActivityService_1 = require("../services/ActivityService");
const PdfService_1 = require("../services/PdfService");
const socket_1 = require("../socket");
const prisma = new prisma_1.PrismaClient();
class InvoiceController {
    // Public route to view an invoice
    static async getPublicInvoice(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma.invoice.findUnique({
                where: { id: Number(id) },
                include: {
                    client: true,
                    project: true,
                    items: true,
                    workspace: {
                        select: { name: true, currency: true, razorpayKeyId: true }
                    }
                }
            });
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            res.json(invoice);
        }
        catch (error) {
            console.error('Error fetching public invoice:', error);
            res.status(500).json({ error: 'Failed to fetch invoice' });
        }
    }
    // Generate PDF for Public Invoice
    static async generatePublicPdf(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma.invoice.findUnique({
                where: { id: Number(id) },
                include: { client: true, project: true, items: true, workspace: true }
            });
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);
            PdfService_1.PdfService.generateInvoicePdf(invoice, res);
        }
        catch (error) {
            console.error('Error generating public PDF:', error);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    }
    // Generate PDF for Workspace Owner/Admin
    static async generatePdf(req, res) {
        try {
            const { id } = req.params;
            const workspaceId = req.workspaceId;
            const invoice = await prisma.invoice.findUnique({
                where: { id: Number(id), workspaceId },
                include: { client: true, project: true, items: true, workspace: true }
            });
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);
            PdfService_1.PdfService.generateInvoicePdf(invoice, res);
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    }
    // Get all invoices for the workspace
    static async getInvoices(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const invoices = await prisma.invoice.findMany({
                where: { workspaceId },
                include: {
                    client: true,
                    items: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            // Dynamically mark overdue invoices
            const now = new Date();
            const updatedInvoices = await Promise.all(invoices.map(async (inv) => {
                if ((inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID') && inv.dueDate && new Date(inv.dueDate) < now) {
                    const updated = await prisma.invoice.update({
                        where: { id: inv.id },
                        data: { status: 'OVERDUE' },
                        include: {
                            client: true,
                            items: true,
                        },
                    });
                    return updated;
                }
                return inv;
            }));
            res.json(updatedInvoices);
        }
        catch (error) {
            console.error('Error fetching invoices:', error);
            res.status(500).json({ error: 'Failed to fetch invoices' });
        }
    }
    // Get a single invoice by ID
    static async getInvoice(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const invoiceId = parseInt(req.params.id, 10);
            const invoice = await prisma.invoice.findFirst({
                where: { id: invoiceId, workspaceId },
                include: {
                    client: true,
                    project: true,
                    items: true,
                    payments: {
                        orderBy: { date: 'desc' }
                    },
                    activities: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            const now = new Date();
            if ((invoice.status === 'SENT' || invoice.status === 'PARTIALLY_PAID') && invoice.dueDate && new Date(invoice.dueDate) < now) {
                const updated = await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { status: 'OVERDUE' },
                    include: {
                        client: true,
                        project: true,
                        items: true,
                        payments: { orderBy: { date: 'desc' } },
                        activities: { orderBy: { createdAt: 'desc' } }
                    }
                });
                res.json(updated);
                return;
            }
            res.json(invoice);
        }
        catch (error) {
            console.error('Error fetching invoice:', error);
            res.status(500).json({ error: 'Failed to fetch invoice' });
        }
    }
    // Create a new invoice
    static async createInvoice(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const { invoiceNumber, clientId, projectId, items = [], timeEntryIds, status, issueDate, dueDate, tax, discount, notes } = req.body;
            if (!clientId || (!items.length && (!timeEntryIds || !timeEntryIds.length))) {
                res.status(400).json({ error: 'Missing required invoice fields (clientId, items or timeEntryIds)' });
                return;
            }
            // Validate Client exists
            const client = await prisma.client.findFirst({
                where: { id: Number(clientId), workspaceId }
            });
            if (!client) {
                res.status(400).json({ error: `Client ID ${clientId} does not exist in your workspace.` });
                return;
            }
            let finalInvoiceNum = invoiceNumber;
            if (!finalInvoiceNum) {
                // Auto-generate invoice number: INV-YYYY-XXXX
                const year = new Date().getFullYear();
                const latestInvoice = await prisma.invoice.findFirst({
                    where: { workspaceId, invoiceNumber: { startsWith: `INV-${year}-` } },
                    orderBy: { createdAt: 'desc' }
                });
                let nextNumber = 1;
                if (latestInvoice && latestInvoice.invoiceNumber) {
                    const parts = latestInvoice.invoiceNumber.split('-');
                    if (parts.length === 3 && parts[2]) {
                        nextNumber = parseInt(parts[2], 10) + 1;
                    }
                }
                finalInvoiceNum = `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
            }
            let generatedItems = [...items];
            // We no longer auto-generate items from timeEntryIds here.
            // The frontend provides the finalized items array so the user can customize the rates/descriptions.
            // We only use timeEntryIds to link the TimeEntry records below.
            const subtotalVal = items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0)), 0);
            const taxVal = tax ? parseFloat(tax) : 0;
            const discountVal = discount ? parseFloat(discount) : 0;
            const totalVal = subtotalVal + taxVal - discountVal;
            const finalIssueDate = issueDate ? new Date(issueDate) : new Date();
            let finalDueDate = dueDate ? new Date(dueDate) : new Date();
            if (!dueDate) {
                finalDueDate.setDate(finalIssueDate.getDate() + 14);
            }
            const invoice = await prisma.$transaction(async (tx) => {
                const newInvoice = await tx.invoice.create({
                    data: {
                        invoiceNumber: finalInvoiceNum,
                        status: status || 'DRAFT',
                        clientId: Number(clientId),
                        projectId: projectId ? Number(projectId) : null,
                        workspaceId,
                        subtotal: subtotalVal,
                        tax: taxVal,
                        discount: discountVal,
                        total: totalVal,
                        balanceDue: totalVal,
                        amountPaid: 0,
                        issueDate: finalIssueDate,
                        dueDate: finalDueDate,
                        notes: notes || null,
                    },
                });
                // Create items
                for (const item of items) {
                    const qty = parseFloat(item.quantity) || 1;
                    const price = parseFloat(item.unitPrice) || 0;
                    await tx.invoiceItem.create({
                        data: {
                            invoiceId: newInvoice.id,
                            description: item.description,
                            quantity: qty,
                            unitPrice: price,
                            total: qty * price,
                        },
                    });
                }
                // Link Time Entries if any
                if (timeEntryIds && Array.isArray(timeEntryIds) && timeEntryIds.length > 0) {
                    await tx.timeEntry.updateMany({
                        where: { id: { in: timeEntryIds }, workspaceId },
                        data: { invoiceId: newInvoice.id },
                    });
                }
                return await tx.invoice.findUnique({
                    where: { id: newInvoice.id },
                    include: { items: true, client: true },
                });
            });
            res.status(201).json(invoice);
            socket_1.SocketService.emitToWorkspace(workspaceId, 'invoice_created', invoice);
        }
        catch (error) {
            console.error('Error creating invoice:', error);
            res.status(500).json({ error: 'Failed to create invoice' });
        }
    }
    // Update an invoice (status, or details if DRAFT)
    static async updateInvoice(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const invoiceId = parseInt(req.params.id, 10);
            const { status, notes } = req.body;
            const existingInvoice = await prisma.invoice.findFirst({
                where: { id: invoiceId, workspaceId }
            });
            if (!existingInvoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            // Allow updating status or notes
            const updatedInvoice = await prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: status || undefined,
                    notes: notes !== undefined ? notes : undefined
                }
            });
            res.json(updatedInvoice);
            socket_1.SocketService.emitToWorkspace(workspaceId, 'invoice_updated', updatedInvoice);
        }
        catch (error) {
            console.error('Error updating invoice:', error);
            res.status(500).json({ error: 'Failed to update invoice' });
        }
    }
    // Send an invoice to the client via email
    static async sendInvoice(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const invoiceId = parseInt(req.params.id, 10);
            if (isNaN(invoiceId)) {
                res.status(400).json({ error: 'Valid invoiceId is required' });
                return;
            }
            const invoice = await prisma.invoice.findFirst({
                where: { id: invoiceId, workspaceId },
                include: { client: true, workspace: true }
            });
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found' });
                return;
            }
            if (!invoice.client.email) {
                res.status(400).json({ error: 'Client does not have an email address' });
                return;
            }
            // Format currency
            const formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: invoice.currency || 'USD'
            }).format(Number(invoice.total));
            const formattedDueDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            }).format(new Date(invoice.dueDate));
            // Attempt to send email
            const success = await EmailService_1.EmailService.sendInvoiceEmail(invoice.client.email, invoice.invoiceNumber, formattedAmount, formattedDueDate, invoice.client.name, invoice.workspace.name);
            if (success) {
                // Only mark SENT if SMTP acceptance is successful
                const updatedInvoice = await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        status: 'SENT',
                        sentAt: new Date()
                    }
                });
                // Log Activity
                await prisma.activityLog.create({
                    data: ActivityService_1.ActivityService.generateLog({
                        action: 'INVOICE_SENT',
                        title: 'Invoice Sent',
                        description: `Invoice ${invoice.invoiceNumber} sent to ${invoice.client.name}`,
                        actorId: req.user.userId,
                        workspaceId,
                        clientId: invoice.clientId,
                        invoiceId: invoice.id
                    })
                });
                res.json({ success: true, invoice: updatedInvoice });
            }
            else {
                res.status(500).json({ error: 'Failed to send invoice via email' });
            }
        }
        catch (error) {
            console.error('Error sending invoice:', error);
            res.status(500).json({ error: 'Failed to send invoice' });
        }
    }
}
exports.InvoiceController = InvoiceController;
//# sourceMappingURL=InvoiceController.js.map