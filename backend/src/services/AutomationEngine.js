"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationEngine = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class AutomationEngine {
    static async executeWorkflow(workspaceId, triggerType, payload) {
        try {
            const automations = await prisma.automation.findMany({
                where: {
                    workspaceId,
                    triggerType,
                    isActive: true
                }
            });
            for (const automation of automations) {
                // Execute asynchronously so we don't block
                this.runGraph(automation, payload).catch(err => {
                    console.error(`Error executing automation ${automation.id}:`, err);
                });
            }
        }
        catch (err) {
            console.error('Failed to trigger automations:', err);
        }
    }
    static async runGraph(automation, payload) {
        const nodes = automation.nodes || [];
        const edges = automation.edges || [];
        // Find trigger node
        const triggerNode = nodes.find(n => n.type === 'trigger');
        if (!triggerNode)
            return; // invalid graph
        let currentNodes = [triggerNode];
        while (currentNodes.length > 0) {
            const nextNodes = [];
            for (const node of currentNodes) {
                let conditionResult = null;
                // Process Node
                if (node.type === 'condition') {
                    conditionResult = this.evaluateCondition(node.data, payload);
                }
                else if (node.type === 'action') {
                    await this.executeAction(node.data, payload, automation.workspaceId);
                }
                // Find next nodes connected via edges
                const outgoingEdges = edges.filter(e => e.source === node.id);
                for (const edge of outgoingEdges) {
                    if (node.type === 'condition') {
                        // Check handle matches condition result
                        const handleMatch = conditionResult ? 'true' : 'false';
                        if (edge.sourceHandle === handleMatch) {
                            const targetNode = nodes.find(n => n.id === edge.target);
                            if (targetNode)
                                nextNodes.push(targetNode);
                        }
                    }
                    else {
                        // Unconditional progression
                        const targetNode = nodes.find(n => n.id === edge.target);
                        if (targetNode)
                            nextNodes.push(targetNode);
                    }
                }
            }
            currentNodes = nextNodes;
        }
    }
    static evaluateCondition(data, payload) {
        const { field, operator, value } = data;
        if (!field)
            return false;
        // Support nested dot notation e.g. "lead.status"
        const payloadValue = field.split('.').reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, payload);
        if (payloadValue === undefined)
            return false;
        switch (operator) {
            case 'equals': return String(payloadValue) === String(value);
            case 'not_equals': return String(payloadValue) !== String(value);
            case 'contains': return String(payloadValue).toLowerCase().includes(String(value).toLowerCase());
            case 'greater_than': return Number(payloadValue) > Number(value);
            case 'less_than': return Number(payloadValue) < Number(value);
            default: return false;
        }
    }
    static async executeAction(data, payload, workspaceId) {
        const { actionType, config } = data;
        if (actionType === 'CREATE_PROJECT') {
            const projectName = this.interpolate(config.projectName || 'New Project', payload);
            // Look for a client ID. If this triggered from a DEAL, and Deal has convertedToClientId...
            // Or if this triggered from LEAD, maybe no client yet.
            // We'll create a default standalone project if no client ID is found.
            const clientId = payload.client?.id || payload.deal?.convertedToClientId || null;
            await prisma.project.create({
                data: {
                    name: projectName,
                    status: 'ACTIVE',
                    clientId: clientId,
                    workspaceId: workspaceId,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                }
            });
            console.log(`Automation created project: ${projectName}`);
        }
        else if (actionType === 'SEND_EMAIL') {
            const to = this.interpolate(config.to, payload);
            const subject = this.interpolate(config.subject, payload);
            const body = this.interpolate(config.body, payload);
            if (!to) {
                console.warn('Automation SEND_EMAIL failed: No recipient found.');
                return;
            }
            // Normally we'd use AWS SES, SendGrid, or nodemailer here.
            // For GrowSuite, we create an EmailMessage record for history.
            await prisma.emailMessage.create({
                data: {
                    workspaceId,
                    senderId: 1, // System fallback, ideally this comes from payload
                    toEmail: to,
                    subject,
                    body,
                    leadId: payload.lead?.id || null
                }
            });
            console.log(`Automation sent email to: ${to}`);
        }
    }
    // Basic mustache interpolation e.g., "Hello {{lead.contactName}}"
    static interpolate(str, payload) {
        if (!str)
            return '';
        return str.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
            const val = key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : undefined, payload);
            return val !== undefined ? String(val) : '';
        });
    }
}
exports.AutomationEngine = AutomationEngine;
//# sourceMappingURL=AutomationEngine.js.map