import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentResponse } from '../models/admin.models';
import { AttendanceResponse } from '../models/teacher-portal.models';
import { FeeInvoiceResponse, PaymentResponse } from '../models/fee.models';
import { StudentResultResponse } from '../models/parent-portal.models';

@Injectable({
  providedIn: 'root'
})
export class ParentPortalService {

  private readonly baseUrl = `${environment.apiBaseUrl}/parent`;

  constructor(private http: HttpClient) {
  }

  myChildren(): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.baseUrl}/children`);
  }

  getChild(studentId: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.baseUrl}/children/${studentId}`);
  }

  attendance(studentId: number, from: string, to: string): Observable<AttendanceResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AttendanceResponse[]>(`${this.baseUrl}/children/${studentId}/attendance`, { params });
  }

  fees(studentId: number): Observable<FeeInvoiceResponse[]> {
    return this.http.get<FeeInvoiceResponse[]>(`${this.baseUrl}/children/${studentId}/fees`);
  }

  paymentsForInvoice(studentId: number, invoiceId: number): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.baseUrl}/children/${studentId}/fees/${invoiceId}/payments`);
  }

  results(studentId: number): Observable<StudentResultResponse[]> {
    return this.http.get<StudentResultResponse[]>(`${this.baseUrl}/children/${studentId}/results`);
  }

  downloadReportCard(studentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/children/${studentId}/report-card`, { responseType: 'blob' });
  }

  downloadReceipt(paymentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/receipts/${paymentId}`, { responseType: 'blob' });
  }
}
