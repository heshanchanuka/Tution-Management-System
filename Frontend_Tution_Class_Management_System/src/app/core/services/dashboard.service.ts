import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminStatsResponse,
  AttendanceSummaryResponse,
  ExamPerformancePoint,
  ParentStatsResponse,
  RevenueReportPoint,
  TeacherStatsResponse
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
  }

  adminStats(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(`${this.apiBaseUrl}/admin/dashboard/stats`);
  }

  teacherStats(): Observable<TeacherStatsResponse> {
    return this.http.get<TeacherStatsResponse>(`${this.apiBaseUrl}/teacher/dashboard/stats`);
  }

  parentStats(): Observable<ParentStatsResponse> {
    return this.http.get<ParentStatsResponse>(`${this.apiBaseUrl}/parent/dashboard/stats`);
  }

  revenueReport(months = 6): Observable<RevenueReportPoint[]> {
    return this.http.get<RevenueReportPoint[]>(`${this.apiBaseUrl}/admin/reports/revenue`, {
      params: { months }
    });
  }

  attendanceSummary(): Observable<AttendanceSummaryResponse> {
    return this.http.get<AttendanceSummaryResponse>(`${this.apiBaseUrl}/admin/reports/attendance-summary`);
  }

  examPerformance(): Observable<ExamPerformancePoint[]> {
    return this.http.get<ExamPerformancePoint[]>(`${this.apiBaseUrl}/admin/reports/exam-performance`);
  }
}
