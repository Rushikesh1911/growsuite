import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class CustomFieldController {
    static getFields(req: AuthRequest, res: Response): Promise<void>;
    static createField(req: AuthRequest, res: Response): Promise<void>;
    static updateField(req: AuthRequest, res: Response): Promise<void>;
    static deleteField(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=CustomFieldController.d.ts.map