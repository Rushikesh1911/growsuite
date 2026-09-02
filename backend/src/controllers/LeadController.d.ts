import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class LeadController {
    static getLeads(req: AuthRequest, res: Response): Promise<void>;
    static getLeadById(req: AuthRequest, res: Response): Promise<void>;
    static createLead(req: AuthRequest, res: Response): Promise<void>;
    static createFromWeb(req: Request, res: Response): Promise<void>;
    static updateLead(req: AuthRequest, res: Response): Promise<void>;
    static convertToDeal(req: AuthRequest, res: Response): Promise<void>;
    static bulkArchive(req: AuthRequest, res: Response): Promise<void>;
    static sendEmail(req: AuthRequest, res: Response): Promise<void>;
    static addNote(req: AuthRequest, res: Response): Promise<void>;
    static importLeads(req: AuthRequest, res: Response): Promise<void>;
    static addActivity(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=LeadController.d.ts.map