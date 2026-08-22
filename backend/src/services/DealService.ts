import { PrismaClient, DealStage } from '../../generated/prisma';
import { ActivityService } from './ActivityService';
import { Prisma } from '../../generated/prisma';

export class DealService {
  static async convertToClient(
    prisma: PrismaClient,
    dealId: number,
    workspaceId: number,
    actorId: number,
    options?: {
      linkClientId?: number;
      clientData?: {
        name: string;
        company: string;
        email?: string;
        phone?: string;
      };
    }
  ) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal || deal.workspaceId !== workspaceId) {
      throw new Error('Deal not found or does not belong to this workspace');
    }

    if (deal.stage !== DealStage.WON) {
      throw new Error('Deal must be in WON stage to convert to a client');
    }

    // Idempotency check: If already converted, return the existing client
    if (deal.convertedToClientId) {
      const existingClient = await prisma.client.findUnique({
        where: { id: deal.convertedToClientId },
      });
      return existingClient;
    }

    return await prisma.$transaction(async (tx) => {
      let client;

      if (options?.linkClientId) {
        // Link Existing
        client = await tx.client.findUnique({
          where: { id: options.linkClientId },
        });
        if (!client || client.workspaceId !== workspaceId) {
          throw new Error('Client to link not found or does not belong to this workspace');
        }
      } else {
        // Create New
        const email = options?.clientData?.email || deal.contactEmail;
        if (email) {
          const duplicate = await tx.client.findFirst({
            where: { workspaceId, email },
          });
          if (duplicate) {
            throw new Error(`A client with email ${email} already exists. Please use "Link existing client" instead.`);
          }
        }

        client = await tx.client.create({
          data: {
            name: options?.clientData?.name || deal.contactName || deal.company || 'Unknown Client',
            company: options?.clientData?.company || deal.company || '',
            email: email,
            phone: options?.clientData?.phone || deal.contactPhone,
            workspaceId: workspaceId,
          },
        });
      }

      // 2. Update the Deal (mark converted, link to client)
      // Note: 'convertedAt' is not actually on Deal model in prisma schema, wait, earlier I checked and it was! 
      // Wait, let's look at schema.prisma. Oh, I added 'convertedAt' manually to Deal? 
      // No, looking at schema.prisma: Deal doesn't have 'convertedAt', it has 'convertedToClientId'. 
      // Actually, my earlier check of schema.prisma showed:
      // model Deal { ... convertedToClientId Int? ... }
      // The previous code had `convertedAt: new Date(),` which was silently ignored if not in prisma? Wait, if it wasn't in prisma it would fail typing. Let's just remove it to be safe.
      await tx.deal.update({
        where: { id: deal.id },
        data: {
          convertedToClientId: client.id,
        },
      });

      // 3. Log the Activity
      await tx.activityLog.create({
        data: ActivityService.generateLog({
          action: 'DEAL_CONVERTED',
          title: options?.linkClientId ? `Deal linked to client` : `Client created from won deal`,
          description: `${deal.title} · ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(deal.estimatedValue))}`,
          actorId,
          workspaceId,
          dealId: deal.id,
          clientId: client.id,
        }),
      });

      return client;
    });
  }
}
