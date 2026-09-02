interface CreateNotificationParams {
    userId: number;
    workspaceId: number;
    type: string;
    title: string;
    body?: string;
    link?: string;
}
export declare class NotificationService {
    /**
     * Centralized method to create in-app notifications.
     * Responsibilities:
     * - Create the Notification database record safely.
     * - Catch and log errors without crashing the caller.
     * - Maintain an integration point for future realtime features (e.g. Socket.io).
     * - Maintain an integration point for future user notification preferences.
     */
    static create(params: CreateNotificationParams): Promise<boolean>;
    /**
     * Integration point for scheduled/background jobs for overdue invoices.
     * Do NOT call this directly from standard API requests as a request-time workaround.
     */
    static processOverdueInvoices(workspaceId: number): Promise<void>;
}
export {};
//# sourceMappingURL=NotificationService.d.ts.map