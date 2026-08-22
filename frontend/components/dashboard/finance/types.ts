export interface Client {
  id: number;
  name: string;
  company: string;
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: string;
}

export interface Invoice {
  id: number;
  invoiceNum: string;
  status: "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "VOID";
  issueDate: string;
  dueDate: string | null;
  client: Client;
  items: InvoiceItem[];
  createdAt: string;
}
