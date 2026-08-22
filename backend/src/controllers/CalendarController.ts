import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class CalendarController {
  // Get all time-sensitive items (Tasks, Invoices) to display on the calendar board
  static async getCalendarEvents(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      
      // Fetch tasks with due dates
      const tasks = await prisma.task.findMany({
        where: {
          workspaceId,
          dueDate: { not: null },
          status: { not: 'DONE' } // Only show pending tasks on calendar
        },
        include: {
          project: { select: { name: true } },
          assignee: { include: { user: { select: { name: true, email: true } } } }
        }
      });

      // Fetch pending invoices with due dates
      const invoices = await prisma.invoice.findMany({
        where: {
          workspaceId,
          status: { in: ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'OVERDUE'] }
        },
        include: {
          client: { select: { name: true } }
        }
      });

      // Format them into a generic "Event" structure for the frontend Kanban
      const events = [
        ...tasks.map(t => ({
          id: `task_${t.id}`,
          type: 'TASK',
          title: t.title,
          description: t.project?.name || 'No Project',
          date: t.dueDate,
          metadata: {
            assignee: t.assignee?.user?.name || t.assignee?.user?.email
          }
        })),
        ...invoices.map(i => ({
          id: `invoice_${i.id}`,
          type: 'INVOICE',
          title: `Invoice ${i.invoiceNumber}`,
          description: i.client.name,
          date: i.dueDate,
          metadata: {
            amount: Number(i.balanceDue)
          }
        }))
      ];

      res.json(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  }
}
