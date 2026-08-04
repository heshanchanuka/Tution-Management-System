import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassResponse, StudentResponse } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class TeacherClassService {

  private readonly baseUrl = `${environment.apiBaseUrl}/teacher/classes`;

  constructor(private http: HttpClient) {
  }

  myClasses(): Observable<ClassResponse[]> {
    return this.http.get<ClassResponse[]>(this.baseUrl);
  }

  getClass(id: number): Observable<ClassResponse> {
    return this.http.get<ClassResponse>(`${this.baseUrl}/${id}`);
  }

  roster(classId: number): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.baseUrl}/${classId}/students`);
  }
}
