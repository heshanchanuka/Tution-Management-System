import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ClassService } from '../../../../core/services/class.service';
import { StudentService } from '../../../../core/services/student.service';
import { ClassResponse, StudentResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-class-enrollment',
  templateUrl: './class-enrollment.component.html',
  styleUrls: ['./class-enrollment.component.scss']
})
export class ClassEnrollmentComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  enrolled: StudentResponse[] = [];
  availableStudents: StudentResponse[] = [];
  selectedStudentId: number | null = null;

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
    this.studentService.listAll().subscribe((result) => {
      this.availableStudents = result.content;
    });
  }

  loadClass(): void {
    this.classService.get(this.classId).subscribe((cls) => (this.schoolClass = cls));
  }

  loadEnrolled(): void {
    this.classService.listEnrolled(this.classId).subscribe((students) => (this.enrolled = students));
  }

  get unenrolledStudents(): StudentResponse[] {
    const enrolledIds = new Set(this.enrolled.map((s) => s.id));
    return this.availableStudents.filter((s) => !enrolledIds.has(s.id));
  }

  enroll(): void {
    if (!this.selectedStudentId) {
      return;
    }
    this.classService.enroll(this.classId, this.selectedStudentId).subscribe({
      next: () => {
        this.toastr.success('Student enrolled');
        this.selectedStudentId = null;
        this.loadEnrolled();
        this.loadClass();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not enroll student')
    });
  }

  unenroll(student: StudentResponse): void {
    if (!this.confirmService.confirm(`Remove "${student.fullName}" from this class?`)) {
      return;
    }
    this.classService.unenroll(this.classId, student.id).subscribe({
      next: () => {
        this.toastr.success('Student removed from class');
        this.loadEnrolled();
        this.loadClass();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not remove student')
    });
  }
}
