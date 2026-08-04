import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ClassService } from '../../../../core/services/class.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { DAYS_OF_WEEK, TeacherResponse } from '../../../../core/models/admin.models';

@Component({
  selector: 'app-class-form',
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.scss']
})
export class ClassFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  classId: number | null = null;
  submitting = false;
  teachers: TeacherResponse[] = [];
  days = DAYS_OF_WEEK;

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
    });
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.teacherService.listAll().subscribe((result) => {
      this.teachers = result.content;
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.classId = Number(idParam);
      this.classService.get(this.classId).subscribe((cls) => {
        this.form.patchValue({
          ...cls,
          startTime: cls.startTime.slice(0, 5),
          endTime: cls.endTime.slice(0, 5)
        });
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
        this.toastr.success(this.isEditMode ? 'Class updated' : 'Class created');
        this.router.navigate(['/admin/classes']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
