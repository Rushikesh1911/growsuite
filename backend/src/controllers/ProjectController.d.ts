import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ProjectController {
    static getProjects(req: AuthRequest, res: Response): Promise<void>;
    static getProjectById(req: AuthRequest, res: Response): Promise<void>;
    static createProject(req: AuthRequest, res: Response): Promise<void>;
    static createTask(req: AuthRequest, res: Response): Promise<void>;
    static updateProject(req: AuthRequest, res: Response): Promise<void>;
    static deleteProject(req: AuthRequest, res: Response): Promise<void>;
    static archiveProject(req: AuthRequest, res: Response): Promise<void>;
    static unarchiveProject(req: AuthRequest, res: Response): Promise<void>;
    static getProjectTasks(req: AuthRequest, res: Response): Promise<void>;
    static addNote(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ProjectController.d.ts.map