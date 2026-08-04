import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, TeacherCreateRequest, TeacherResponse, TeacherUpdateRequest } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private readonly baseUrl = `${environment.apiBaseUrl}/admin/teachers`;

  constructor(private http: HttpClient) {
  }

  list(page: number, size: number, search?: string): Observable<PageResponse<TeacherResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PageResponse<TeacherResponse>>(this.baseUrl, { params });
  }

  /** Convenience: fetch every teacher in one page, for populating dropdowns. */
  listAll(): Observable<PageResponse<TeacherResponse>> {
    return this.list(0, 200);
  }

  get(id: number): Observable<TeacherResponse> {
    return this.http.get<TeacherResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: TeacherCreateRequest): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(this.baseUrl, request);
  }

  update(id: number, request: TeacherUpdateRequest): Observable<TeacherResponse> {
    return this.http.put<TeacherResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
