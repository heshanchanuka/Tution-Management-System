import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TeacherUpdateRequest } from '../../../../core/models/admin.models';

@Component({
  selector: 'app-teacher-form',
  templateUrl: './teacher-form.component.html'
})
export class TeacherFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  teacherId: number | null = null;
  loading = false;
  submitting = false;
  showPassword = false;
  editingName = '';

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[A-Za-z0-9._]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      fullName: ['', Validators.required],
      phone: ['', Validators.pattern(/^$|^[0-9+\- ]{7,20}$/)],
      qualifications: [''],
      subjectSpecialty: ['']
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
    this.teacherId = Number(idParam);
    // Sign-in details can't be changed from here.
    this.form.get('username')?.disable();
    this.form.get('password')?.disable();

    this.loading = true;
    this.teacherService.get(this.teacherId).subscribe({
      next: (teacher) => {
        this.editingName = teacher.fullName;
        this.form.patchValue(teacher);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message ?? 'Could not load this teacher');
        this.router.navigate(['/admin/teachers']);
      }
    });
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let value = '';
    const random = new Uint32Array(10);
    crypto.getRandomValues(random);
    random.forEach((n) => (value += chars[n % chars.length]));
    // Guarantee at least one digit and one letter.
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
      ? this.teacherService.update(this.teacherId!, {
        fullName: value.fullName,
        phone: value.phone,
        qualifications: value.qualifications,
        subjectSpecialty: value.subjectSpecialty
      } as TeacherUpdateRequest)
      : this.teacherService.create(value);

    request$.subscribe({
      next: (teacher) => {
        this.submitting = false;
        this.toastr.success(this.isEditMode ? 'Changes saved' : `${teacher.fullName} can now sign in`,
          this.isEditMode ? 'Teacher updated' : 'Teacher created');
        this.router.navigate(['/admin/teachers']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
