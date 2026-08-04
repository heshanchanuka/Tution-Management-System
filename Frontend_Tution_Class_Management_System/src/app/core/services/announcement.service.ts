import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/admin.models';
import { AnnouncementCreateRequest, AnnouncementResponse } from '../models/announcement.models';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private readonly adminUrl = `${environment.apiBaseUrl}/admin/announcements`;
  private readonly parentUrl = `${environment.apiBaseUrl}/parent/announcements`;

  constructor(private http: HttpClient) {
  }

  create(request: AnnouncementCreateRequest): Observable<AnnouncementResponse> {
    return this.http.post<AnnouncementResponse>(this.adminUrl, request);
  }

  list(page: number, size: number): Observable<PageResponse<AnnouncementResponse>> {
    return this.http.get<PageResponse<AnnouncementResponse>>(this.adminUrl, { params: { page, size } });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }

  relevantForParent(): Observable<AnnouncementResponse[]> {
    return this.http.get<AnnouncementResponse[]>(this.parentUrl);
  }
}
