import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
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
    this.authService.login(this.form.value).subscribe({
      next: (response) => {
        this.submitting = false;
        this.toastr.success(`Welcome back, ${response.user.fullName}`);
        this.router.navigate([this.landingRouteFor(response.user.roles)]);
      },
      error: (err) => {
        this.submitting = false;
        if (err?.status === 403) {
          // Correct password, but a self-registered account the admin hasn't approved yet.
          this.toastr.warning(
            err?.error?.message ?? 'Your account is pending admin approval',
            'Account pending',
            { timeOut: 6000 }
          );
          return;
        }
        const message = err?.error?.message ?? 'Login failed. Please try again.';
        this.toastr.error(message, 'Login failed');
      }
    });
  }

  private landingRouteFor(roles: string[]): string {
    if (roles.includes('ADMIN')) {
      return '/admin/dashboard';
    }
    if (roles.includes('TEACHER')) {
      return '/teacher/dashboard';
    }
    if (roles.includes('PARENT')) {
      return '/parent/dashboard';
    }
    return '/home';
  }
}
