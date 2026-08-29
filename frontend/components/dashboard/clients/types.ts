export interface Client {
  id: number;
  name: string;
  company: string;
  email: string | null;
  phone: string | null;
  billingAddress: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  status?: string;
  projects?: { id: number }[];
  invoices?: { balanceDue: string | number; total: string | number }[];
}

export type SortField = "name" | "company" | "status" | "projects" | "outstanding" | "updatedAt";
export type SortOrder = "asc" | "desc";
