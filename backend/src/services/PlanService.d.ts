import { SubscriptionPlan } from '../../generated/prisma';
export interface PlanLimits {
    projects: number;
    clients: number;
    teamMembers: number;
}
export declare const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits>;
export declare class PlanService {
    /**
     * Helper to fetch the current workspace subscription state.
     */
    static getWorkspacePlan(workspaceId: number): Promise<SubscriptionPlan>;
    /**
     * Check if a workspace can create a new entity of a specific type.
     * Throws an error if limit exceeded.
     */
    static enforceLimit(workspaceId: number, resource: keyof PlanLimits): Promise<void>;
    /**
     * Get current usage statistics for billing dashboard
     */
    static getUsage(workspaceId: number): Promise<{
        plan: import("../../generated/prisma").$Enums.SubscriptionPlan;
        limits: PlanLimits;
        usage: {
            projects: number;
            clients: number;
            teamMembers: number;
        };
        subscription: {
            id: number;
            workspaceId: number;
            plan: import("../../generated/prisma").$Enums.SubscriptionPlan;
            status: import("../../generated/prisma").$Enums.SubscriptionStatus;
            provider: import("../../generated/prisma").$Enums.BillingProvider | null;
            providerCustomerId: string | null;
            providerSubscriptionId: string | null;
            billingCycle: import("../../generated/prisma").$Enums.BillingCycle | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            trialStart: Date | null;
            trialEnd: Date | null;
            canceledAt: Date | null;
            cancelAtPeriodEnd: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | {
            status: "INCOMPLETE";
            plan: "FREE";
        };
    }>;
}
//# sourceMappingURL=PlanService.d.ts.map