import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class TaskController {
    static getAllTasks(req: AuthRequest, res: Response): Promise<void>;
    static createTask(req: AuthRequest, res: Response): Promise<void>;
    static updateTask(req: AuthRequest, res: Response): Promise<void>;
    static deleteTask(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=TaskController.d.ts.map