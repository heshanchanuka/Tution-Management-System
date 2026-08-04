import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TeacherService } from '../../../../core/services/teacher.service';

@Component({
  selector: 'app-teacher-form',
  templateUrl: './teacher-form.component.html',
  styleUrls: ['./teacher-form.component.scss']
})
export class TeacherFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  teacherId: number | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      fullName: ['', Validators.required],
      phone: [''],
      qualifications: [''],
      subjectSpecialty: ['']
    });
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.teacherId = Number(idParam);
      this.form.get('username')?.clearValidators();
      this.form.get('password')?.clearValidators();
      this.form.get('username')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();

      this.teacherService.get(this.teacherId).subscribe((teacher) => {
        this.form.patchValue(teacher);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const request$ = this.isEditMode
      ? this.teacherService.update(this.teacherId!, this.form.value)
      : this.teacherService.create(this.form.value);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.toastr.success(this.isEditMode ? 'Teacher updated' : 'Teacher created');
        this.router.navigate(['/admin/teachers']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
