import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../../../core/services/attendance.service';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ClassResponse } from '../../../core/models/admin.models';
import { AttendanceResponse, AttendanceStatus } from '../../../core/models/teacher-portal.models';
import { daysAgoIso, todayIso } from '../../../core/utils/date.utils';

interface DayGroup {
  date: string;
  records: AttendanceResponse[];
  present: number;
  late: number;
  absent: number;
}

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html'
})
export class AttendanceHistoryComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  records: AttendanceResponse[] = [];
  groups: DayGroup[] = [];
  from: string = daysAgoIso(30);
  to: string = todayIso();
  readonly today = todayIso();
  loading = true;
  loadError = false;
  /** Record id currently being corrected. */
  savingId: number | null = null;

  readonly presets = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 }
  ];

  readonly statuses: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT'];

  constructor(
    private route: ActivatedRoute,
    private teacherClassService: TeacherClassService,
    private attendanceService: AttendanceService,
    private toastr: ToastrService
  ) {
  }

  get lateTotal(): number {
    return this.records.filter((r) => r.status === 'LATE').length;
  }

  get absentTotal(): number {
    return this.records.filter((r) => r.status === 'ABSENT').length;
  }

  get rate(): number {
    if (this.records.length === 0) {
      return 0;
    }
    const attended = this.records.filter((r) => r.status !== 'ABSENT').length;
    return (attended / this.records.length) * 100;
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherClassService.getClass(this.classId).subscribe((cls) => (this.schoolClass = cls));
    this.load();
  }

  applyPreset(days: number): void {
    this.from = daysAgoIso(days);
    this.to = todayIso();
    this.load();
  }

  isPreset(days: number): boolean {
    return this.from === daysAgoIso(days) && this.to === todayIso();
  }

  load(): void {
    if (this.from > this.to) {
      this.toastr.warning('"From" must be before "To".');
      return;
    }
    this.loading = true;
    this.loadError = false;
    this.attendanceService.getHistory(this.classId, this.from, this.to).subscribe({
      next: (records) => {
        this.records = records;
        this.buildGroups();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  /** Correct a single record (PUT /teacher/attendance/{id}). */
  changeStatus(record: AttendanceResponse, status: AttendanceStatus): void {
    if (record.status === status) {
      return;
    }
    const previous = record.status;
    record.status = status;
    this.buildGroups();
    this.savingId = record.id;
    this.attendanceService.updateStatus(record.id, { status }).subscribe({
      next: (updated) => {
        this.savingId = null;
        record.status = updated.status;
        this.buildGroups();
        this.toastr.success(`${record.studentName} marked ${status.toLowerCase()}`, 'Attendance corrected');
      },
      error: (err) => {
        this.savingId = null;
        record.status = previous;
        this.buildGroups();
        this.toastr.error(err?.error?.message ?? 'Could not update attendance');
      }
    });
  }

  private buildGroups(): void {
    const byDate = new Map<string, AttendanceResponse[]>();
    this.records.forEach((r) => {
      const list = byDate.get(r.date) ?? [];
      list.push(r);
      byDate.set(r.date, list);
    });
    this.groups = [...byDate.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, records]) => ({
        date,
        records: records.sort((a, b) => a.studentName.localeCompare(b.studentName)),
        present: records.filter((r) => r.status === 'PRESENT').length,
        late: records.filter((r) => r.status === 'LATE').length,
        absent: records.filter((r) => r.status === 'ABSENT').length
      }));
  }
}
