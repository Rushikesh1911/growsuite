import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class NotificationController {
    static getNotifications(req: AuthRequest, res: Response): Promise<void>;
    static markAsRead(req: AuthRequest, res: Response): Promise<void>;
    static markAllAsRead(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=NotificationController.d.ts.map