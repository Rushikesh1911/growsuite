import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
    workspaceId?: number;
    params: any;
    body: any;
}
export declare class AutomationController {
    static getAutomations(req: AuthRequest, res: Response): Promise<void>;
    static getAutomation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createAutomation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateAutomation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteAutomation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
//# sourceMappingURL=AutomationController.d.ts.map