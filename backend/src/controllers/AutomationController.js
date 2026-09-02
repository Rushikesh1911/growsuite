"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationController = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class AutomationController {
    static async getAutomations(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const automations = await prisma.automation.findMany({
                where: { workspaceId },
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(automations);
        }
        catch (error) {
            console.error('Error fetching automations:', error);
            res.status(500).json({ error: 'Failed to fetch automations' });
        }
    }
    static async getAutomation(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid automation ID' });
            }
            const automation = await prisma.automation.findUnique({
                where: { id, workspaceId }
            });
            if (!automation) {
                return res.status(404).json({ error: 'Automation not found' });
            }
            res.status(200).json(automation);
        }
        catch (error) {
            console.error('Error fetching automation:', error);
            res.status(500).json({ error: 'Failed to fetch automation' });
        }
    }
    static async createAutomation(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const { name, triggerType, nodes, edges } = req.body;
            if (!name || !triggerType) {
                return res.status(400).json({ error: 'Name and triggerType are required' });
            }
            const automation = await prisma.automation.create({
                data: {
                    workspaceId,
                    name,
                    triggerType,
                    nodes: nodes || [],
                    edges: edges || [],
                    isActive: true
                }
            });
            res.status(201).json(automation);
        }
        catch (error) {
            console.error('Error creating automation:', error);
            res.status(500).json({ error: 'Failed to create automation' });
        }
    }
    static async updateAutomation(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const id = parseInt(req.params.id, 10);
            const { name, triggerType, nodes, edges, isActive } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid automation ID' });
            }
            const data = {};
            if (name !== undefined)
                data.name = name;
            if (triggerType !== undefined)
                data.triggerType = triggerType;
            if (nodes !== undefined)
                data.nodes = nodes;
            if (edges !== undefined)
                data.edges = edges;
            if (isActive !== undefined)
                data.isActive = isActive;
            const automation = await prisma.automation.update({
                where: { id, workspaceId },
                data
            });
            res.status(200).json(automation);
        }
        catch (error) {
            console.error('Error updating automation:', error);
            res.status(500).json({ error: 'Failed to update automation' });
        }
    }
    static async deleteAutomation(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid automation ID' });
            }
            await prisma.automation.delete({
                where: { id, workspaceId }
            });
            res.status(200).json({ success: true, message: 'Automation deleted' });
        }
        catch (error) {
            console.error('Error deleting automation:', error);
            res.status(500).json({ error: 'Failed to delete automation' });
        }
    }
}
exports.AutomationController = AutomationController;
//# sourceMappingURL=AutomationController.js.map