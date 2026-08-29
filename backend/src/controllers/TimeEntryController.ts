import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const createTimeEntrySchema = z.object({
  description: z.string().optional(),
  duration: z.number().optional(), // In seconds
  isTimer: z.boolean().default(false),
  billable: z.boolean().default(true),
  taskId: z.number().optional(),
  projectId: z.number().optional(),
  startTime: z.string().optional(),
});

const updateTimeEntrySchema = z.object({
  description: z.string().optional(),
  duration: z.number().optional(),
  billable: z.boolean().optional(),
  action: z.enum(["stop", "update"]).default("update"),
  taskId: z.number().nullable().optional(),
  projectId: z.number().nullable().optional(),
});

export const createTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user?.userId; // Assuming auth middleware attaches user
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = createTimeEntrySchema.parse(req.body);

    if (data.isTimer) {
      // Guard: Enforce single running timer server-side
      const runningTimer = await prisma.timeEntry.findFirst({
        where: {
          userId,
          workspaceId: Number(workspaceId),
          endTime: null,
          startTime: { not: null },
        },
      });

      if (runningTimer && runningTimer.startTime) {
        // Auto-stop the existing timer
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - runningTimer.startTime.getTime()) / 1000);
        
        await prisma.timeEntry.update({
          where: { id: runningTimer.id },
          data: {
            endTime: now,
            duration: diffInSeconds,
          },
        });
      }

      const newEntry = await prisma.timeEntry.create({
        data: {
          workspaceId: Number(workspaceId),
          userId,
          description: data.description || "",
          startTime: new Date(),
          duration: 0,
          billable: data.billable,
          taskId: data.taskId,
          projectId: data.projectId,
        },
        include: {
          project: { select: { id: true, name: true, hourlyRate: true } },
          task: { select: { id: true, title: true } },
        }
      });
      return res.status(201).json(newEntry);
    } else {
      // Manual time entry
      if (data.duration === undefined) {
        return res.status(400).json({ error: "Duration is required for manual entries" });
      }

      const newEntry = await prisma.timeEntry.create({
        data: {
          workspaceId: Number(workspaceId),
          userId,
          description: data.description || "",
          duration: data.duration,
          billable: data.billable,
          taskId: data.taskId,
          projectId: data.projectId,
          startTime: data.startTime ? new Date(data.startTime) : new Date(),
          endTime: data.startTime ? new Date(new Date(data.startTime).getTime() + data.duration * 1000) : new Date(Date.now() + data.duration * 1000),
        },
        include: {
          project: { select: { id: true, name: true, hourlyRate: true } },
          task: { select: { id: true, title: true } },
        }
      });
      return res.status(201).json(newEntry);
    }
  } catch (error) {
    console.error("Error creating time entry:", error);
    res.status(500).json({ error: "Failed to create time entry" });
  }
};

export const getTimeEntries = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { unbilledOnly, projectId, taskId } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const whereClause: any = {
      workspaceId: Number(workspaceId),
    };

    // Depending on permissions, maybe fetch only own entries or all in workspace
    // For now, let's fetch all in workspace for managers, or filter by userId
    // I'll leave it to fetch all for the workspace to match standard CRM behavior
    
    if (unbilledOnly === "true") {
      whereClause.invoiceId = null;
      whereClause.billable = true;
    }
    
    if (projectId) whereClause.projectId = Number(projectId);
    if (taskId) whereClause.taskId = Number(taskId);

    const entries = await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, hourlyRate: true } },
        project: { select: { id: true, name: true, hourlyRate: true } },
        task: { select: { id: true, title: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    res.status(500).json({ error: "Failed to fetch time entries" });
  }
};

export const updateTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const data = updateTimeEntrySchema.parse(req.body);

    const entry = await prisma.timeEntry.findUnique({ where: { id: Number(id) } });
    if (!entry) return res.status(404).json({ error: "Time entry not found" });

    // Assuming we don't strict-lock updates to only the creator, but in a real app we might
    if (data.action === "stop") {
      if (entry.endTime) {
        return res.status(400).json({ error: "Timer already stopped" });
      }
      if (!entry.startTime) {
        return res.status(400).json({ error: "Entry is not a running timer" });
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - entry.startTime.getTime()) / 1000);

      const updated = await prisma.timeEntry.update({
        where: { id: Number(id) },
        data: {
          endTime: now,
          duration: diffInSeconds,
        },
        include: {
          project: { select: { id: true, name: true, hourlyRate: true } },
          task: { select: { id: true, title: true } },
        }
      });
      return res.json(updated);
    } else {
      // Manual update
      const updateData: any = {};
      if (data.description !== undefined) updateData.description = data.description;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.billable !== undefined) updateData.billable = data.billable;
      if (data.taskId !== undefined) updateData.taskId = data.taskId;
      if (data.projectId !== undefined) updateData.projectId = data.projectId;

      const updated = await prisma.timeEntry.update({
        where: { id: Number(id) },
        data: updateData,
        include: {
          project: { select: { id: true, name: true, hourlyRate: true } },
          task: { select: { id: true, title: true } },
        }
      });
      return res.json(updated);
    }
  } catch (error) {
    console.error("Error updating time entry:", error);
    res.status(500).json({ error: "Failed to update time entry" });
  }
};

export const deleteTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if it's already billed
    const entry = await prisma.timeEntry.findUnique({ where: { id: Number(id) } });
    if (entry?.invoiceId) {
      return res.status(400).json({ error: "Cannot delete a time entry that is already billed" });
    }

    await prisma.timeEntry.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting time entry:", error);
    res.status(500).json({ error: "Failed to delete time entry" });
  }
};
