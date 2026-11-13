import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    // Login/register failures (401 bad credentials, 403 pending approval, 400/409
    // validation) are handled by those pages themselves - don't redirect away.
    const isAuthEndpoint = req.url.includes('/auth/');

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (isAuthEndpoint) {
          return throwError(() => error);
        }
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.router.navigate(['/forbidden']);
        }
        // Re-throw the original error so callers can still read error.error.message.
        return throwError(() => error);
      })
    );
  }
}
