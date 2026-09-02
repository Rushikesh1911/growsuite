"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class NotificationController {
    // Get all notifications for the current user in the active workspace
    static async getNotifications(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const userId = req.user.userId;
            const notifications = await prisma.notification.findMany({
                where: {
                    workspaceId,
                    userId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 50,
            });
            // Also return the count of unread notifications
            const unreadCount = await prisma.notification.count({
                where: {
                    workspaceId,
                    userId,
                    isRead: false,
                }
            });
            res.json({
                notifications,
                unreadCount
            });
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    }
    // Mark a specific notification as read
    static async markAsRead(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const userId = req.user.userId;
            const notificationId = parseInt(req.params.id, 10);
            // Verify ownership
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId }
            });
            if (!notification || notification.userId !== userId || notification.workspaceId !== workspaceId) {
                res.status(404).json({ error: 'Notification not found' });
                return;
            }
            const updated = await prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true }
            });
            res.json(updated);
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    }
    // Mark all notifications as read
    static async markAllAsRead(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const userId = req.user.userId;
            await prisma.notification.updateMany({
                where: {
                    workspaceId,
                    userId,
                    isRead: false,
                },
                data: { isRead: true }
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ error: 'Failed to mark all notifications as read' });
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=NotificationController.js.map