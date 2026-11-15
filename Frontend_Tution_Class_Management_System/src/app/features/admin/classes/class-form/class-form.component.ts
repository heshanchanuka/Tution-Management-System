import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ClassService } from '../../../../core/services/class.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { DAYS_OF_WEEK, TeacherResponse } from '../../../../core/models/admin.models';

/** The class must end after it starts. */
const timeRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const start = group.get('startTime')?.value;
  const end = group.get('endTime')?.value;
  return start && end && end <= start ? { timeRange: true } : null;
};

@Component({
  selector: 'app-class-form',
  templateUrl: './class-form.component.html'
})
export class ClassFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  classId: number | null = null;
  loading = false;
  submitting = false;
  teachers: TeacherResponse[] = [];
  loadingTeachers = true;
  enrolledCount = 0;
  readonly days = DAYS_OF_WEEK;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private teacherService: TeacherService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      teacherId: [null, Validators.required],
      dayOfWeek: [null, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      feeAmount: [null, [Validators.required, Validators.min(0.01)]],
      capacity: [null, [Validators.required, Validators.min(1)]]
    }, { validators: timeRangeValidator });
  }

  get f() {
    return this.form.controls;
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  /** Length of the session, e.g. "2 h 30 min", for the helper text. */
  get duration(): string | null {
    const { startTime, endTime } = this.form.value;
    if (!startTime || !endTime || endTime <= startTime) {
      return null;
    }
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
  }

  ngOnInit(): void {
    this.teacherService.listAll().subscribe({
      next: (result) => {
        this.teachers = result.content.sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.loadingTeachers = false;
      },
      error: () => (this.loadingTeachers = false)
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.classId = Number(idParam);
      this.loading = true;
      this.classService.get(this.classId).subscribe({
        next: (cls) => {
          this.enrolledCount = cls.enrolledCount;
          this.form.patchValue({
            ...cls,
            startTime: cls.startTime.slice(0, 5),
            endTime: cls.endTime.slice(0, 5)
          });
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(err?.error?.message ?? 'Could not load this class');
          this.router.navigate(['/admin/classes']);
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = { ...this.form.value, teacherId: Number(this.form.value.teacherId) };
    const request$ = this.isEditMode
      ? this.classService.update(this.classId!, payload)
      : this.classService.create(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.toastr.success(this.isEditMode ? 'Changes saved' : 'You can now enrol students', this.isEditMode ? 'Class updated' : 'Class created');
        this.router.navigate(['/admin/classes']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
