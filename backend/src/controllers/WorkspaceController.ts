import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EmailService } from '../services/EmailService';
import { NotificationService } from '../services/NotificationService';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class WorkspaceController {
  // Get current workspace and its members
  static async getCurrentWorkspace(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                }
              }
            },
            orderBy: { role: 'asc' } // OWNER, ADMIN, MEMBER
          }
        }
      });

      if (!workspace) {
        res.status(404).json({ error: 'Workspace not found' });
        return;
      }

      res.json(workspace);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      res.status(500).json({ error: 'Failed to fetch workspace settings' });
    }
  }

  // Create a new workspace
  static async createWorkspace(req: AuthRequest, res: Response) {
    try {
      const { name, currency, timezone, dateFormat } = req.body;
      const userId = req.user!.userId;

      if (!name) {
        res.status(400).json({ error: 'Workspace name is required' });
        return;
      }

      const workspace = await prisma.workspace.create({
        data: {
          name,
          currency: currency || 'INR',
          timezone: timezone || 'Asia/Kolkata',
          dateFormat: dateFormat || 'DD/MM/YYYY',
          members: {
            create: {
              userId,
              role: 'OWNER',
            }
          }
        }
      });

      res.status(201).json(workspace);
    } catch (error) {
      console.error('Error creating workspace:', error);
      res.status(500).json({ error: 'Failed to create workspace' });
    }
  }

  // Update a workspace
  static async updateWorkspace(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const userId = req.user!.userId;
      const { name, razorpayKeyId, razorpayKeySecret } = req.body;

      // Ensure user is OWNER or ADMIN
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          }
        }
      });

      if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
        res.status(403).json({ error: 'You do not have permission to update workspace settings' });
        return;
      }

      const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          name: name !== undefined ? name : undefined,
          razorpayKeyId: razorpayKeyId !== undefined ? razorpayKeyId : undefined,
          razorpayKeySecret: razorpayKeySecret !== undefined ? razorpayKeySecret : undefined,
        }
      });

      res.json(workspace);
    } catch (error) {
      console.error('Error updating workspace:', error);
      res.status(500).json({ error: 'Failed to update workspace' });
    }
  }

  // Delete a workspace
  static async deleteWorkspace(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const userId = req.user!.userId;

      // Ensure user is OWNER
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          }
        }
      });

      if (!membership || membership.role !== 'OWNER') {
        res.status(403).json({ error: 'Only workspace owners can delete workspaces' });
        return;
      }

      // Delete workspace (cascades to all CRM data)
      await prisma.workspace.delete({
        where: { id: workspaceId }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      res.status(500).json({ error: 'Failed to delete workspace' });
    }
  }

  // Invite a member to the workspace
  static async inviteMember(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const inviterId = req.user!.userId;
      const { email, role = 'MEMBER' } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required to invite a member' });
        return;
      }

      // Check if user has permission to invite (must be OWNER or ADMIN)
      const inviterMembership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: inviterId, workspaceId } },
        include: { user: true, workspace: true }
      });

      if (!inviterMembership || (inviterMembership.role !== 'OWNER' && inviterMembership.role !== 'ADMIN')) {
        res.status(403).json({ error: 'You do not have permission to invite members' });
        return;
      }

      // Check if user is already a member
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (targetUser) {
        const existingMembership = await prisma.workspaceMember.findUnique({
          where: { userId_workspaceId: { userId: targetUser.id, workspaceId } }
        });
        if (existingMembership) {
          res.status(400).json({ error: 'User is already a member of this workspace' });
          return;
        }
      }

      // Upsert the invitation (in case they were invited before but it's pending/expired)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const invitation = await prisma.workspaceInvitation.upsert({
        where: {
          email_workspaceId: { email, workspaceId }
        },
        update: {
          role,
          inviterId,
          status: 'PENDING',
          expiresAt
        },
        create: {
          email,
          workspaceId,
          role,
          inviterId,
          expiresAt
        }
      });

      // Send the beautiful email containing the token link
      await EmailService.sendWorkspaceInvite(
        email, 
        inviterMembership.workspace.name, 
        inviterMembership.user.name || 'A colleague',
        invitation.id
      );

      res.json({ message: 'Invitation sent successfully' });
    } catch (error) {
      console.error('Error inviting member:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  }

  // Get Invitation Details (Public route - only requires token)
  static async getInvitation(req: AuthRequest, res: Response) {
    try {
      const token = req.params.token as string;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: token },
        include: {
          workspace: { select: { name: true } },
          inviter: { select: { name: true, email: true } }
        }
      });

      if (!invitation) {
        res.status(404).json({ error: 'Invitation not found' });
        return;
      }

      if (invitation.status !== 'PENDING') {
        res.status(400).json({ error: `Invitation has already been ${invitation.status.toLowerCase()}` });
        return;
      }

      if (new Date() > invitation.expiresAt) {
        res.status(400).json({ error: 'Invitation has expired' });
        return;
      }

      res.json({
        email: invitation.email,
        workspaceName: invitation.workspace.name,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        role: invitation.role
      });
    } catch (error) {
      console.error('Error fetching invitation:', error);
      res.status(500).json({ error: 'Failed to fetch invitation details' });
    }
  }

  // Accept Invitation (Requires Auth)
  static async acceptInvitation(req: AuthRequest, res: Response) {
    try {
      const token = req.params.token as string;
      const userId = req.user!.userId;
      const userEmail = req.user!.email;

      const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: token }
      });

      if (!invitation || invitation.status !== 'PENDING') {
        res.status(400).json({ error: 'Invalid or expired invitation' });
        return;
      }

      // Security check: ensure the logged-in user's email matches the invite email
      if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
        res.status(403).json({ error: 'This invitation was sent to a different email address' });
        return;
      }

      // Add user to workspace in a transaction
      const newMember = await prisma.$transaction(async (tx) => {
        // 1. Mark invitation as accepted
        await tx.workspaceInvitation.update({
          where: { id: token },
          data: { status: 'ACCEPTED' }
        });

        // 2. Add user to workspace
        return await tx.workspaceMember.create({
          data: {
            userId,
            workspaceId: invitation.workspaceId,
            role: invitation.role,
          },
          include: {
            workspace: true,
            user: true
          }
        });
      });

      // Notify owners and admins
      const admins = await prisma.workspaceMember.findMany({
        where: { 
          workspaceId: invitation.workspaceId, 
          role: { in: ['OWNER', 'ADMIN'] } 
        }
      });
      for (const admin of admins) {
        if (admin.userId === userId) continue;
        await NotificationService.create({
          userId: admin.userId,
          workspaceId: invitation.workspaceId,
          type: 'MEMBER_JOINED',
          title: 'New workspace member',
          body: `${newMember.user.name || newMember.user.email} joined ${newMember.workspace.name}.`,
          link: '/dashboard/settings' // or wherever members are listed
        });
      }

      res.json({ message: 'Successfully joined workspace' });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      res.status(500).json({ error: 'Failed to accept invitation' });
    }
  }

  // Decline Invitation (Requires Auth)
  static async declineInvitation(req: AuthRequest, res: Response) {
    try {
      const token = req.params.token as string;
      const userEmail = req.user!.email;

      const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: token }
      });

      if (!invitation || invitation.status !== 'PENDING') {
        res.status(400).json({ error: 'Invalid or expired invitation' });
        return;
      }

      if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
        res.status(403).json({ error: 'This invitation was sent to a different email address' });
        return;
      }

      await prisma.workspaceInvitation.update({
        where: { id: token },
        data: { status: 'DECLINED' }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error declining invitation:', error);
      res.status(500).json({ error: 'Failed to decline invitation' });
    }
  }
}
