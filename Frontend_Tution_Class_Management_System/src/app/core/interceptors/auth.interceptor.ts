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
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
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
          // Session expired or revoked: sign out and come back here after signing in again.
          const hadSession = !!this.authService.getToken();
          this.authService.logout();
          if (hadSession) {
            this.toastr.info('Your session has expired. Please sign in again.', 'Signed out');
          }
          const returnUrl = this.router.url.startsWith('/login') ? undefined : this.router.url;
          this.router.navigate(['/login'], { queryParams: returnUrl ? { returnUrl } : {} });
        } else if (error.status === 403) {
          this.router.navigate(['/forbidden']);
        }
        // Re-throw the original error so callers can still read error.error.message.
        return throwError(() => error);
      })
    );
  }
}
