import { Prisma } from '../../generated/prisma';
interface CreateActivityParams {
    action: string;
    title: string;
    description?: string;
    metadata?: object;
    actorId: number;
    workspaceId: number;
    leadId?: number;
    dealId?: number;
    clientId?: number;
    projectId?: number;
    taskId?: number;
    invoiceId?: number;
    paymentId?: number;
}
export declare class ActivityService {
    /**
     * Generates the Prisma create object for an activity log.
     * Can be used inside a Prisma Transaction ($transaction) or standard query.
     */
    static generateLog(params: CreateActivityParams): Prisma.ActivityLogCreateInput;
    /**
     * Directly creates an activity log in the database.
     */
    static logActivity(params: CreateActivityParams): Promise<{
        id: number;
        action: string;
        title: string;
        description: string | null;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
        actorId: number | null;
        workspaceId: number;
        leadId: number | null;
        dealId: number | null;
        clientId: number | null;
        projectId: number | null;
        taskId: number | null;
        invoiceId: number | null;
        paymentId: number | null;
    }>;
}
export {};
//# sourceMappingURL=ActivityService.d.ts.map