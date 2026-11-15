import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentService } from '../../../../core/services/parent.service';
import { ParentResponse, ParentUpdateRequest } from '../../../../core/models/admin.models';

@Component({
  selector: 'app-parent-form',
  templateUrl: './parent-form.component.html'
})
export class ParentFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  parentId: number | null = null;
  parent: ParentResponse | null = null;
  loading = false;
  submitting = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private parentService: ParentService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[A-Za-z0-9._]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      fullName: ['', Validators.required],
      phone: ['', Validators.pattern(/^$|^[0-9+\- ]{7,20}$/)],
      address: [''],
      occupation: ['']
    });
  }

  get f() {
    return this.form.controls;
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }
    this.isEditMode = true;
    this.parentId = Number(idParam);
    this.form.get('username')?.disable();
    this.form.get('password')?.disable();

    this.loading = true;
    this.parentService.get(this.parentId).subscribe({
      next: (parent) => {
        this.parent = parent;
        this.form.patchValue(parent);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message ?? 'Could not load this parent');
        this.router.navigate(['/admin/parents']);
      }
    });
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const random = new Uint32Array(10);
    crypto.getRandomValues(random);
    let value = '';
    random.forEach((n) => (value += chars[n % chars.length]));
    value = value.slice(0, 8) + 'a' + (random[0] % 10);
    this.form.get('password')?.setValue(value);
    this.form.get('password')?.markAsTouched();
    this.showPassword = true;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue();
    const request$ = this.isEditMode
      ? this.parentService.update(this.parentId!, {
        fullName: value.fullName,
        phone: value.phone,
        address: value.address,
        occupation: value.occupation
      } as ParentUpdateRequest)
      : this.parentService.create(value);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.toastr.success(this.isEditMode ? 'Changes saved' : 'The parent can now sign in',
          this.isEditMode ? 'Parent updated' : 'Parent created');
        this.router.navigate(['/admin/parents']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
