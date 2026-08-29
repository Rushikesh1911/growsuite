"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if we have a token and workspaceId
    const token = typeof window !== "undefined" ? localStorage.getItem("growsuite_token") : null;
    const workspaceId = typeof window !== "undefined" ? localStorage.getItem("growsuite_workspace_id") : null;

    if (!token || !workspaceId) {
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const socketInstance = io(API_URL, {
      auth: { token },
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      // Join the workspace room upon connecting
      socketInstance.emit("join_workspace", parseInt(workspaceId, 10));
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      // Use warn instead of error to prevent Next.js from throwing a full-screen dev overlay during normal backend restarts
      console.warn("Socket connect error:", err.message);
    });

    setSocket(socketInstance);

    // Cleanup on unmount or token change
    return () => {
      if (workspaceId) {
        socketInstance.emit("leave_workspace", parseInt(workspaceId, 10));
      }
      socketInstance.disconnect();
    };
  }, []);

  // Listen to custom events to re-trigger socket initialization
  // For example, if a user switches workspaces, we can trigger an event that forces a re-render/re-connect
  useEffect(() => {
    const handleWorkspaceChange = () => {
      if (socket) {
        const workspaceId = localStorage.getItem("growsuite_workspace_id");
        if (workspaceId) {
          socket.emit("join_workspace", parseInt(workspaceId, 10));
        }
      }
    };
    
    window.addEventListener("workspaceUpdated", handleWorkspaceChange);
    return () => window.removeEventListener("workspaceUpdated", handleWorkspaceChange);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
