import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class PaymentController {
    static createPayment(req: AuthRequest, res: Response): Promise<void>;
    static getPayments(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=PaymentController.d.ts.map