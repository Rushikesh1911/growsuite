import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class InvoiceController {
    static getPublicInvoice(req: Request, res: Response): Promise<void>;
    static generatePublicPdf(req: Request, res: Response): Promise<void>;
    static generatePdf(req: AuthRequest, res: Response): Promise<void>;
    static getInvoices(req: AuthRequest, res: Response): Promise<void>;
    static getInvoice(req: AuthRequest, res: Response): Promise<void>;
    static createInvoice(req: AuthRequest, res: Response): Promise<void>;
    static updateInvoice(req: AuthRequest, res: Response): Promise<void>;
    static sendInvoice(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=InvoiceController.d.ts.map