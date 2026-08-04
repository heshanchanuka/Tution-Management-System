import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/admin.models';
import {
  FeeInvoiceResponse,
  GenerateInvoicesRequest,
  PaymentCreateRequest,
  PaymentResponse
} from '../models/fee.models';

@Injectable({
  providedIn: 'root'
})
export class FeeService {

  private readonly baseUrl = `${environment.apiBaseUrl}/admin/fees`;

  constructor(private http: HttpClient) {
  }

  generateInvoices(request: GenerateInvoicesRequest): Observable<FeeInvoiceResponse[]> {
    return this.http.post<FeeInvoiceResponse[]>(`${this.baseUrl}/invoices`, request);
  }

  invoicesForStudent(studentId: number, page: number, size: number): Observable<PageResponse<FeeInvoiceResponse>> {
    return this.http.get<PageResponse<FeeInvoiceResponse>>(`${this.baseUrl}/invoices/student/${studentId}`, {
      params: { page, size }
    });
  }

  overdueInvoices(page: number, size: number): Observable<PageResponse<FeeInvoiceResponse>> {
    return this.http.get<PageResponse<FeeInvoiceResponse>>(`${this.baseUrl}/invoices/overdue`, {
      params: { page, size }
    });
  }

  recordPayment(request: PaymentCreateRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/payments`, request);
  }

  paymentsForInvoice(invoiceId: number): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.baseUrl}/payments/invoice/${invoiceId}`);
  }

  downloadReceipt(paymentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/receipts/${paymentId}`, { responseType: 'blob' });
  }
}
