import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassRequest, ClassResponse, PageResponse, StudentResponse } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  private readonly baseUrl = `${environment.apiBaseUrl}/admin/classes`;

  constructor(private http: HttpClient) {
  }

  list(page: number, size: number, search?: string): Observable<PageResponse<ClassResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PageResponse<ClassResponse>>(this.baseUrl, { params });
  }

  /** Convenience: fetch every class in one page, for populating dropdowns. */
  listAll(): Observable<PageResponse<ClassResponse>> {
    return this.list(0, 200);
  }

  get(id: number): Observable<ClassResponse> {
    return this.http.get<ClassResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: ClassRequest): Observable<ClassResponse> {
    return this.http.post<ClassResponse>(this.baseUrl, request);
  }

  update(id: number, request: ClassRequest): Observable<ClassResponse> {
    return this.http.put<ClassResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  listEnrolled(classId: number): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.baseUrl}/${classId}/students`);
  }

  enroll(classId: number, studentId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${classId}/students/${studentId}`, {});
  }

  unenroll(classId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${classId}/students/${studentId}`);
  }
}
