import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class ActivityController {
  // Get activity feed for the workspace
  static async getFeed(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await prisma.activityLog.findMany({
        where: {
          workspaceId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          lead: { select: { id: true, contactName: true, company: true } },
          client: { select: { id: true, name: true, company: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
          invoice: { select: { id: true, invoiceNumber: true } }
        }
      });

      res.json(activities);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      res.status(500).json({ error: 'Failed to fetch activity feed' });
    }
  }
}
