import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '../../generated/prisma';
import Redis from 'ioredis';

const prisma = new PrismaClient();

// Initialize Redis client gracefully
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Retry up to 3 times, then stop to prevent console spam
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  }
});
redis.on('error', (err) => console.warn('Redis Warning:', err.message));

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
          tasks: [],
          invoices: []
        });
        return;
      }

      const queryStr = q.trim();
      const cacheKey = `search:${workspaceId}:${queryStr.toLowerCase()}`;

      // Try fetching from Redis cache first
      if (redis.status === 'ready') {
        try {
          const cachedResults = await redis.get(cacheKey);
          if (cachedResults) {
            res.setHeader('X-Cache', 'HIT');
            res.json(JSON.parse(cachedResults));
            return;
          }
        } catch (cacheErr) {
          // Silently fail if cache read fails
        }
      }

      const [leads, deals, clients, projects, tasks, invoices] = await Promise.all([
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
        }),

        // Search Invoices (invoiceNumber, client name)
        prisma.invoice.findMany({
          where: {
            workspaceId,
            OR: [
              { invoiceNumber: { contains: queryStr, mode: 'insensitive' } },
              { client: { name: { contains: queryStr, mode: 'insensitive' } } }
            ]
          },
          take: 5,
          select: { id: true, invoiceNumber: true, status: true, total: true, client: { select: { name: true } } }
        })
      ]);

      const results = {
        leads,
        deals,
        clients,
        projects,
        tasks,
        invoices
      };

      // Save to Redis cache for 5 minutes (300 seconds)
      if (redis.status === 'ready') {
        try {
          await redis.setex(cacheKey, 300, JSON.stringify(results));
        } catch (cacheErr) {
          // Silently fail if cache write fails
        }
      }

      res.setHeader('X-Cache', 'MISS');
      res.json(results);
    } catch (error) {
      console.error('Error in global search:', error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  }
}
