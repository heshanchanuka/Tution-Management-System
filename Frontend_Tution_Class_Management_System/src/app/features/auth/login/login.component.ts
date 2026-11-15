import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { dashboardFor } from '../../../shared/layout/public-layout.components';

/** Which portal a URL belongs to, so a returnUrl is only honoured for a role that can open it. */
const PORTAL_ROLE: Record<string, string> = { admin: 'ADMIN', teacher: 'TEACHER', parent: 'PARENT' };

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  form: FormGroup;
  submitting = false;
  showPassword = false;
  /** Inline banner for errors that need more than a toast (wrong password, pending account). */
  errorMessage: string | null = null;
  pendingAccount = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;
    this.pendingAccount = false;

    const { username, password } = this.form.value;
    this.authService.login({ username: username.trim(), password }).subscribe({
      next: (response) => {
        this.submitting = false;
        this.toastr.success(`Welcome back, ${response.user.fullName.split(' ')[0]}!`);
        this.router.navigateByUrl(this.destinationFor(response.user.roles));
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        if (err.status === 403) {
          // Correct password, but a self-registered account the admin hasn't approved yet.
          this.pendingAccount = true;
          this.errorMessage = err.error?.message ?? 'Your account is pending admin approval.';
          return;
        }
        if (err.status === 0) {
          this.errorMessage = 'Can\'t reach the server. Check your connection and try again.';
          return;
        }
        this.errorMessage = err.error?.message ?? 'Sign in failed. Please try again.';
        this.form.get('password')?.reset();
      }
    });
  }

  /** The page the user was sent away from (if their role can open it), else their dashboard. */
  private destinationFor(roles: string[]): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/')) {
      const portal = returnUrl.split('/')[1];
      const required = PORTAL_ROLE[portal];
      if (!required || roles.includes(required)) {
        return returnUrl;
      }
    }
    return dashboardFor(roles);
  }
}
