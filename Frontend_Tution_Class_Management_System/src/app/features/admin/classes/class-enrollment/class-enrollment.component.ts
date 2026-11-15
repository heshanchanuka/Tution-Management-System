import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ClassService } from '../../../../core/services/class.service';
import { StudentService } from '../../../../core/services/student.service';
import { ClassResponse, StudentResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-class-enrollment',
  templateUrl: './class-enrollment.component.html'
})
export class ClassEnrollmentComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  enrolled: StudentResponse[] = [];
  allStudents: StudentResponse[] = [];
  loadingEnrolled = true;
  loadingStudents = true;

  enrolledFilter = '';
  availableFilter = '';
  /** Only show students in the same grade as the class (on by default). */
  sameGradeOnly = true;
  /** Ids with an enrol/unenrol request in flight. */
  busyIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private classService: ClassService,
    private studentService: StudentService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClass();
    this.loadEnrolled();
    this.studentService.listAll().subscribe({
      next: (result) => {
        this.allStudents = result.content.sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.loadingStudents = false;
      },
      error: () => (this.loadingStudents = false)
    });
  }

  get isFull(): boolean {
    return !!this.schoolClass && this.enrolled.length >= this.schoolClass.capacity;
  }

  get seatsLeft(): number {
    return this.schoolClass ? Math.max(0, this.schoolClass.capacity - this.enrolled.length) : 0;
  }

  get filteredEnrolled(): StudentResponse[] {
    const term = this.enrolledFilter.trim().toLowerCase();
    return term ? this.enrolled.filter((s) => s.fullName.toLowerCase().includes(term)) : this.enrolled;
  }

  get availableStudents(): StudentResponse[] {
    const enrolledIds = new Set(this.enrolled.map((s) => s.id));
    const term = this.availableFilter.trim().toLowerCase();
    const grade = this.schoolClass?.gradeLevel.trim().toLowerCase();
    return this.allStudents.filter((s) =>
      !enrolledIds.has(s.id)
      && (!this.sameGradeOnly || !grade || s.gradeLevel.trim().toLowerCase() === grade)
      && (!term || s.fullName.toLowerCase().includes(term) || s.parentName?.toLowerCase().includes(term))
    );
  }

  loadClass(): void {
    this.classService.get(this.classId).subscribe((cls) => (this.schoolClass = cls));
  }

  loadEnrolled(): void {
    this.classService.listEnrolled(this.classId).subscribe({
      next: (students) => {
        this.enrolled = students.sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.loadingEnrolled = false;
      },
      error: () => (this.loadingEnrolled = false)
    });
  }

  enroll(student: StudentResponse): void {
    if (this.isFull) {
      this.toastr.warning('This class is full. Increase its capacity to enrol more students.');
      return;
    }
    this.busyIds.add(student.id);
    this.classService.enroll(this.classId, student.id).subscribe({
      next: () => {
        this.busyIds.delete(student.id);
        // Optimistic local update keeps the lists snappy; the server is the source of truth on reload.
        this.enrolled = [...this.enrolled, student].sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.toastr.success(`${student.fullName} enrolled`);
      },
      error: (err) => {
        this.busyIds.delete(student.id);
        this.toastr.error(err?.error?.message ?? 'Could not enrol student');
      }
    });
  }

  async unenroll(student: StudentResponse): Promise<void> {
    const ok = await this.confirmService.ask({
      title: `Remove ${student.fullName} from this class?`,
      message: 'Their past attendance and results are kept. You can enrol them again later.',
      confirmText: 'Remove',
      icon: 'person-dash'
    });
    if (!ok) {
      return;
    }
    this.busyIds.add(student.id);
    this.classService.unenroll(this.classId, student.id).subscribe({
      next: () => {
        this.busyIds.delete(student.id);
        this.enrolled = this.enrolled.filter((s) => s.id !== student.id);
        this.toastr.success(`${student.fullName} removed from the class`);
      },
      error: (err) => {
        this.busyIds.delete(student.id);
        this.toastr.error(err?.error?.message ?? 'Could not remove student');
      }
    });
  }
}
