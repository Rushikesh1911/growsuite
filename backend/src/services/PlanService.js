"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = exports.PLAN_LIMITS = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
exports.PLAN_LIMITS = {
    FREE: {
        projects: 3,
        clients: 15,
        teamMembers: 3,
    },
    PRO: {
        projects: 999999, // Infinite essentially
        clients: 999999,
        teamMembers: 999999,
    },
    ENTERPRISE: {
        projects: 999999,
        clients: 999999,
        teamMembers: 999999,
    }
};
class PlanService {
    /**
     * Helper to fetch the current workspace subscription state.
     */
    static async getWorkspacePlan(workspaceId) {
        const sub = await prisma.subscription.findUnique({
            where: { workspaceId }
        });
        // If no subscription record or status is canceled/past due, default to FREE
        if (!sub || (sub.status !== 'ACTIVE' && sub.status !== 'TRIALING')) {
            return 'FREE';
        }
        return sub.plan;
    }
    /**
     * Check if a workspace can create a new entity of a specific type.
     * Throws an error if limit exceeded.
     */
    static async enforceLimit(workspaceId, resource) {
        const plan = await this.getWorkspacePlan(workspaceId);
        const limit = exports.PLAN_LIMITS[plan][resource];
        let currentCount = 0;
        switch (resource) {
            case 'projects':
                currentCount = await prisma.project.count({ where: { workspaceId, status: { not: 'CANCELLED' } } });
                break;
            case 'clients':
                currentCount = await prisma.client.count({ where: { workspaceId } });
                break;
            case 'teamMembers':
                currentCount = await prisma.workspaceMember.count({ where: { workspaceId } });
                break;
        }
        if (currentCount >= limit) {
            throw new Error(`PLAN_LIMIT_REACHED:${plan}: You have reached the maximum number of ${resource} allowed on the ${plan} plan.`);
        }
    }
    /**
     * Get current usage statistics for billing dashboard
     */
    static async getUsage(workspaceId) {
        const plan = await this.getWorkspacePlan(workspaceId);
        const limits = exports.PLAN_LIMITS[plan];
        const [projects, clients, teamMembers] = await Promise.all([
            prisma.project.count({ where: { workspaceId, status: { not: 'CANCELLED' } } }),
            prisma.client.count({ where: { workspaceId } }),
            prisma.workspaceMember.count({ where: { workspaceId } })
        ]);
        const subscription = await prisma.subscription.findUnique({
            where: { workspaceId }
        });
        return {
            plan,
            limits,
            usage: {
                projects,
                clients,
                teamMembers
            },
            subscription: subscription || { status: 'INCOMPLETE', plan: 'FREE' }
        };
    }
}
exports.PlanService = PlanService;
//# sourceMappingURL=PlanService.js.map