import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const requireWorkspaceAccess: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=workspaceAuth.d.ts.map