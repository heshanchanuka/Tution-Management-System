import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { ApiErrorResponse, RegisterRequest } from '../../../core/models/auth.models';

/** Form-level check: password and confirmPassword must be identical. */
export const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password || !confirm) {
    return null;
  }
  return password === confirm ? null : { passwordMismatch: true };
};

/** Backend field names that don't map 1:1 to a form control. */
const SERVER_FIELD_ALIASES: Record<string, string> = {
  passwordMatching: 'confirmPassword'
};

// Client-side messages, worded like the backend's so both sources read the same.
const REQUIRED_MESSAGES: Record<string, string> = {
  username: 'Username is required.',
  password: 'Password is required.',
  confirmPassword: 'Please confirm your password.',
  fullName: 'Full name is required.'
};

const LENGTH_MESSAGES: Record<string, string> = {
  username: 'Username must be between 4 and 50 characters.',
  password: 'Password must be between 8 and 100 characters.',
  fullName: 'Full name must be at most 100 characters.',
  address: 'Address must be at most 255 characters.',
  occupation: 'Occupation must be at most 100 characters.'
};

const PATTERN_MESSAGES: Record<string, string> = {
  username: "Username may only contain letters, numbers, '.' and '_'.",
  password: 'Password must contain at least one letter and one number.',
  phone: 'Phone number must be 7-20 digits.'
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Same rules as the backend RegisterRequest, so most mistakes are caught before a round trip.
    this.form = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9._]+$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', Validators.pattern(/^$|^[0-9+\- ]{7,20}$/)],
      address: ['', Validators.maxLength(255)],
      occupation: ['', Validators.maxLength(100)]
    }, { validators: passwordsMatchValidator });
  }

  get f() {
    return this.form.controls;
  }

  /** True when a field should render as invalid (client rule or server error). */
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    if (!control) {
      return false;
    }
    const mismatch = field === 'confirmPassword' && this.form.hasError('passwordMismatch');
    return (control.invalid || mismatch) && (control.touched || control.dirty);
  }

  /** The single message to show under a field, or null. */
  errorFor(field: string): string | null {
    const control = this.form.get(field);
    if (!control || !this.isInvalid(field)) {
      return null;
    }
    const errors = control.errors ?? {};

    if (errors['server']) {
      return errors['server'];
    }
    if (errors['required']) {
      return REQUIRED_MESSAGES[field] ?? 'This field is required.';
    }
    if (errors['minlength'] || errors['maxlength']) {
      return LENGTH_MESSAGES[field] ?? 'Invalid length.';
    }
    if (errors['pattern']) {
      return PATTERN_MESSAGES[field] ?? 'Invalid format.';
    }
    if (field === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }
    return null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request: RegisterRequest = {
      username: value.username.trim(),
      password: value.password,
      confirmPassword: value.confirmPassword,
      fullName: value.fullName.trim(),
      phone: value.phone?.trim() || undefined,
      address: value.address?.trim() || undefined,
      occupation: value.occupation?.trim() || undefined
    };

    this.submitting = true;
    this.authService.register(request).subscribe({
      next: (response) => {
        this.submitting = false;
        this.toastr.success(
          response?.message ?? 'Registration successful. Your account is pending admin approval.',
          'Registration successful',
          { timeOut: 6000 }
        );
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.handleError(err);
      }
    });
  }

  private handleError(err: HttpErrorResponse): void {
    const body = err.error as Partial<ApiErrorResponse> | null;

    if (err.status === 400 && body?.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
      this.applyServerFieldErrors(body.fieldErrors);
      this.toastr.error('Please correct the highlighted fields.', 'Registration failed');
      return;
    }
    if (err.status === 409) {
      const username = this.form.get('username');
      username?.setErrors({ server: 'Username already taken.' });
      username?.markAsTouched();
      this.toastr.error('Username already taken.', 'Registration failed');
      return;
    }
    this.toastr.error(body?.message ?? 'Registration failed. Please try again.', 'Registration failed');
  }

  /**
   * Puts each backend message under its field. The `server` error is cleared
   * automatically the next time the user edits that field (validators re-run).
   */
  private applyServerFieldErrors(fieldErrors: Record<string, string>): void {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      const control = this.form.get(SERVER_FIELD_ALIASES[field] ?? field);
      if (control) {
        control.setErrors({ ...(control.errors ?? {}), server: message });
        control.markAsTouched();
      }
    });
  }
}
