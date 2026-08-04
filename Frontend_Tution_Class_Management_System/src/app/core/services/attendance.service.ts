import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendanceResponse, MarkAttendanceRequest, UpdateAttendanceStatusRequest } from '../models/teacher-portal.models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private readonly baseUrl = `${environment.apiBaseUrl}/teacher/attendance`;

  constructor(private http: HttpClient) {
  }

  mark(classId: number, request: MarkAttendanceRequest): Observable<AttendanceResponse[]> {
    return this.http.post<AttendanceResponse[]>(`${this.baseUrl}/class/${classId}`, request);
  }

  getSession(classId: number, date: string): Observable<AttendanceResponse[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AttendanceResponse[]>(`${this.baseUrl}/class/${classId}`, { params });
  }

  getHistory(classId: number, from: string, to: string): Observable<AttendanceResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AttendanceResponse[]>(`${this.baseUrl}/class/${classId}/history`, { params });
  }

  updateStatus(id: number, request: UpdateAttendanceStatusRequest): Observable<AttendanceResponse> {
    return this.http.put<AttendanceResponse>(`${this.baseUrl}/${id}`, request);
  }
}
