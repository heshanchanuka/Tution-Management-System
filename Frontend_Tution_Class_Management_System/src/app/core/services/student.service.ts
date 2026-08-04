import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, StudentRequest, StudentResponse } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly baseUrl = `${environment.apiBaseUrl}/admin/students`;

  constructor(private http: HttpClient) {
  }

  list(page: number, size: number, search?: string): Observable<PageResponse<StudentResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PageResponse<StudentResponse>>(this.baseUrl, { params });
  }

  /** Convenience: fetch every student in one page, for populating dropdowns. */
  listAll(): Observable<PageResponse<StudentResponse>> {
    return this.list(0, 500);
  }

  get(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: StudentRequest): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(this.baseUrl, request);
  }

  update(id: number, request: StudentRequest): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
