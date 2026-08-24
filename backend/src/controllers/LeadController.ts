import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient, LeadStatus } from '../../generated/prisma';
import { ActivityService } from '../services/ActivityService';
import { EmailService } from '../services/EmailService';
import { NotificationService } from '../services/NotificationService';
import { SocketService } from '../socket';

const prisma = new PrismaClient();

export class LeadController {
  // Get all active leads for the workspace
  static async getLeads(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const leads = await prisma.lead.findMany({
        where: {
          workspaceId,
          archivedAt: null,
          convertedDealId: null, // optionally filter out converted ones
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  }

  // Get a single lead by ID with details
  static async getLeadById(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const leadId = parseInt(req.params.id as string, 10);

      if (isNaN(leadId)) {
        res.status(400).json({ error: 'Invalid Lead ID' });
        return;
      }

      const lead = await prisma.lead.findUnique({
        where: { id: leadId, workspaceId },
        include: {
          assignee: {
            include: { user: true }
          },
          activities: {
            orderBy: { createdAt: 'desc' }
          },
          emails: {
            orderBy: { sentAt: 'desc' }
          },
          leadNotes: {
            include: { author: { include: { user: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      res.json(lead);
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({ error: 'Failed to fetch lead' });
    }
  }

  // Create a new top-of-funnel lead
  static async createLead(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const { contactName, company, email, phone, source, notes, assigneeId } = req.body;

      if (!contactName) {
        res.status(400).json({ error: 'Contact Name is required' });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: {
            contactName,
            company,
            email,
            phone,
            source,
            notes,
            workspaceId,
            assigneeId: assigneeId ? parseInt(assigneeId, 10) : null,
          },
        });

        await tx.activityLog.create({
          data: ActivityService.generateLog({
            action: 'LEAD_CREATED',
            title: 'New Lead Added',
            description: `${contactName} ${company ? `from ${company}` : ''}`,
            actorId,
            workspaceId,
            leadId: lead.id,
          }),
        });

        return lead;
      });

      if (result.assigneeId) {
        const membership = await prisma.workspaceMember.findUnique({
          where: { id: result.assigneeId },
        });
        if (membership && membership.userId !== actorId) {
          await NotificationService.create({
            userId: membership.userId,
            workspaceId,
            type: 'LEAD_ASSIGNED',
            title: 'New lead assigned',
            body: `${result.contactName} has been assigned to you.`,
            link: `/dashboard/leads/${result.id}`
          });
        }
      }

      SocketService.emitToWorkspace(workspaceId, 'lead_created', result);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({ error: 'Failed to create lead' });
    }
  }

  // Public endpoint for Web-to-Lead Forms
  static async createFromWeb(req: Request, res: Response) {
    try {
      const { contactName, email, phone, company, source, token, redirectUrl } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Missing form token' });
        return;
      }

      // Decode the Base64 token to get the workspace ID
      let workspaceId: number;
      try {
        const decoded = Buffer.from(token as string, 'base64').toString('utf-8');
        workspaceId = parseInt(decoded, 10);
        if (isNaN(workspaceId)) throw new Error('Invalid token');
      } catch (e) {
        res.status(400).json({ error: 'Invalid form token' });
        return;
      }

      // Ensure workspace exists
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (!workspace) {
        res.status(404).json({ error: 'Workspace not found' });
        return;
      }

      if (!contactName || contactName.trim().length === 0) {
        res.status(400).json({ error: 'Contact name is required' });
        return;
      }

      const lead = await prisma.lead.create({
        data: {
          workspaceId,
          contactName,
          email,
          phone,
          company,
          source: source || 'Website',
          status: 'NEW'
        }
      });

      // Emit socket event to the workspace
      SocketService.emitToWorkspace(workspaceId, 'lead_created', lead);

      // If redirectUrl is provided, redirect the user (useful for HTML form submissions)
      if (redirectUrl) {
        res.redirect(302, redirectUrl as string);
        return;
      }

      res.status(201).json({ success: true, message: 'Lead created successfully' });
    } catch (error) {
      console.error('Error creating web-to-lead:', error);
      res.status(500).json({ error: 'Failed to process web-to-lead submission' });
    }
  }

  // Update an existing lead
  static async updateLead(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const leadId = parseInt(req.params.id as string, 10);
      const { contactName, company, email, phone, source, status, notes, archivedAt, assigneeId } = req.body;

      if (isNaN(leadId)) {
        res.status(400).json({ error: 'Invalid Lead ID' });
        return;
      }

      const existingLead = await prisma.lead.findUnique({ where: { id: leadId, workspaceId } });
      if (!existingLead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      const updateData: any = {};
      if (contactName !== undefined) updateData.contactName = contactName;
      if (company !== undefined) updateData.company = company;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (source !== undefined) updateData.source = source;
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (archivedAt !== undefined) updateData.archivedAt = archivedAt ? new Date(archivedAt) : null;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId ? parseInt(assigneeId, 10) : null;

      const lead = await prisma.lead.update({
        where: { id: leadId, workspaceId },
        data: updateData,
      });

      if (status) {
        await prisma.activityLog.create({
          data: ActivityService.generateLog({
            action: 'LEAD_STATUS_UPDATED',
            title: 'Lead Status Updated',
            description: `Moved to ${status}`,
            actorId,
            workspaceId,
            leadId: lead.id,
          }),
        });
      }

      // Handle assignment notifications
      if (assigneeId !== undefined && updateData.assigneeId !== existingLead.assigneeId && updateData.assigneeId !== null) {
        const membership = await prisma.workspaceMember.findUnique({
          where: { id: updateData.assigneeId }
        });
        
        if (membership && membership.userId !== actorId) {
          await NotificationService.create({
            userId: membership.userId,
            workspaceId,
            type: 'LEAD_ASSIGNED',
            title: 'New lead assigned',
            body: `${lead.contactName} has been assigned to you.`,
            link: `/dashboard/leads/${lead.id}`
          });
        }
      }

      SocketService.emitToWorkspace(workspaceId, 'lead_updated', lead);

      res.json(lead);
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({ error: 'Failed to update lead' });
    }
  }

  // Convert Lead to Deal
  static async convertToDeal(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const leadId = parseInt(req.params.id as string, 10);
      const { title, estimatedValue } = req.body;

      if (isNaN(leadId)) {
        res.status(400).json({ error: 'Invalid Lead ID' });
        return;
      }

      const lead = await prisma.lead.findUnique({ where: { id: leadId, workspaceId } });
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }
      if (lead.convertedDealId) {
        res.status(400).json({ error: 'Lead is already converted to a Deal' });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        // Create Deal
        const deal = await tx.deal.create({
          data: {
            title,
            estimatedValue: estimatedValue || 0,
            contactName: lead.contactName,
            company: lead.company,
            contactEmail: lead.email,
            contactPhone: lead.phone,
            workspaceId,
            stage: 'NEW',
          },
        });

        // Update Lead
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            convertedAt: new Date(),
            convertedDealId: deal.id,
          },
        });

        // Log Activities
        await tx.activityLog.create({
          data: ActivityService.generateLog({
            action: 'LEAD_CONVERTED',
            title: 'Lead Converted to Deal',
            description: `Converted to deal: ${deal.title}`,
            actorId,
            workspaceId,
            leadId: lead.id,
          }),
        });

        await tx.activityLog.create({
          data: ActivityService.generateLog({
            action: 'DEAL_CREATED_FROM_LEAD',
            title: 'Deal Created',
            description: `Generated from lead: ${lead.contactName}`,
            actorId,
            workspaceId,
            dealId: deal.id,
          }),
        });

        return deal;
      });

      // Notify workspace Owners & Admins about the new deal
      const admins = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          role: { in: ['OWNER', 'ADMIN'] }
        }
      });
      for (const admin of admins) {
        if (admin.userId === actorId) continue;
        await NotificationService.create({
          userId: admin.userId,
          workspaceId,
          type: 'DEAL_CREATED',
          title: 'Lead Converted',
          body: `${lead.contactName} was converted into a Deal.`,
          link: `/dashboard/pipeline`
        });
      }

      SocketService.emitToWorkspace(workspaceId, 'deal_created', result);
      // Also emit a lead_updated event so the lead list removes the converted lead
      const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } });
      SocketService.emitToWorkspace(workspaceId, 'lead_updated', updatedLead);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error converting lead to deal:', error);
      res.status(500).json({ error: 'Failed to convert lead' });
    }
  }

  // Bulk Archive Leads
  static async bulkArchive(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: 'Invalid or missing array of IDs' });
        return;
      }

      // Verify all leads belong to this workspace
      const leads = await prisma.lead.findMany({
        where: {
          id: { in: ids },
          workspaceId: workspaceId
        }
      });

      if (leads.length !== ids.length) {
        res.status(403).json({ error: 'Not authorized to modify one or more selected leads' });
        return;
      }

      await prisma.lead.updateMany({
        where: { id: { in: ids } },
        data: { archivedAt: new Date() }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error bulk archiving leads:', error);
      res.status(500).json({ error: 'Failed to bulk archive leads' });
    }
  }

  // Send an email directly to a lead
  static async sendEmail(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const actorId = req.user!.userId;
      const leadId = parseInt(req.params.id as string, 10);
      const { subject, body } = req.body;

      if (isNaN(leadId)) {
        res.status(400).json({ error: 'Valid leadId is required' });
        return;
      }

      if (!subject || !body) {
        res.status(400).json({ error: 'Subject and body are required' });
        return;
      }

      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead || lead.workspaceId !== workspaceId) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      if (!lead.email) {
        res.status(400).json({ error: 'Lead does not have an email address' });
        return;
      }

      const sender = await prisma.user.findUnique({ where: { id: actorId } });
      if (!sender) {
        res.status(404).json({ error: 'Sender not found' });
        return;
      }

      const senderName = sender.name || sender.email.split('@')[0];
      
      let finalBody = body;
      if (sender.emailSignature) {
        finalBody += `\n\n${sender.emailSignature}`;
      } else {
        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
        finalBody += `\n\nRegards,\n${senderName}\n${workspace?.name || 'GrowSuite'}`;
      }

      // 1. Create PENDING EmailMessage record
      const emailMsg = await prisma.emailMessage.create({
        data: {
          workspaceId,
          senderId: actorId,
          leadId,
          toEmail: lead.email,
          subject,
          body: finalBody,
          status: 'PENDING'
        }
      });

      // 2. Attempt to send email
      const success = await EmailService.sendLeadOutreach(
        lead.email,
        subject,
        finalBody,
        senderName || 'GrowSuite User',
        sender.email
      );

      if (success) {
        // 3. Update status to SENT
        await prisma.emailMessage.update({
          where: { id: emailMsg.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });

        res.json({ success: true, messageId: emailMsg.id });
      } else {
        // 3. Update status to FAILED
        await prisma.emailMessage.update({
          where: { id: emailMsg.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            error: 'SMTP Gateway Rejected'
          }
        });

        res.status(500).json({ error: 'Failed to send email via SMTP' });
      }

    } catch (error: any) {
      console.error('Error sending lead email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  }

  // Add a note to a lead
  static async addNote(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const leadId = parseInt(req.params.id as string);
      const { content } = req.body;
      const userId = (req.user as any)?.userId;

      if (!content || !userId) {
        res.status(400).json({ error: 'Content and user are required' });
        return;
      }

      // Find the workspace member for the current user
      const member = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } }
      });

      if (!member) {
        res.status(403).json({ error: 'Not authorized in this workspace' });
        return;
      }

      const note = await prisma.leadNote.create({
        data: {
          content,
          leadId,
          authorId: member.id,
          workspaceId
        },
        include: {
          author: {
            include: { user: true }
          }
        }
      });

      // Record Activity
      await ActivityService.logActivity({
        workspaceId,
        actorId: userId,
        action: 'LEAD_NOTE_ADDED',
        title: 'Added a note',
        description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        leadId
      });

      // Fetch the updated lead to emit
      const updatedLead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { assignee: { include: { user: true } } }
      });

      res.status(201).json(note);
      SocketService.emitToWorkspace(workspaceId, 'lead_updated', updatedLead);
    } catch (error) {
      console.error('Error adding lead note:', error);
      res.status(500).json({ error: 'Failed to add note' });
    }
  }

  // Bulk import leads
  static async importLeads(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const userId = (req.user as any)?.userId;
      const { leads } = req.body;

      if (!leads || !Array.isArray(leads) || leads.length === 0) {
        res.status(400).json({ error: 'No leads provided' });
        return;
      }

      const formattedLeads = leads.map((lead: any) => ({
        workspaceId,
        contactName: lead.contactName || lead.Name || 'Unknown',
        company: lead.company || lead.Company || null,
        email: lead.email || lead.Email || null,
        phone: lead.phone || lead.Phone || null,
        status: LeadStatus.NEW,
      }));

      const result = await prisma.lead.createMany({
        data: formattedLeads,
        skipDuplicates: true, // Will skip if we had unique constraints, but right now we don't.
      });

      // Record Activity
      await ActivityService.logActivity({
        workspaceId,
        actorId: userId,
        action: 'LEAD_IMPORTED',
        title: 'Imported Leads',
        description: `Imported ${result.count} leads via CSV`,
      });

      res.status(200).json({ success: true, count: result.count });
    } catch (error) {
      console.error('Error importing leads:', error);
      res.status(500).json({ error: 'Failed to import leads' });
    }
  }
}
