import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
export declare class SocketService {
    private static io;
    static init(server: HttpServer): void;
    static getIO(): Server;
    static emitToWorkspace(workspaceId: number, event: string, data: any): void;
    static emitToUser(userId: number, event: string, data: any): void;
}
//# sourceMappingURL=socket.d.ts.map