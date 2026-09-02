import { Request, Response } from 'express';
export declare class RazorpayController {
    /**
     * Initialize a Razorpay Order for a specific invoice
     */
    static createOrder(req: Request, res: Response): Promise<void>;
    /**
     * Verify the payment signature and mark invoice as PAID
     */
    static verifyPayment(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=RazorpayController.d.ts.map