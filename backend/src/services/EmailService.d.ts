export declare class EmailService {
    static sendVerificationEmail(toEmail: string, token: string): Promise<boolean>;
    static sendWorkspaceInvite(toEmail: string, workspaceName: string, inviterName: string, invitationId: string): Promise<boolean>;
    static sendNotificationEmail(toEmail: string, title: string, body: string): Promise<boolean>;
    static sendTaskAssignmentAlert(toEmail: string, taskTitle: string, assignerName: string, workspaceName: string): Promise<boolean>;
    static sendLeadOutreach(toEmail: string, subject: string, body: string, senderName: string, senderEmail: string): Promise<boolean>;
    static sendInvoiceEmail(toEmail: string, invoiceNumber: string, amount: string, dueDate: string, clientName: string, workspaceName: string): Promise<boolean>;
    static sendPasswordResetEmail(toEmail: string, token: string): Promise<boolean>;
}
//# sourceMappingURL=EmailService.d.ts.map