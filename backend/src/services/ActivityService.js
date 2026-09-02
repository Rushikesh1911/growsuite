"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class ActivityService {
    /**
     * Generates the Prisma create object for an activity log.
     * Can be used inside a Prisma Transaction ($transaction) or standard query.
     */
    static generateLog(params) {
        return {
            action: params.action,
            title: params.title,
            description: params.description || null,
            metadata: params.metadata ? params.metadata : prisma_1.Prisma.JsonNull,
            workspace: { connect: { id: params.workspaceId } },
            actor: { connect: { id: params.actorId } },
            ...(params.leadId && { lead: { connect: { id: params.leadId } } }),
            ...(params.dealId && { deal: { connect: { id: params.dealId } } }),
            ...(params.clientId && { client: { connect: { id: params.clientId } } }),
            ...(params.projectId && { project: { connect: { id: params.projectId } } }),
            ...(params.taskId && { task: { connect: { id: params.taskId } } }),
            ...(params.invoiceId && { invoice: { connect: { id: params.invoiceId } } }),
            ...(params.paymentId && { payment: { connect: { id: params.paymentId } } }),
        };
    }
    /**
     * Directly creates an activity log in the database.
     */
    static async logActivity(params) {
        return prisma.activityLog.create({
            data: this.generateLog(params),
        });
    }
}
exports.ActivityService = ActivityService;
//# sourceMappingURL=ActivityService.js.map