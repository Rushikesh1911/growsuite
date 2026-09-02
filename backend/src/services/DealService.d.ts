import { PrismaClient } from '../../generated/prisma';
export declare class DealService {
    static convertToClient(prisma: PrismaClient, dealId: number, workspaceId: number, actorId: number, options?: {
        linkClientId?: number;
        clientData?: {
            name: string;
            company: string;
            email?: string;
            phone?: string;
        };
    }): Promise<{
        id: number;
        name: string;
        company: string;
        email: string | null;
        phone: string | null;
        billingAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
        workspaceId: number;
    } | null>;
}
//# sourceMappingURL=DealService.d.ts.map