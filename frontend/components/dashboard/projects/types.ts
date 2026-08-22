export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  createdAt: string;
  projectId?: number | null;
  assigneeId?: number | null;
  attachments?: { id: number; fileName: string; fileUrl: string; size: number }[];
}

export interface Client {
  id: number;
  name: string;
  company: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  client: Client;
  tasks: Task[];
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}
