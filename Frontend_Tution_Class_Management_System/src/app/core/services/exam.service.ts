import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BulkMarksRequest, ExamCreateRequest, ExamResponse, ExamResultResponse } from '../models/teacher-portal.models';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private readonly baseUrl = `${environment.apiBaseUrl}/teacher/exams`;

  constructor(private http: HttpClient) {
  }

  create(request: ExamCreateRequest): Observable<ExamResponse> {
    return this.http.post<ExamResponse>(this.baseUrl, request);
  }

  examsForClass(classId: number): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(`${this.baseUrl}/class/${classId}`);
  }

  saveResults(examId: number, request: BulkMarksRequest): Observable<ExamResultResponse[]> {
    return this.http.post<ExamResultResponse[]>(`${this.baseUrl}/${examId}/results`, request);
  }

  getResults(examId: number): Observable<ExamResultResponse[]> {
    return this.http.get<ExamResultResponse[]>(`${this.baseUrl}/${examId}/results`);
  }
}
