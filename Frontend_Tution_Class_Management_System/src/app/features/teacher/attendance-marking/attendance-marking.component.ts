import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ClassResponse, StudentResponse } from '../../../core/models/admin.models';
import { AttendanceStatus } from '../../../core/models/teacher-portal.models';

interface RosterRow {
  student: StudentResponse;
  status: AttendanceStatus;
}

@Component({
  selector: 'app-attendance-marking',
  templateUrl: './attendance-marking.component.html',
  styleUrls: ['./attendance-marking.component.scss']
})
export class AttendanceMarkingComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  rows: RosterRow[] = [];
  selectedDate: string = new Date().toISOString().slice(0, 10);
  saving = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private teacherClassService: TeacherClassService,
    private attendanceService: AttendanceService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherClassService.getClass(this.classId).subscribe((cls) => (this.schoolClass = cls));
    this.loadRoster();
  }

  onDateChange(): void {
    this.loadRoster();
  }

  private loadRoster(): void {
    this.loading = true;
    this.teacherClassService.roster(this.classId).subscribe((students) => {
      this.attendanceService.getSession(this.classId, this.selectedDate).subscribe({
        next: (existing) => {
          const statusByStudent = new Map(existing.map((e) => [e.studentId, e.status]));
          this.rows = students.map((student) => ({
            student,
            status: statusByStudent.get(student.id) ?? 'PRESENT'
          }));
          this.loading = false;
        },
        error: () => {
          this.rows = students.map((student) => ({ student, status: 'PRESENT' as AttendanceStatus }));
          this.loading = false;
        }
      });
    });
  }

  save(): void {
    this.saving = true;
    const request = {
      date: this.selectedDate,
      entries: this.rows.map((row) => ({ studentId: row.student.id, status: row.status }))
    };

    this.attendanceService.mark(this.classId, request).subscribe({
      next: () => {
        this.saving = false;
        this.toastr.success('Attendance saved');
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message ?? 'Could not save attendance');
      }
    });
  }
}
