import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class BillingController {
    static getBillingState(req: AuthRequest, res: Response): Promise<void>;
    static createCheckout(req: AuthRequest, res: Response): Promise<void>;
    static handleWebhook(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=BillingController.d.ts.map