import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PageResponse, ParentCreateRequest, ParentResponse, ParentUpdateRequest } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  private readonly baseUrl = `${environment.apiBaseUrl}/admin/parents`;

  /** Number of self-registrations waiting for approval; drives the badge on the admin "Parents" tab. */
  private pendingCountSubject = new BehaviorSubject<number>(0);
  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  list(page: number, size: number, search?: string): Observable<PageResponse<ParentResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PageResponse<ParentResponse>>(this.baseUrl, { params });
  }

  /** Convenience: fetch every parent in one page, for populating dropdowns. */
  listAll(): Observable<PageResponse<ParentResponse>> {
    return this.list(0, 200);
  }

  get(id: number): Observable<ParentResponse> {
    return this.http.get<ParentResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: ParentCreateRequest): Observable<ParentResponse> {
    return this.http.post<ParentResponse>(this.baseUrl, request);
  }

  update(id: number, request: ParentUpdateRequest): Observable<ParentResponse> {
    return this.http.put<ParentResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // --- Self-registration approval ---

  getPending(page: number, size: number): Observable<PageResponse<ParentResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ParentResponse>>(`${this.baseUrl}/pending`, { params }).pipe(
      tap((result) => this.pendingCountSubject.next(result.totalElements))
    );
  }

  approve(id: number): Observable<ParentResponse> {
    return this.http.patch<ParentResponse>(`${this.baseUrl}/${id}/approve`, {});
  }

  /** Deletes the pending registration so the username can be reused. */
  reject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/reject`);
  }

  /** Re-fetches only the pending total (size=1) to keep the tab badge current. */
  refreshPendingCount(): void {
    this.getPending(0, 1).subscribe({ error: () => undefined });
  }
}
