import { Router, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { EmailService } from '../services/EmailService';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

// Mark onboarding as complete and setup workspace
router.post('/setup', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspaceName, useCase, invitations } = req.body;
  const userId = req.user!.userId;

  try {
    // 1. Get the user's default owner workspace
    const member = await prisma.workspaceMember.findFirst({
      where: { userId, role: 'OWNER' },
      include: { workspace: true }
    });

    if (member) {
      // Update the workspace
      await prisma.workspace.update({
        where: { id: member.workspaceId },
        data: {
          name: workspaceName || member.workspace.name,
          useCase: useCase || null,
        }
      });

      // Handle invitations
      if (invitations && Array.isArray(invitations) && invitations.length > 0) {
        for (const email of invitations) {
          if (!email || typeof email !== 'string') continue;
          const invite = await prisma.workspaceInvitation.create({
            data: {
              email,
              workspaceId: member.workspaceId,
              inviterId: userId,
              role: 'MEMBER',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          });

          const user = await prisma.user.findUnique({ where: { id: userId } });
          EmailService.sendWorkspaceInvite(email, member.workspace.name, user?.name || "A colleague", invite.id).catch(console.error);
        }
      }
    }

    // 2. Mark user as having completed onboarding
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error during onboarding setup:', error);
    res.status(500).json({ error: 'Failed to complete setup' });
  }
});

// Get checklist progress
router.get('/checklist', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  try {
    const member = await prisma.workspaceMember.findFirst({
      where: { userId },
    });

    if (!member) {
      res.json({ hasLeads: false, hasDeals: false, hasTasks: false, hasInvites: false });
      return;
    }

    const workspaceId = member.workspaceId;

    const [leadsCount, dealsCount, tasksCount, invitesCount] = await Promise.all([
      prisma.lead.count({ where: { workspaceId } }),
      prisma.deal.count({ where: { workspaceId } }),
      prisma.task.count({ where: { workspaceId } }),
      prisma.workspaceInvitation.count({ where: { workspaceId, inviterId: userId } })
    ]);

    res.json({
      hasLeads: leadsCount > 0,
      hasDeals: dealsCount > 0,
      hasTasks: tasksCount > 0,
      hasInvites: invitesCount > 0
    });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

// Hide checklist permanently
router.post('/hide-checklist', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { hideOnboardingChecklist: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to hide checklist' });
  }
});

export default router;
