export type FeeInvoiceStatus = 'DUE' | 'PARTIAL' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER';

export interface GenerateInvoicesRequest {
  classId: number;
  period: string;
  dueDate: string;
}

export interface FeeInvoiceResponse {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  subject: string;
  period: string;
  amountDue: number;
  amountPaid: number;
  status: FeeInvoiceStatus;
  dueDate: string;
}

export interface PaymentCreateRequest {
  invoiceId: number;
  amountPaid: number;
  paymentDate: string;
  method: PaymentMethod;
}

export interface PaymentResponse {
  id: number;
  invoiceId: number;
  amountPaid: number;
  paymentDate: string;
  method: PaymentMethod;
  receivedByUsername: string;
  receiptNumber: string;
}
