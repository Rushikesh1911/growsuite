import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ClientController {
    static getClients(req: AuthRequest, res: Response): Promise<void>;
    static getClient(req: AuthRequest, res: Response): Promise<void>;
    static createClient(req: AuthRequest, res: Response): Promise<void>;
    static updateClient(req: AuthRequest, res: Response): Promise<void>;
    static archiveClient(req: AuthRequest, res: Response): Promise<void>;
    static bulkArchiveClients(req: AuthRequest, res: Response): Promise<void>;
    static addNote(req: AuthRequest, res: Response): Promise<void>;
    static importClients(req: AuthRequest, res: Response): Promise<void>;
    static addActivity(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ClientController.d.ts.map