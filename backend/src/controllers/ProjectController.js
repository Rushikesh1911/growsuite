"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const PlanService_1 = require("../services/PlanService");
const ActivityService_1 = require("../services/ActivityService");
const socket_1 = require("../socket");
const prisma_1 = require("../../generated/prisma");
const NotificationService_1 = require("../services/NotificationService");
const prisma = new prisma_1.PrismaClient();
class ProjectController {
    // Get all projects for the workspace
    static async getProjects(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projects = await prisma.project.findMany({
                where: { workspaceId },
                include: {
                    client: true,
                    tasks: { include: { attachments: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json(projects);
        }
        catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }
    // Get project by ID
    static async getProjectById(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            if (isNaN(projectId)) {
                res.status(400).json({ error: 'Valid projectId is required' });
                return;
            }
            const project = await prisma.project.findFirst({
                where: { id: projectId, workspaceId },
                include: {
                    client: true,
                    invoices: {
                        orderBy: { createdAt: 'desc' },
                        include: { payments: { orderBy: { createdAt: 'desc' } } }
                    },
                    activities: {
                        orderBy: { createdAt: 'desc' },
                        take: 20,
                        include: { actor: { select: { name: true, email: true } } }
                    },
                    tasks: { include: { attachments: true } },
                    projectNotes: {
                        orderBy: { createdAt: 'desc' },
                        include: { author: { include: { user: { select: { name: true, email: true } } } } }
                    }
                },
            });
            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            res.json(project);
        }
        catch (error) {
            console.error('Error fetching project:', error);
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    }
    // Create a new project
    static async createProject(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const { name, title, description, clientId, status, deadline, hourlyRate } = req.body;
            const projectName = name || title;
            if (!projectName || !clientId) {
                res.status(400).json({ error: 'Project name and clientId are required' });
                return;
            }
            try {
                await PlanService_1.PlanService.enforceLimit(workspaceId, 'projects');
            }
            catch (err) {
                if (err.message.startsWith('PLAN_LIMIT_REACHED')) {
                    res.status(403).json({ error: err.message, code: 'PLAN_LIMIT_REACHED' });
                    return;
                }
                throw err;
            }
            // Validate Client exists
            const client = await prisma.client.findFirst({
                where: { id: parseInt(clientId, 10), workspaceId }
            });
            if (!client) {
                res.status(400).json({ error: `Client ID ${clientId} does not exist in your workspace.` });
                return;
            }
            const project = await prisma.$transaction(async (tx) => {
                const newProject = await tx.project.create({
                    data: {
                        name: projectName,
                        description,
                        status: status || 'PLANNING',
                        deadline: deadline ? new Date(deadline) : null,
                        clientId: parseInt(clientId, 10),
                        hourlyRate: hourlyRate !== undefined ? parseInt(hourlyRate, 10) : null,
                        workspaceId,
                    },
                    include: {
                        client: true,
                    },
                });
                // Log the Activity
                await tx.activityLog.create({
                    data: ActivityService_1.ActivityService.generateLog({
                        action: 'PROJECT_CREATED',
                        title: `Project created`,
                        description: `${newProject.name}`,
                        actorId: req.user.userId,
                        workspaceId,
                        clientId: newProject.clientId,
                        projectId: newProject.id,
                    }),
                });
                return newProject;
            });
            res.status(201).json(project);
            socket_1.SocketService.emitToWorkspace(workspaceId, 'project_created', project);
        }
        catch (error) {
            console.error('Error creating project:', error);
            res.status(500).json({ error: 'Failed to create project' });
        }
    }
    // Create a task within a project
    static async createTask(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            const { title, description } = req.body;
            if (!title || isNaN(projectId)) {
                res.status(400).json({ error: 'Title and valid projectId are required' });
                return;
            }
            // Ensure project exists and belongs to workspace
            const project = await prisma.project.findUnique({
                where: { id: projectId },
            });
            if (!project || project.workspaceId !== workspaceId) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            const task = await prisma.$transaction(async (tx) => {
                const newTask = await tx.task.create({
                    data: {
                        title,
                        description,
                        projectId,
                        workspaceId,
                    },
                });
                // Log the Activity
                await tx.activityLog.create({
                    data: ActivityService_1.ActivityService.generateLog({
                        action: 'TASK_CREATED',
                        title: `Task created`,
                        description: newTask.title,
                        actorId: req.user.userId,
                        workspaceId,
                        projectId,
                        clientId: project.clientId,
                    }),
                });
                return newTask;
            });
            res.status(201).json(task);
        }
        catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ error: 'Failed to create task' });
        }
    }
    // Update a project
    static async updateProject(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            const { name, description, status, deadline, clientId, hourlyRate } = req.body;
            if (isNaN(projectId)) {
                res.status(400).json({ error: 'Invalid project ID' });
                return;
            }
            // Verify ownership
            const existingProject = await prisma.project.findFirst({
                where: { id: projectId, workspaceId }
            });
            if (!existingProject) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            if (clientId) {
                const client = await prisma.client.findFirst({
                    where: { id: parseInt(clientId, 10), workspaceId }
                });
                if (!client) {
                    res.status(400).json({ error: `Client ID ${clientId} does not exist in your workspace.` });
                    return;
                }
            }
            const updatedProject = await prisma.project.update({
                where: { id: projectId },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(status && { status }),
                    ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
                    ...(clientId && { clientId: parseInt(clientId, 10) }),
                    ...(hourlyRate !== undefined && { hourlyRate: hourlyRate === null ? null : parseInt(hourlyRate, 10) })
                },
                include: {
                    client: true,
                    tasks: true
                }
            });
            ActivityService_1.ActivityService.logActivity({
                workspaceId,
                actorId: req.user?.userId,
                action: "UPDATED_PROJECT",
                title: `Updated project: ${updatedProject.name}`,
                projectId: updatedProject.id
            });
            res.json(updatedProject);
        }
        catch (error) {
            console.error('Error updating project:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    }
    // Delete a project (Undo)
    static async deleteProject(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            if (isNaN(projectId)) {
                res.status(400).json({ error: 'Valid projectId is required' });
                return;
            }
            // Check if project belongs to this workspace
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project || project.workspaceId !== workspaceId) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            await prisma.project.delete({ where: { id: projectId } });
            res.json({ success: true });
            socket_1.SocketService.emitToWorkspace(workspaceId, 'project_deleted', { id: projectId });
        }
        catch (error) {
            console.error('Error deleting project:', error);
            res.status(500).json({ error: 'Failed to delete project' });
        }
    }
    // Soft archive a project
    static async archiveProject(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project || project.workspaceId !== workspaceId) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            await prisma.project.update({
                where: { id: projectId },
                data: { archivedAt: new Date() }
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error archiving project:', error);
            res.status(500).json({ error: 'Failed to archive project' });
        }
    }
    // Unarchive a project
    static async unarchiveProject(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project || project.workspaceId !== workspaceId) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            await prisma.project.update({
                where: { id: projectId },
                data: { archivedAt: null }
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error unarchiving project:', error);
            res.status(500).json({ error: 'Failed to unarchive project' });
        }
    }
    // Get all tasks for a specific project
    static async getProjectTasks(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            if (isNaN(projectId)) {
                res.status(400).json({ error: 'Valid projectId is required' });
                return;
            }
            const tasks = await prisma.task.findMany({
                where: { projectId, workspaceId },
                include: { attachments: true },
                orderBy: { createdAt: 'desc' }
            });
            res.json(tasks);
        }
        catch (error) {
            console.error('Error fetching project tasks:', error);
            res.status(500).json({ error: 'Failed to fetch project tasks' });
        }
    }
    // Add a note to a project
    static async addNote(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const projectId = parseInt(req.params.id, 10);
            const { content } = req.body;
            const userId = req.user.userId;
            if (isNaN(projectId) || !content) {
                res.status(400).json({ error: 'Invalid input' });
                return;
            }
            // get member
            const member = await prisma.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId, workspaceId } }
            });
            if (!member) {
                res.status(403).json({ error: 'Not a member of this workspace' });
                return;
            }
            const note = await prisma.projectNote.create({
                data: {
                    content,
                    projectId,
                    workspaceId,
                    authorId: member.id
                },
                include: {
                    author: { include: { user: { select: { name: true, email: true } } } }
                }
            });
            // Parse mentions from content: @[Name](userId)
            const mentionRegex = /@\[.*?\]\((.*?)\)/g;
            const mentionedUserIds = new Set();
            let match;
            while ((match = mentionRegex.exec(content)) !== null) {
                const id = parseInt(match[1], 10);
                if (!isNaN(id) && id !== userId) {
                    mentionedUserIds.add(id);
                }
            }
            // Send notifications
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
            const memberUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
            for (const mentionedId of Array.from(mentionedUserIds)) {
                await NotificationService_1.NotificationService.create({
                    userId: mentionedId,
                    workspaceId,
                    type: 'MENTION',
                    title: 'You were mentioned',
                    body: `${memberUser?.name || memberUser?.email} mentioned you in a note on ${project?.name || 'a project'}.`,
                    link: `/dashboard/projects/${projectId}?highlightNote=${note.id}`
                });
            }
            res.status(201).json(note);
        }
        catch (error) {
            console.error('Error adding project note:', error);
            res.status(500).json({ error: 'Failed to add note' });
        }
    }
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=ProjectController.js.map