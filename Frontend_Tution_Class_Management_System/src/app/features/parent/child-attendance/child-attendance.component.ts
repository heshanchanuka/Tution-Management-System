import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { AttendanceResponse } from '../../../core/models/teacher-portal.models';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-child-attendance',
  templateUrl: './child-attendance.component.html',
  styleUrls: ['./child-attendance.component.scss']
})
export class ChildAttendanceComponent implements OnInit {

  studentId!: number;
  child: StudentResponse | null = null;
  records: AttendanceResponse[] = [];
  from: string = isoDaysAgo(90);
  to: string = isoDaysAgo(0);
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private parentPortalService: ParentPortalService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    this.parentPortalService.getChild(this.studentId).subscribe((child) => (this.child = child));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.parentPortalService.attendance(this.studentId, this.from, this.to).subscribe({
      next: (records) => {
        this.records = records.sort((a, b) => b.date.localeCompare(a.date));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message ?? 'Could not load attendance');
      }
    });
  }

  get presentCount(): number {
    return this.records.filter((r) => r.status === 'PRESENT').length;
  }

  get absentCount(): number {
    return this.records.filter((r) => r.status === 'ABSENT').length;
  }

  get lateCount(): number {
    return this.records.filter((r) => r.status === 'LATE').length;
  }
}
