"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class CalendarController {
    // Get all time-sensitive items (Tasks, Invoices, Projects) to display on the calendar board
    static async getCalendarEvents(req, res) {
        try {
            const workspaceId = req.workspaceId;
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
            // Fetch active projects with deadlines
            const projects = await prisma.project.findMany({
                where: {
                    workspaceId,
                    deadline: { not: null },
                    status: { notIn: ['COMPLETED', 'CANCELLED'] }
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
                })),
                ...projects.map(p => ({
                    id: `project_${p.id}`,
                    type: 'PROJECT',
                    title: `Project: ${p.name}`,
                    description: p.client?.name || 'Internal',
                    date: p.deadline,
                    metadata: {}
                }))
            ];
            // Sort events chronologically
            events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            res.json(events);
        }
        catch (error) {
            console.error('Error fetching calendar events:', error);
            res.status(500).json({ error: 'Failed to fetch calendar events' });
        }
    }
}
exports.CalendarController = CalendarController;
//# sourceMappingURL=CalendarController.js.map