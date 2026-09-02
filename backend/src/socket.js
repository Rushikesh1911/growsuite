"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
class SocketService {
    static io;
    static init(server) {
        SocketService.io = new socket_io_1.Server(server, {
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
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                socket.user = decoded;
                next();
            }
            catch (err) {
                return next(new Error('Authentication error'));
            }
        });
        SocketService.io.on('connection', (socket) => {
            const userId = socket.user?.userId;
            console.log(`User connected: ${userId} (Socket: ${socket.id})`);
            if (userId) {
                // Automatically join a user-specific room for direct notifications
                socket.join(`user_${userId}`);
            }
            socket.on('join_workspace', (workspaceId) => {
                if (!workspaceId)
                    return;
                const roomName = `workspace_${workspaceId}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined room ${roomName}`);
            });
            socket.on('leave_workspace', (workspaceId) => {
                if (!workspaceId)
                    return;
                const roomName = `workspace_${workspaceId}`;
                socket.leave(roomName);
                console.log(`Socket ${socket.id} left room ${roomName}`);
            });
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.user?.userId} (Socket: ${socket.id})`);
            });
        });
    }
    static getIO() {
        if (!SocketService.io) {
            throw new Error('Socket.io not initialized!');
        }
        return SocketService.io;
    }
    static emitToWorkspace(workspaceId, event, data) {
        if (SocketService.io) {
            SocketService.io.to(`workspace_${workspaceId}`).emit(event, data);
        }
    }
    static emitToUser(userId, event, data) {
        if (SocketService.io) {
            SocketService.io.to(`user_${userId}`).emit(event, data);
        }
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socket.js.map