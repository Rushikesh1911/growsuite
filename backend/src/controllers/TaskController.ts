import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient, TaskStatus } from '../../generated/prisma';
import { ActivityService } from '../services/ActivityService';
import { EmailService } from '../services/EmailService';
import { NotificationService } from '../services/NotificationService';
import { SocketService } from '../socket';
import { GoogleCalendarService } from '../services/GoogleCalendarService';

const prisma = new PrismaClient();

export class TaskController {
  // Get all tasks across workspace
  static async getAllTasks(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const tasks = await prisma.task.findMany({
        where: { workspaceId },
        include: { 
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, user: { select: { name: true, email: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  // Create a task globally (requires projectId or dealId in body)
  static async createTask(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const { title, projectId, dealId, dueDate, description, status, priority, assigneeId } = req.body;

      if (!title || (!projectId && !dealId)) {
        res.status(400).json({ error: 'Title and either projectId or dealId are required' });
        return;
      }

      let clientId: number | null = null;

      if (projectId) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.workspaceId !== workspaceId) {
          res.status(404).json({ error: 'Project not found' });
          return;
        }
        clientId = project.clientId;
      }

      if (dealId) {
        const deal = await prisma.deal.findUnique({ where: { id: dealId } });
        if (!deal || deal.workspaceId !== workspaceId) {
          res.status(404).json({ error: 'Deal not found' });
          return;
        }
      }

      const task = await prisma.$transaction(async (tx) => {
        const newTask = await tx.task.create({
          data: {
            title,
            description: description || null,
            status: status || 'TODO',
            priority: priority || 'MEDIUM',
            projectId: projectId || null,
            dealId: dealId || null,
            assigneeId: assigneeId ? parseInt(assigneeId, 10) : null,
            workspaceId,
            dueDate: dueDate ? new Date(dueDate) : null,
          },
          include: { assignee: { include: { user: true } } }
        });

        await tx.activityLog.create({
          data: ActivityService.generateLog({
            action: 'TASK_CREATED',
            title: `Task created`,
            description: newTask.title,
            actorId: req.user!.userId,
            workspaceId,
            projectId: projectId ? Number(projectId) : undefined,
            dealId: dealId ? Number(dealId) : undefined,
            clientId: clientId ? Number(clientId) : undefined,
          })
        });

        return newTask;
      });

      // Handle notifications for task creation if assignee exists and is not self
      if (task.assigneeId) {
        const membership = await prisma.workspaceMember.findUnique({
          where: { id: task.assigneeId },
          include: { user: true, workspace: true }
        });
        
        if (membership && membership.userId !== req.user!.userId) {
          // Add in-app notification
          await NotificationService.create({
            userId: membership.userId,
            workspaceId: membership.workspaceId,
            type: 'TASK_ASSIGNED',
            title: 'New task assigned',
            body: `You were assigned: ${task.title}`,
            link: '/dashboard/tasks'
          });
          
          // Send email
          const assigner = await prisma.user.findUnique({ where: { id: req.user!.userId } });
          if (assigner) {
            await EmailService.sendTaskAssignmentAlert(
              membership.user.email,
              task.title,
              assigner.name || assigner.email,
              membership.workspace.name
            );
          }
        }
      }

      SocketService.emitToWorkspace(workspaceId, 'task_created', task);

      if (task.assignee && task.assignee.userId) {
        GoogleCalendarService.syncTaskToCalendar(task.assignee.userId, task);
      }

      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  // Update a task
  static async updateTask(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const taskId = parseInt(req.params.id as string, 10);
      const { title, description, status, priority, dueDate, assigneeId } = req.body;

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Valid taskId is required' });
        return;
      }

      // Ensure task belongs to workspace
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true, assignee: { include: { user: true } } }
      });

      if (!existingTask || existingTask.workspaceId !== workspaceId) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const updatedTask = await prisma.$transaction(async (tx) => {
        const t = await tx.task.update({
          where: { id: taskId },
          data: {
            title: title !== undefined ? title : existingTask.title,
            description: description !== undefined ? description : existingTask.description,
            status: status !== undefined ? status : existingTask.status,
            priority: priority !== undefined ? priority : existingTask.priority,
            dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate,
            assigneeId: assigneeId !== undefined ? (assigneeId ? parseInt(assigneeId, 10) : null) : existingTask.assigneeId,
          },
          include: { assignee: { include: { user: true } } }
        });

        // Log status changes
        if (status && status !== existingTask.status) {
          await tx.activityLog.create({
            data: ActivityService.generateLog({
              action: 'TASK_UPDATED',
              title: `Task moved to ${status.replace('_', ' ')}`,
              description: t.title,
              actorId: req.user!.userId,
              workspaceId,
              projectId: t.projectId !== null ? t.projectId : undefined,
              dealId: t.dealId !== null ? t.dealId : undefined,
              clientId: existingTask.project ? existingTask.project.clientId : undefined,
            }),
          });
        }

        return t;
      });

      // Handle notifications for assignee changes
      if (assigneeId && assigneeId !== existingTask.assigneeId) {
        const membership = await prisma.workspaceMember.findUnique({
          where: { id: assigneeId },
          include: { user: true, workspace: true }
        });
        
        if (membership && membership.userId !== req.user!.userId) {
          // Add in-app notification
          await NotificationService.create({
            userId: membership.userId,
            workspaceId: membership.workspaceId,
            type: 'TASK_ASSIGNED',
            title: 'New task assigned',
            body: `You were assigned: ${updatedTask.title}`,
            link: '/dashboard/tasks'
          });
          
          // Send email
          const assigner = await prisma.user.findUnique({ where: { id: req.user!.userId } });
          if (assigner) {
            await EmailService.sendTaskAssignmentAlert(
              membership.user.email,
              updatedTask.title,
              assigner.name || assigner.email,
              membership.workspace.name
            );
          }
        }
      }

      SocketService.emitToWorkspace(workspaceId, 'task_updated', updatedTask);

      if (updatedTask.assignee && updatedTask.assignee.userId) {
        GoogleCalendarService.syncTaskToCalendar(updatedTask.assignee.userId, updatedTask);
      }

      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  // Delete a task
  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const taskId = parseInt(req.params.id as string, 10);

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Valid taskId is required' });
        return;
      }

      const existingTask = await prisma.task.findUnique({ 
        where: { id: taskId },
        include: { assignee: { include: { user: true } } } 
      });
      if (!existingTask || existingTask.workspaceId !== workspaceId) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      await prisma.task.delete({
        where: { id: taskId, workspaceId },
      });

      if (existingTask.googleEventId && existingTask.assignee && existingTask.assignee.userId) {
        GoogleCalendarService.deleteTaskFromCalendar(existingTask.assignee.userId, existingTask.googleEventId);
      }

      res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}
