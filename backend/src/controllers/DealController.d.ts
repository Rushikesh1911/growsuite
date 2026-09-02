import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class DealController {
    static getDeals(req: AuthRequest, res: Response): Promise<void>;
    static createDeal(req: AuthRequest, res: Response): Promise<void>;
    static updateDeal(req: AuthRequest, res: Response): Promise<void>;
    static convertDeal(req: AuthRequest, res: Response): Promise<void>;
    static addNote(req: AuthRequest, res: Response): Promise<void>;
    static addActivity(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=DealController.d.ts.map