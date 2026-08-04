import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../../../core/services/attendance.service';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ClassResponse } from '../../../core/models/admin.models';
import { AttendanceResponse } from '../../../core/models/teacher-portal.models';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.scss']
})
export class AttendanceHistoryComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  records: AttendanceResponse[] = [];
  from: string = isoDaysAgo(30);
  to: string = isoDaysAgo(0);
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
    this.load();
  }

  load(): void {
    this.loading = true;
    this.attendanceService.getHistory(this.classId, this.from, this.to).subscribe({
      next: (records) => {
        this.records = records.sort((a, b) => b.date.localeCompare(a.date) || a.studentName.localeCompare(b.studentName));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message ?? 'Could not load attendance history');
      }
    });
  }
}
