import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class AnalyticsController {
  static async getOverview(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const periodStr = (req.query.period as string) || '30d';

      // 1. Determine date ranges
      const now = new Date();
      let currentStartDate: Date | null = null;
      let previousStartDate: Date | null = null;
      let previousEndDate: Date | null = null;

      if (periodStr === '7d') {
        currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = currentStartDate;
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      } else if (periodStr === '30d') {
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousEndDate = currentStartDate;
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      } else if (periodStr === '90d') {
        currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousEndDate = currentStartDate;
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      } else if (periodStr === 'this_quarter') {
        currentStartDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        previousEndDate = currentStartDate;
        previousStartDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
      } else if (periodStr === 'this_year') {
        currentStartDate = new Date(now.getFullYear(), 0, 1);
        previousEndDate = currentStartDate;
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
      }

      // 2. Fetch Base Records
      const allPayments = await prisma.payment.findMany({ where: { workspaceId } });
      const currentPayments = currentStartDate ? allPayments.filter(p => p.date >= currentStartDate) : allPayments;
      const prevPayments = (previousStartDate && previousEndDate) ? allPayments.filter(p => p.date >= previousStartDate && p.date < previousEndDate) : [];

      const currentRevenue = currentPayments.reduce((s, p) => s + Number(p.amount), 0);
      const prevRevenue = prevPayments.reduce((s, p) => s + Number(p.amount), 0);

      const allInvoices = await prisma.invoice.findMany({ where: { workspaceId } });
      const currentInvoices = currentStartDate ? allInvoices.filter(i => i.issueDate >= currentStartDate) : allInvoices;
      const prevInvoices = (previousStartDate && previousEndDate) ? allInvoices.filter(i => i.issueDate >= previousStartDate && i.issueDate < previousEndDate) : [];

      const allDeals = await prisma.deal.findMany({ where: { workspaceId } });
      const activeDeals = allDeals.filter(d => ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(d.stage));
      const pipelineValue = activeDeals.reduce((s, d) => s + Number(d.estimatedValue), 0);
      
      const currentDealsWon = currentStartDate ? allDeals.filter(d => d.stage === 'WON' && d.updatedAt >= currentStartDate) : allDeals.filter(d => d.stage === 'WON');
      const prevDealsWon = (previousStartDate && previousEndDate) ? allDeals.filter(d => d.stage === 'WON' && d.updatedAt >= previousStartDate && d.updatedAt < previousEndDate) : [];
      
      const allTasks = await prisma.task.findMany({ where: { workspaceId } });
      const currentTasksDone = currentStartDate ? allTasks.filter(t => t.status === 'DONE' && t.updatedAt >= currentStartDate) : allTasks.filter(t => t.status === 'DONE');
      const prevTasksDone = (previousStartDate && previousEndDate) ? allTasks.filter(t => t.status === 'DONE' && t.updatedAt >= previousStartDate && t.updatedAt < previousEndDate) : [];

      const activeClients = await prisma.client.count({ where: { workspaceId } });

      const allProjects = await prisma.project.findMany({ where: { workspaceId } });
      const activeProjects = allProjects.filter(p => ['PLANNING', 'ACTIVE'].includes(p.status));
      const currentActiveProjects = activeProjects.length;
      
      // Calculate previous active projects (approximate based on creation date for simplicity)
      const prevActiveProjects = previousStartDate && previousEndDate 
        ? allProjects.filter(p => p.createdAt < previousEndDate && p.status !== 'COMPLETED').length
        : null;

      // 3. Build Revenue Time Series
      let seriesData: Record<string, { invoiced: number, collected: number }> = {};
      
      const addToSeries = (date: Date, type: 'invoiced'|'collected', amount: number) => {
        let key = '';
        if (!currentStartDate || periodStr === '7d' || periodStr === '30d') {
          key = date.toISOString().split('T')[0] || '';
        } else if (periodStr === '90d' || periodStr === 'this_quarter') {
           const d = new Date(date);
           d.setDate(d.getDate() - d.getDay()); // Sunday
           key = d.toISOString().split('T')[0] || '';
        } else {
           key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        if (!seriesData[key]) seriesData[key] = { invoiced: 0, collected: 0 };
        seriesData[key]![type] += amount;
      };

      currentInvoices.forEach(i => addToSeries(i.issueDate, 'invoiced', Number(i.total)));
      currentPayments.forEach(p => addToSeries(p.date, 'collected', Number(p.amount)));

      const revenueSeries = Object.keys(seriesData).sort().map(date => ({
        date,
        invoiced: seriesData[date]!.invoiced,
        collected: seriesData[date]!.collected
      }));

      // 4. Sales Pipeline
      const pipelineDistribution = {
        NEW: allDeals.filter(d => d.stage === 'NEW').length,
        CONTACTED: allDeals.filter(d => d.stage === 'CONTACTED').length,
        QUALIFIED: allDeals.filter(d => d.stage === 'QUALIFIED').length,
        PROPOSAL: allDeals.filter(d => d.stage === 'PROPOSAL').length,
        NEGOTIATION: allDeals.filter(d => d.stage === 'NEGOTIATION').length,
        WON: allDeals.filter(d => d.stage === 'WON').length,
        LOST: allDeals.filter(d => d.stage === 'LOST').length,
      };

      const totalClosedDeals = pipelineDistribution.WON + pipelineDistribution.LOST;
      const conversionRate = totalClosedDeals > 0 ? Math.round((pipelineDistribution.WON / totalClosedDeals) * 100) : null;

      // 5. Delivery Tasks & Projects
      const taskDistribution = {
        TODO: allTasks.filter(t => t.status === 'TODO').length,
        IN_PROGRESS: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
        REVIEW: allTasks.filter(t => t.status === 'REVIEW').length,
        DONE: allTasks.filter(t => t.status === 'DONE').length,
      };
      const overdueTasks = allTasks.filter(t => t.status !== 'DONE' && t.dueDate && t.dueDate < now).length;
      const taskCompletionRate = allTasks.length > 0 ? Math.round((taskDistribution.DONE / allTasks.length) * 100) : 0;

      const projectDistribution = {
        PLANNING: allProjects.filter(p => p.status === 'PLANNING').length,
        ACTIVE: allProjects.filter(p => p.status === 'ACTIVE').length,
        ON_HOLD: allProjects.filter(p => p.status === 'ON_HOLD').length,
        COMPLETED: allProjects.filter(p => p.status === 'COMPLETED').length,
        CANCELLED: allProjects.filter(p => p.status === 'CANCELLED').length,
      };

      res.json({
        period: periodStr,
        hasPreviousPeriod: !!previousStartDate,
        kpis: {
          revenue: { current: currentRevenue, previous: prevRevenue },
          pipeline: { current: pipelineValue, previous: null },
          projects: { current: currentActiveProjects, previous: prevActiveProjects },
          clients: { current: activeClients, previous: null },
          taskCompletion: { current: taskCompletionRate, done: taskDistribution.DONE, total: allTasks.length }
        },
        revenueSeries,
        pipeline: {
          distribution: pipelineDistribution,
          conversionRate,
          openDeals: allDeals.length - totalClosedDeals,
          wonDeals: pipelineDistribution.WON,
          totalDeals: allDeals.length
        },
        delivery: {
          distribution: taskDistribution,
          overdue: overdueTasks,
          total: allTasks.length,
          completed: taskDistribution.DONE,
          inProgress: taskDistribution.IN_PROGRESS
        },
        projects: {
          distribution: projectDistribution,
          active: currentActiveProjects,
          total: allProjects.length,
          completed: projectDistribution.COMPLETED
        },
        performance: {
          revenue: { current: currentRevenue, previous: prevRevenue },
          invoicesIssued: { current: currentInvoices.length, previous: prevInvoices.length },
          paymentsReceived: { current: currentPayments.length, previous: prevPayments.length },
          dealsWon: { current: currentDealsWon.length, previous: prevDealsWon.length },
          tasksCompleted: { current: currentTasksDone.length, previous: prevTasksDone.length }
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}
