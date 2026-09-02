import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class WorkspaceController {
    static getCurrentWorkspace(req: AuthRequest, res: Response): Promise<void>;
    static createWorkspace(req: AuthRequest, res: Response): Promise<void>;
    static updateWorkspace(req: AuthRequest, res: Response): Promise<void>;
    static deleteWorkspace(req: AuthRequest, res: Response): Promise<void>;
    static inviteMember(req: AuthRequest, res: Response): Promise<void>;
    static getInvitation(req: AuthRequest, res: Response): Promise<void>;
    static acceptInvitation(req: AuthRequest, res: Response): Promise<void>;
    static declineInvitation(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=WorkspaceController.d.ts.map