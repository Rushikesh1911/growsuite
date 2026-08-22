import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export class SocketService {
  private static io: Server;

  static init(server: HttpServer): void {
    SocketService.io = new Server(server, {
      cors: {
        origin: '*', // Adjust to specific origin in production
        methods: ['GET', 'POST']
      }
    });

    SocketService.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
        (socket as any).user = decoded;
        next();
      } catch (err) {
        return next(new Error('Authentication error'));
      }
    });

    SocketService.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).user?.userId;
      console.log(`User connected: ${userId} (Socket: ${socket.id})`);

      if (userId) {
        // Automatically join a user-specific room for direct notifications
        socket.join(`user_${userId}`);
      }

      socket.on('join_workspace', (workspaceId: number) => {
        if (!workspaceId) return;
        const roomName = `workspace_${workspaceId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room ${roomName}`);
      });

      socket.on('leave_workspace', (workspaceId: number) => {
        if (!workspaceId) return;
        const roomName = `workspace_${workspaceId}`;
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left room ${roomName}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${(socket as any).user?.userId} (Socket: ${socket.id})`);
      });
    });
  }

  static getIO(): Server {
    if (!SocketService.io) {
      throw new Error('Socket.io not initialized!');
    }
    return SocketService.io;
  }

  static emitToWorkspace(workspaceId: number, event: string, data: any): void {
    if (SocketService.io) {
      SocketService.io.to(`workspace_${workspaceId}`).emit(event, data);
    }
  }

  static emitToUser(userId: number, event: string, data: any): void {
    if (SocketService.io) {
      SocketService.io.to(`user_${userId}`).emit(event, data);
    }
  }
}
