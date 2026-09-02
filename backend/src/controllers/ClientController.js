"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const PlanService_1 = require("../services/PlanService");
const prisma_1 = require("../../generated/prisma");
const socket_1 = require("../socket");
const ActivityService_1 = require("../services/ActivityService");
const NotificationService_1 = require("../services/NotificationService");
const prisma = new prisma_1.PrismaClient();
class ClientController {
    // Get all active clients for the workspace
    static async getClients(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const clients = await prisma.client.findMany({
                where: {
                    workspaceId,
                    archivedAt: null,
                },
                include: {
                    projects: { select: { id: true } },
                    invoices: { select: { balanceDue: true } }
                },
                orderBy: { updatedAt: 'desc' },
            });
            res.json(clients);
        }
        catch (error) {
            console.error('Error fetching clients:', error);
            res.status(500).json({ error: 'Failed to fetch clients' });
        }
    }
    // Get a single client by ID with relationships
    static async getClient(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const clientId = parseInt(req.params.id, 10);
            if (isNaN(clientId)) {
                res.status(400).json({ error: 'Invalid client ID' });
                return;
            }
            const client = await prisma.client.findUnique({
                where: { id: clientId },
                include: {
                    projects: {
                        orderBy: { updatedAt: 'desc' }
                    },
                    invoices: {
                        orderBy: { createdAt: 'desc' },
                        include: { payments: { orderBy: { createdAt: 'desc' } } }
                    },
                    activities: {
                        orderBy: { createdAt: 'desc' },
                        take: 20
                    },
                    originalDeal: {
                        select: {
                            id: true,
                            title: true,
                            estimatedValue: true
                        }
                    },
                    clientNotes: {
                        orderBy: { createdAt: 'desc' },
                        include: { author: { include: { user: { select: { name: true, email: true } } } } }
                    }
                }
            });
            if (!client || client.workspaceId !== workspaceId || client.archivedAt) {
                res.status(404).json({ error: 'Client not found' });
                return;
            }
            res.json(client);
        }
        catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ error: 'Failed to fetch client' });
        }
    }
    // Create a direct client (not converted from lead)
    static async createClient(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const { name, company, email, phone, billingAddress, customFields } = req.body;
            if (!name || !company) {
                res.status(400).json({ error: 'Name and company are required' });
                return;
            }
            try {
                await PlanService_1.PlanService.enforceLimit(workspaceId, 'clients');
            }
            catch (err) {
                if (err.message.startsWith('PLAN_LIMIT_REACHED')) {
                    res.status(403).json({ error: err.message, code: 'PLAN_LIMIT_REACHED' });
                    return;
                }
                throw err;
            }
            const client = await prisma.client.create({
                data: {
                    name,
                    company,
                    email,
                    phone,
                    billingAddress,
                    customFields,
                    workspaceId,
                },
            });
            res.status(201).json(client);
            socket_1.SocketService.emitToWorkspace(workspaceId, 'client_created', client);
        }
        catch (error) {
            console.error('Error creating client:', error);
            res.status(500).json({ error: 'Failed to create client' });
        }
    }
    // Update a client
    static async updateClient(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const clientId = parseInt(req.params.id, 10);
            const { name, company, email, phone, billingAddress, customFields } = req.body;
            if (isNaN(clientId)) {
                res.status(400).json({ error: 'Invalid client ID' });
                return;
            }
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (company !== undefined)
                updateData.company = company;
            if (email !== undefined)
                updateData.email = email;
            if (phone !== undefined)
                updateData.phone = phone;
            if (billingAddress !== undefined)
                updateData.billingAddress = billingAddress;
            if (customFields !== undefined)
                updateData.customFields = customFields;
            const client = await prisma.client.update({
                where: { id: clientId, workspaceId },
                data: updateData
            });
            res.json(client);
            socket_1.SocketService.emitToWorkspace(workspaceId, 'client_updated', client);
        }
        catch (error) {
            console.error('Error updating client:', error);
            res.status(500).json({ error: 'Failed to update client' });
        }
    }
    // Archive (soft delete) a client
    static async archiveClient(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const clientId = parseInt(req.params.id, 10);
            if (isNaN(clientId)) {
                res.status(400).json({ error: 'Invalid client ID' });
                return;
            }
            await prisma.client.update({
                where: { id: clientId, workspaceId },
                data: { archivedAt: new Date() }
            });
            res.json({ success: true });
            socket_1.SocketService.emitToWorkspace(workspaceId, 'client_deleted', { id: clientId });
        }
        catch (error) {
            console.error('Error archiving client:', error);
            res.status(500).json({ error: 'Failed to archive client' });
        }
    }
    // Bulk Archive clients
    static async bulkArchiveClients(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const { clientIds } = req.body;
            if (!Array.isArray(clientIds) || clientIds.length === 0) {
                res.status(400).json({ error: 'clientIds must be a non-empty array' });
                return;
            }
            await prisma.client.updateMany({
                where: { id: { in: clientIds }, workspaceId },
                data: { archivedAt: new Date() }
            });
            res.json({ success: true });
            clientIds.forEach(id => {
                socket_1.SocketService.emitToWorkspace(workspaceId, 'client_deleted', { id });
            });
        }
        catch (error) {
            console.error('Error bulk archiving clients:', error);
            res.status(500).json({ error: 'Failed to bulk archive clients' });
        }
    }
    // Add a note to a client
    static async addNote(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const clientId = parseInt(req.params.id, 10);
            const { content } = req.body;
            const userId = req.user.userId;
            if (isNaN(clientId) || !content) {
                res.status(400).json({ error: 'Invalid input' });
                return;
            }
            // get member
            const member = await prisma.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId, workspaceId } }
            });
            if (!member) {
                res.status(403).json({ error: 'Not a member of this workspace' });
                return;
            }
            const note = await prisma.clientNote.create({
                data: {
                    content,
                    clientId,
                    workspaceId,
                    authorId: member.id
                },
                include: {
                    author: { include: { user: { select: { name: true, email: true } } } }
                }
            });
            // Parse mentions from content: @[Name](userId)
            const mentionRegex = /@\[.*?\]\((.*?)\)/g;
            const mentionedUserIds = new Set();
            let match;
            while ((match = mentionRegex.exec(content)) !== null) {
                const id = parseInt(match[1], 10);
                if (!isNaN(id) && id !== userId) {
                    mentionedUserIds.add(id);
                }
            }
            // Send notifications
            const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true } });
            const memberUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
            for (const mentionedId of Array.from(mentionedUserIds)) {
                await NotificationService_1.NotificationService.create({
                    userId: mentionedId,
                    workspaceId,
                    type: 'MENTION',
                    title: 'You were mentioned',
                    body: `${memberUser?.name || memberUser?.email} mentioned you in a note on ${client?.name || 'a client'}.`,
                    link: `/dashboard/clients/${clientId}?highlightNote=${note.id}`
                });
            }
            res.status(201).json(note);
        }
        catch (error) {
            console.error('Error adding client note:', error);
            res.status(500).json({ error: 'Failed to add note' });
        }
    }
    // Bulk import clients
    static async importClients(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const userId = req.user?.userId;
            const { clients } = req.body;
            if (!clients || !Array.isArray(clients) || clients.length === 0) {
                res.status(400).json({ error: 'No clients provided' });
                return;
            }
            const formattedClients = clients.map((client) => ({
                workspaceId,
                name: client.name || client.Name || 'Unknown',
                company: client.company || client.Company || 'Unknown',
                email: client.email || client.Email || null,
                phone: client.phone || client.Phone || null,
                billingAddress: client.address || client.billingAddress || client.Address || null,
            }));
            const result = await prisma.client.createMany({
                data: formattedClients,
                skipDuplicates: true,
            });
            // We should emit a socket event or log activity if needed.
            // Assuming ActivityService is available, but wait, it isn't imported in ClientController. 
            // Actually I'll just emit a general success and let the client refresh.
            res.status(200).json({ success: true, count: result.count });
        }
        catch (error) {
            console.error('Error importing clients:', error);
            res.status(500).json({ error: 'Failed to import clients' });
        }
    }
    // Add a manual activity (e.g. Call, Meeting)
    static async addActivity(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const actorId = req.user.userId;
            const clientId = parseInt(req.params.id, 10);
            const { action, title, description, metadata } = req.body;
            if (isNaN(clientId) || !action || !title) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            // Verify client exists and belongs to workspace
            const client = await prisma.client.findUnique({ where: { id: clientId, workspaceId } });
            if (!client) {
                res.status(404).json({ error: 'Client not found' });
                return;
            }
            const activity = await prisma.activityLog.create({
                data: ActivityService_1.ActivityService.generateLog({
                    action,
                    title,
                    description: description || null,
                    actorId,
                    workspaceId,
                    clientId,
                }),
            });
            // Update metadata if provided
            if (metadata) {
                await prisma.activityLog.update({
                    where: { id: activity.id },
                    data: { metadata },
                });
                activity.metadata = metadata;
            }
            // Fetch the updated client to emit
            const updatedClient = await prisma.client.findUnique({
                where: { id: clientId }
            });
            socket_1.SocketService.emitToWorkspace(workspaceId, 'client_updated', updatedClient);
            res.status(201).json(activity);
        }
        catch (error) {
            console.error('Error adding activity:', error);
            res.status(500).json({ error: 'Failed to log activity' });
        }
    }
}
exports.ClientController = ClientController;
//# sourceMappingURL=ClientController.js.map