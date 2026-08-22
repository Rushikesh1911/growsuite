export interface Deal {
  id: number;
  title: string;
  company: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  stage: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
  estimatedValue: string; // Decimal serialized as string
  probability?: number | null;
  expectedClose?: string | null;
  tasks?: { id: number; title: string; status: string; dueDate: string | null }[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  convertedToClientId: number | null;
  workspaceId: number | null;
}
