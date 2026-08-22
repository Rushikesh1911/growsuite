import { PrismaClient } from '../../generated/prisma';
import { SocketService } from '../socket';

const prisma = new PrismaClient();

interface CreateNotificationParams {
  userId: number;
  workspaceId: number;
  type: string;
  title: string;
  body?: string;
  link?: string;
}

export class NotificationService {
  /**
   * Centralized method to create in-app notifications.
   * Responsibilities:
   * - Create the Notification database record safely.
   * - Catch and log errors without crashing the caller.
   * - Maintain an integration point for future realtime features (e.g. Socket.io).
   * - Maintain an integration point for future user notification preferences.
   */
  static async create(params: CreateNotificationParams): Promise<boolean> {
    try {
      if (!params.userId || !params.workspaceId || !params.type || !params.title) {
        console.error('NotificationService: Missing required fields', params);
        return false;
      }

      const notification = await prisma.notification.create({
        data: {
          userId: params.userId,
          workspaceId: params.workspaceId,
          type: params.type,
          title: params.title,
          body: params.body || null,
          link: params.link || null,
          isRead: false,
        }
      });

      // Emit via realtime infrastructure (Socket.io) to the specific user
      SocketService.emitToUser(params.userId, 'new_notification', notification);

      // TODO (Future): Check user preferences before potentially sending an email
      // e.g. if (userPreferences.emailOnTaskAssigned) { EmailService.send(...) }

      return true;
    } catch (error) {
      console.error('NotificationService: Failed to create notification', error, params);
      // We return false rather than throwing so the main CRM operation (like a payment or task creation)
      // does not fail simply because notification delivery failed.
      return false;
    }
  }

  /**
   * Integration point for scheduled/background jobs for overdue invoices.
   * Do NOT call this directly from standard API requests as a request-time workaround.
   */
  static async processOverdueInvoices(workspaceId: number): Promise<void> {
    // TODO: Implement this when a background worker/cron infrastructure is added.
    // 1. Fetch invoices where dueDate < now() AND status !== 'PAID' AND status !== 'OVERDUE'
    // 2. Mark them as OVERDUE.
    // 3. Trigger NotificationService.create() with INVOICE_OVERDUE for each.
    console.warn(`processOverdueInvoices called for workspace ${workspaceId}, but background infrastructure is not yet implemented.`);
  }
}
