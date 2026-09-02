"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebToLeadController = void 0;
const prisma_1 = require("../../generated/prisma");
const ioredis_1 = __importDefault(require("ioredis"));
const prisma = new prisma_1.PrismaClient();
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        if (times > 3)
            return null;
        return Math.min(times * 50, 2000);
    }
});
redis.on('error', (err) => console.warn('Redis Warning (WebToLead):', err.message));
class WebToLeadController {
    static async getForms(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const forms = await prisma.webToLeadForm.findMany({
                where: { workspaceId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(forms);
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to fetch forms' });
        }
    }
    static async createForm(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const { name, fields, defaultStatus, defaultAssigneeId, submitText, successMessage, themeColor, backgroundColor } = req.body;
            if (!name || !fields) {
                res.status(400).json({ error: 'Name and fields are required' });
                return;
            }
            // Verify assignee belongs to workspace
            if (defaultAssigneeId) {
                const member = await prisma.workspaceMember.findFirst({
                    where: { workspaceId, userId: defaultAssigneeId }
                });
                if (!member) {
                    res.status(403).json({ error: 'Assignee does not belong to this workspace' });
                    return;
                }
            }
            const form = await prisma.webToLeadForm.create({
                data: {
                    workspaceId,
                    name,
                    fields,
                    defaultStatus: defaultStatus || 'New',
                    defaultAssigneeId,
                    submitText: submitText || 'Submit',
                    successMessage: successMessage || 'Thank you!',
                    themeColor: themeColor || '#0A0A0A',
                    backgroundColor: backgroundColor || '#FFFFFF'
                }
            });
            res.status(201).json(form);
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to create form' });
        }
    }
    static async updateForm(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const id = parseInt(req.params.id, 10);
            const { name, fields, defaultStatus, defaultAssigneeId, submitText, successMessage, themeColor, backgroundColor } = req.body;
            const form = await prisma.webToLeadForm.findFirst({
                where: { id, workspaceId }
            });
            if (!form) {
                res.status(404).json({ error: 'Form not found' });
                return;
            }
            // Verify assignee belongs to workspace
            if (defaultAssigneeId) {
                const member = await prisma.workspaceMember.findFirst({
                    where: { workspaceId, userId: defaultAssigneeId }
                });
                if (!member) {
                    res.status(403).json({ error: 'Assignee does not belong to this workspace' });
                    return;
                }
            }
            const updated = await prisma.webToLeadForm.update({
                where: { id },
                data: {
                    name, fields, defaultStatus, defaultAssigneeId, submitText, successMessage, themeColor, backgroundColor
                }
            });
            res.json(updated);
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to update form' });
        }
    }
    static async deleteForm(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const id = parseInt(req.params.id, 10);
            const form = await prisma.webToLeadForm.findFirst({
                where: { id, workspaceId }
            });
            if (!form) {
                res.status(404).json({ error: 'Form not found' });
                return;
            }
            await prisma.webToLeadForm.delete({ where: { id } });
            res.json({ success: true });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to delete form' });
        }
    }
    // PUBLIC ENDPOINTS
    static async getPublicFormConfig(req, res) {
        try {
            const publicId = req.params.publicId;
            const form = await prisma.webToLeadForm.findUnique({
                where: { publicId }
            });
            if (!form) {
                res.status(404).json({ error: 'Form not found' });
                return;
            }
            // Only return necessary public info
            res.json({
                publicId: form.publicId,
                name: form.name,
                fields: form.fields,
                submitText: form.submitText,
                themeColor: form.themeColor,
                backgroundColor: form.backgroundColor,
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to fetch form config' });
        }
    }
    static async submitForm(req, res) {
        try {
            const publicId = req.params.publicId;
            const { data, honeypot } = req.body;
            // 1. Honeypot check
            if (honeypot) {
                // Bot filled out honeypot field
                res.status(200).json({ success: true, message: 'Submitted successfully' });
                return;
            }
            // 2. Rate Limiting via Redis (10 per minute per IP per form)
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const rateLimitKey = `ratelimit:webtolead:${publicId}:${ip}`;
            try {
                const currentCount = await redis.incr(rateLimitKey);
                if (currentCount === 1) {
                    await redis.expire(rateLimitKey, 60); // 1 minute window
                }
                if (currentCount > 10) {
                    res.status(429).json({ error: 'Too many requests. Please try again later.' });
                    return;
                }
            }
            catch (redisErr) {
                console.warn('Redis rate limiting failed, proceeding anyway:', redisErr);
            }
            // 3. Load Form & Workspace
            const form = await prisma.webToLeadForm.findUnique({
                where: { publicId }
            });
            if (!form) {
                res.status(404).json({ error: 'Form not found' });
                return;
            }
            // 4. Validate payload against schema
            const formFields = form.fields;
            const standardFields = {};
            const customFields = {};
            for (const field of formFields) {
                const val = data[field.key];
                if (field.required && (!val || val === '')) {
                    res.status(400).json({ error: `Field ${field.label} is required.` });
                    return;
                }
                if (val !== undefined && val !== null && val !== '') {
                    if (['contactName', 'email', 'phone', 'company'].includes(field.key)) {
                        standardFields[field.key] = val;
                    }
                    else {
                        customFields[field.key] = val;
                    }
                }
            }
            if (!standardFields.contactName) {
                res.status(400).json({ error: 'Contact Name is required.' });
                return;
            }
            // 5. Create Lead
            const lead = await prisma.lead.create({
                data: {
                    workspaceId: form.workspaceId,
                    contactName: standardFields.contactName,
                    email: standardFields.email,
                    phone: standardFields.phone,
                    company: standardFields.company,
                    source: `web_form:${form.name}`,
                    status: form.defaultStatus,
                    assigneeId: form.defaultAssigneeId,
                    customFields: customFields
                }
            });
            res.status(201).json({ success: true, message: form.successMessage });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to submit form' });
        }
    }
}
exports.WebToLeadController = WebToLeadController;
//# sourceMappingURL=WebToLeadController.js.map