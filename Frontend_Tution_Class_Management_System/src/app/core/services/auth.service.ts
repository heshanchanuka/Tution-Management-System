import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserResponse } from '../models/auth.models';

const TOKEN_KEY = 'tcms_token';
const USER_KEY = 'tcms_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<UserResponse | null>(this.readStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, request).pipe(
      tap(response => this.setSession(response))
    );
  }

  /**
   * Parent self-registration. The new account is pending admin approval, so the
   * response carries no token and we deliberately do NOT call setSession().
   */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/auth/register`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  /** True when a non-expired token and user are stored. An expired session is cleared. */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token || !this.getUser()) {
      return false;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  /** Reads the JWT `exp` claim (seconds since epoch). Unreadable tokens are left to the server to judge. */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return typeof json.exp === 'number' && json.exp * 1000 <= Date.now();
    } catch {
      return false;
    }
  }

  /** True if the logged-in user holds at least one of the given roles. */
  hasAnyRole(allowedRoles: string[]): boolean {
    const user = this.getUser();
    if (!user) {
      return false;
    }
    return user.roles.some(role => allowedRoles.includes(role));
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as UserResponse : null;
  }
}
