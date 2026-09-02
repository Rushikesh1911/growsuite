"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class ActivityController {
    // Get activity feed for the workspace
    static async getFeed(req, res) {
        try {
            const workspaceId = req.workspaceId;
            const limit = parseInt(req.query.limit) || 50;
            const activities = await prisma.activityLog.findMany({
                where: {
                    workspaceId,
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    actor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    lead: { select: { id: true, contactName: true, company: true } },
                    client: { select: { id: true, name: true, company: true } },
                    project: { select: { id: true, name: true } },
                    task: { select: { id: true, title: true } },
                    invoice: { select: { id: true, invoiceNumber: true } }
                }
            });
            res.json(activities);
        }
        catch (error) {
            console.error('Error fetching activity feed:', error);
            res.status(500).json({ error: 'Failed to fetch activity feed' });
        }
    }
}
exports.ActivityController = ActivityController;
//# sourceMappingURL=ActivityController.js.map