import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient, DealStage } from '../../generated/prisma';
import { DealService } from '../services/DealService';
import { ActivityService } from '../services/ActivityService';
import { NotificationService } from '../services/NotificationService';
import { SocketService } from '../socket';

const prisma = new PrismaClient();

export class DealController {
  // Get all active deals for the workspace
  static async getDeals(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const includeArchived = req.query.includeArchived === 'true';
      const whereClause: any = { workspaceId };
      if (!includeArchived) {
        whereClause.archivedAt = null;
      }
      
      const deals = await prisma.deal.findMany({
        where: whereClause,
        include: { 
          tasks: { orderBy: { createdAt: 'desc' } },
          activities: { orderBy: { createdAt: 'desc' } },
          dealNotes: { include: { author: { include: { user: true } } }, orderBy: { createdAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      res.status(500).json({ error: 'Failed to fetch deals' });
    }
  }

  // Create a new deal
  static async createDeal(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const { title, company, contactName, contactEmail, contactPhone, estimatedValue } = req.body;

      if (!title || !company) {
        res.status(400).json({ error: 'Title and company are required' });
        return;
      }

      // Transactional creation with Activity Log
      const result = await prisma.$transaction(async (tx) => {
        const deal = await tx.deal.create({
          data: {
            title,
            company,
            contactName,
            contactEmail,
            contactPhone,
            estimatedValue: estimatedValue || 0,
            workspaceId,
          },
        });

        await tx.activityLog.create({
          data: ActivityService.generateLog({
            action: 'DEAL_CREATED',
            title: 'New Deal Created',
            description: `${title} at ${company}`,
            actorId,
            workspaceId,
            dealId: deal.id,
          }),
        });

        return deal;
      });

      SocketService.emitToWorkspace(workspaceId, 'deal_created', result);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating deal:', error);
      res.status(500).json({ error: 'Failed to create deal' });
    }
  }

  // Update an existing deal (stage, probability, etc)
  static async updateDeal(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const dealId = parseInt(req.params.id as string, 10);
      const { 
        stage, probability, expectedClose,
        title, company, estimatedValue,
        contactName, contactEmail, contactPhone,
        notes, archivedAt
      } = req.body;

      if (isNaN(dealId)) {
        res.status(400).json({ error: 'Invalid Deal ID' });
        return;
      }

      // Fetch existing deal to check previous stage
      const existingDeal = await prisma.deal.findUnique({
        where: { id: dealId, workspaceId }
      });

      if (!existingDeal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
      }

      // Allow partial updates
      const updateData: any = {};
      if (stage !== undefined) updateData.stage = stage;
      if (probability !== undefined) updateData.probability = probability !== null ? parseInt(probability, 10) : null;
      if (expectedClose !== undefined) updateData.expectedClose = expectedClose ? new Date(expectedClose) : null;
      if (title !== undefined) updateData.title = title;
      if (company !== undefined) updateData.company = company;
      if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue;
      if (contactName !== undefined) updateData.contactName = contactName;
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
      if (notes !== undefined) updateData.notes = notes;
      if (archivedAt !== undefined) updateData.archivedAt = archivedAt ? new Date(archivedAt) : null;

      const deal = await prisma.deal.update({
        where: { id: dealId, workspaceId },
        data: updateData,
      });

      // Optionally log activity if stage changed
      if (stage && stage !== existingDeal.stage) {
        await prisma.activityLog.create({
          data: ActivityService.generateLog({
            action: 'DEAL_STAGE_UPDATED',
            title: 'Deal Stage Updated',
            description: `Moved to ${stage}`,
            actorId,
            workspaceId,
            dealId: deal.id,
          }),
        });

        // Trigger notification if Deal is WON
        if (stage === 'WON' && existingDeal.stage !== 'WON') {
          // Notify workspace Owners & Admins
          const admins = await prisma.workspaceMember.findMany({
            where: {
              workspaceId,
              role: { in: ['OWNER', 'ADMIN'] }
            },
            include: { user: true }
          });

          const formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD' // Defaulting since workspace currency isn't easily grabbed here, but we can just use the value
          }).format(Number(deal.estimatedValue));

          for (const admin of admins) {
            // Avoid notifying the person who just closed the deal
            if (admin.userId === actorId) continue;
            
            await NotificationService.create({
              userId: admin.userId,
              workspaceId,
              type: 'DEAL_WON',
              title: 'Deal won',
              body: `${deal.title} was closed for ${formattedValue}.`,
              link: `/dashboard/pipeline`
            });
          }
        }
      }

      SocketService.emitToWorkspace(workspaceId, 'deal_updated', deal);

      res.json(deal);
    } catch (error) {
      console.error('Error updating deal:', error);
      res.status(500).json({ error: 'Failed to update deal' });
    }
  }

  // Convert Deal to Client (Idempotent)
  static async convertDeal(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const dealId = parseInt(req.params.id as string, 10);
      const { linkClientId, clientData } = req.body;

      if (isNaN(dealId)) {
        res.status(400).json({ error: 'Invalid Deal ID' });
        return;
      }

      const client = await DealService.convertToClient(prisma, dealId, workspaceId, actorId, {
        linkClientId,
        clientData
      });
      res.status(200).json(client);
    } catch (error: any) {
      console.error('Error converting deal:', error);
      res.status(400).json({ error: error.message || 'Failed to convert deal' });
    }
  }

  // Add a note to a deal
  static async addNote(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const dealId = parseInt(req.params.id as string);
      const { content } = req.body;
      const userId = (req.user as any)?.userId;

      if (!content || !userId) {
        res.status(400).json({ error: 'Content and user are required' });
        return;
      }

      // Find the workspace member for the current user
      const member = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } }
      });

      if (!member) {
        res.status(403).json({ error: 'Not authorized in this workspace' });
        return;
      }

      const note = await prisma.dealNote.create({
        data: {
          content,
          dealId,
          authorId: member.id,
          workspaceId
        },
        include: {
          author: {
            include: { user: true }
          }
        }
      });

      // Record Activity
      await ActivityService.logActivity({
        workspaceId,
        actorId: userId,
        action: 'DEAL_NOTE_ADDED',
        title: 'Added a note',
        description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        dealId
      });

      // Fetch the updated deal to emit
      const updatedDeal = await prisma.deal.findUnique({
        where: { id: dealId },
        include: { 
          tasks: { orderBy: { createdAt: 'desc' } },
          activities: { orderBy: { createdAt: 'desc' } },
          dealNotes: { include: { author: { include: { user: true } } }, orderBy: { createdAt: 'desc' } }
        }
      });

      res.status(201).json(note);
      SocketService.emitToWorkspace(workspaceId, 'deal_updated', updatedDeal);
    } catch (error) {
      console.error('Error adding deal note:', error);
      res.status(500).json({ error: 'Failed to add note' });
    }
  }
  
  // Add a manual activity (e.g. Call, Meeting)
  static async addActivity(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const dealId = parseInt(req.params.id as string, 10);
      const { action, title, description, metadata } = req.body;

      if (isNaN(dealId) || !action || !title) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Verify deal exists and belongs to workspace
      const deal = await prisma.deal.findUnique({ where: { id: dealId, workspaceId } });
      if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
      }

      const activity = await prisma.activityLog.create({
        data: ActivityService.generateLog({
          action,
          title,
          description: description || null,
          actorId,
          workspaceId,
          dealId,
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

      // Fetch the updated deal to emit
      const updatedDeal = await prisma.deal.findUnique({
        where: { id: dealId },
        include: { 
          tasks: { orderBy: { createdAt: 'desc' } },
          activities: { orderBy: { createdAt: 'desc' } },
          dealNotes: { include: { author: { include: { user: true } } }, orderBy: { createdAt: 'desc' } }
        }
      });

      SocketService.emitToWorkspace(workspaceId, 'deal_updated', updatedDeal);

      res.status(201).json(activity);
    } catch (error) {
      console.error('Error adding activity:', error);
      res.status(500).json({ error: 'Failed to log activity' });
    }
  }
}
