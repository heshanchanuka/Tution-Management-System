import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '../../../../core/services/student.service';
import { ParentService } from '../../../../core/services/parent.service';
import { ParentResponse, StudentRequest } from '../../../../core/models/admin.models';
import { todayIso } from '../../../../core/utils/date.utils';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html'
})
export class StudentFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  studentId: number | null = null;
  editingName = '';
  loading = false;
  submitting = false;
  parents: ParentResponse[] = [];
  loadingParents = true;
  readonly maxDate = todayIso();
  readonly gradeSuggestions = Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`);

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

  get selectedParent(): ParentResponse | undefined {
    return this.parents.find((p) => p.id === this.form.value.parentId);
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  ngOnInit(): void {
    this.parentService.listAll().subscribe({
      next: (result) => {
        // Pending (unapproved) self-registrations can't be linked to a student yet.
        this.parents = result.content.filter((p) => p.enabled).sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.loadingParents = false;
      },
      error: () => (this.loadingParents = false)
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.studentId = Number(idParam);
      this.loading = true;
      this.studentService.get(this.studentId).subscribe({
        next: (student) => {
          this.editingName = student.fullName;
          this.form.patchValue(student);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(err?.error?.message ?? 'Could not load this student');
          this.router.navigate(['/admin/students']);
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
    const value = this.form.value;
    const payload: StudentRequest = {
      fullName: value.fullName.trim(),
      gradeLevel: value.gradeLevel.trim(),
      // Send null rather than "" so the backend's LocalDate parses cleanly.
      dateOfBirth: value.dateOfBirth || null,
      parentId: Number(value.parentId)
    } as unknown as StudentRequest;

    const request$ = this.isEditMode
      ? this.studentService.update(this.studentId!, payload)
      : this.studentService.create(payload);

    request$.subscribe({
      next: (student) => {
        this.submitting = false;
        this.toastr.success(this.isEditMode ? 'Changes saved' : `${student.fullName} was added`,
          this.isEditMode ? 'Student updated' : 'Student created');
        this.router.navigate(['/admin/students']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
