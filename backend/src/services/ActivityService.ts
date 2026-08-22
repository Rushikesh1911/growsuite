import { Prisma } from '../../generated/prisma';

interface CreateActivityParams {
  action: string;
  title: string;
  description?: string;
  metadata?: object;
  actorId: number;
  workspaceId: number;
  // Polymorphic IDs
  leadId?: number;
  dealId?: number;
  clientId?: number;
  projectId?: number;
  taskId?: number;
  invoiceId?: number;
  paymentId?: number;
}

export class ActivityService {
  /**
   * Generates the Prisma create object for an activity log.
   * Can be used inside a Prisma Transaction ($transaction) or standard query.
   */
  static generateLog(params: CreateActivityParams): Prisma.ActivityLogCreateInput {
    return {
      action: params.action,
      title: params.title,
      description: params.description || null,
      metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      workspace: { connect: { id: params.workspaceId } },
      actor: { connect: { id: params.actorId } },
      ...(params.leadId && { lead: { connect: { id: params.leadId } } }),
      ...(params.dealId && { deal: { connect: { id: params.dealId } } }),
      ...(params.clientId && { client: { connect: { id: params.clientId } } }),
      ...(params.projectId && { project: { connect: { id: params.projectId } } }),
      ...(params.taskId && { task: { connect: { id: params.taskId } } }),
      ...(params.invoiceId && { invoice: { connect: { id: params.invoiceId } } }),
      ...(params.paymentId && { payment: { connect: { id: params.paymentId } } }),
    };
  }
}
