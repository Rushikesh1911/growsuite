import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class SearchController {
  static async globalSearch(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const q = req.query.q as string;

      if (!q || q.trim().length === 0) {
        res.json({
          leads: [],
          deals: [],
          clients: [],
          projects: [],
          tasks: []
        });
        return;
      }

      const queryStr = q.trim();

      const [leads, deals, clients, projects, tasks] = await Promise.all([
        // Search Leads (name, company, email)
        prisma.lead.findMany({
          where: {
            workspaceId,
            OR: [
              { contactName: { contains: queryStr, mode: 'insensitive' } },
              { company: { contains: queryStr, mode: 'insensitive' } },
              { email: { contains: queryStr, mode: 'insensitive' } }
            ]
          },
          take: 5,
          select: { id: true, contactName: true, company: true, status: true }
        }),
        
        // Search Deals (name, company)
        prisma.deal.findMany({
          where: {
            workspaceId,
            OR: [
              { title: { contains: queryStr, mode: 'insensitive' } },
              { company: { contains: queryStr, mode: 'insensitive' } }
            ]
          },
          take: 5,
          select: { id: true, title: true, stage: true, estimatedValue: true, company: true }
        }),

        // Search Clients (name, company, email)
        prisma.client.findMany({
          where: {
            workspaceId,
            OR: [
              { name: { contains: queryStr, mode: 'insensitive' } },
              { company: { contains: queryStr, mode: 'insensitive' } },
              { email: { contains: queryStr, mode: 'insensitive' } }
            ]
          },
          take: 5,
          select: { id: true, name: true, company: true }
        }),

        // Search Projects (name)
        prisma.project.findMany({
          where: {
            workspaceId,
            archivedAt: null,
            OR: [
              { name: { contains: queryStr, mode: 'insensitive' } },
              { client: { name: { contains: queryStr, mode: 'insensitive' } } }
            ]
          },
          take: 5,
          select: { id: true, name: true, status: true, client: { select: { name: true } } }
        }),

        // Search Tasks (title)
        prisma.task.findMany({
          where: {
            project: { workspaceId, archivedAt: null },
            title: { contains: queryStr, mode: 'insensitive' }
          },
          take: 5,
          select: { id: true, title: true, status: true, projectId: true, project: { select: { name: true } } }
        })
      ]);

      res.json({
        leads,
        deals,
        clients,
        projects,
        tasks
      });
    } catch (error) {
      console.error('Error in global search:', error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  }
}
