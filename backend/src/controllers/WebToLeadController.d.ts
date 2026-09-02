import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class WebToLeadController {
    static getForms(req: AuthRequest, res: Response): Promise<void>;
    static createForm(req: AuthRequest, res: Response): Promise<void>;
    static updateForm(req: AuthRequest, res: Response): Promise<void>;
    static deleteForm(req: AuthRequest, res: Response): Promise<void>;
    static getPublicFormConfig(req: Request, res: Response): Promise<void>;
    static submitForm(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=WebToLeadController.d.ts.map