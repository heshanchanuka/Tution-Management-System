import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '../../../../core/services/student.service';
import { ParentService } from '../../../../core/services/parent.service';
import { ParentResponse } from '../../../../core/models/admin.models';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  studentId: number | null = null;
  submitting = false;
  parents: ParentResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private parentService: ParentService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      dateOfBirth: [''],
      gradeLevel: ['', Validators.required],
      parentId: [null, Validators.required]
    });
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.parentService.listAll().subscribe((result) => {
      this.parents = result.content;
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.studentId = Number(idParam);
      this.studentService.get(this.studentId).subscribe((student) => {
        this.form.patchValue(student);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = { ...this.form.value, parentId: Number(this.form.value.parentId) };
    const request$ = this.isEditMode
      ? this.studentService.update(this.studentId!, payload)
      : this.studentService.create(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.toastr.success(this.isEditMode ? 'Student updated' : 'Student created');
        this.router.navigate(['/admin/students']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
