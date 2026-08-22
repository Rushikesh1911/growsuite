import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const requireWorkspaceAccess = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const workspaceIdStr = req.headers['x-workspace-id'] || req.query.workspaceId || req.body?.workspaceId;
  const workspaceId = parseInt(workspaceIdStr as string, 10);
  
  if (!workspaceId || isNaN(workspaceId)) {
    res.status(400).json({ error: 'Bad Request: workspaceId is required in headers (x-workspace-id), query, or body' });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.userId,
          workspaceId: workspaceId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this workspace' });
      return;
    }

    // Attach verified workspace to request
    req.workspaceId = workspaceId;
    next();
  } catch (error) {
    console.error('Workspace auth error:', error);
    res.status(500).json({ error: 'Internal Server Error during authorization' });
  }
};
