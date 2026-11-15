import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ClassResponse, StudentResponse } from '../../../core/models/admin.models';
import { AttendanceStatus } from '../../../core/models/teacher-portal.models';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { todayIso, toLocalIsoDate } from '../../../core/utils/date.utils';

interface RosterRow {
  student: StudentResponse;
  status: AttendanceStatus;
}

@Component({
  selector: 'app-attendance-marking',
  templateUrl: './attendance-marking.component.html'
})
export class AttendanceMarkingComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  rows: RosterRow[] = [];
  selectedDate: string = todayIso();
  readonly today = todayIso();

  loading = true;
  loadError = false;
  saving = false;
  /** True when this date already had attendance saved on the server. */
  alreadyRecorded = false;
  /** Statuses as last loaded/saved, to detect unsaved edits. */
  private savedSnapshot = '';

  readonly statuses: { value: AttendanceStatus; label: string; icon: string; css: string }[] = [
    { value: 'PRESENT', label: 'Present', icon: 'check-lg', css: 'is-present' },
    { value: 'LATE', label: 'Late', icon: 'clock', css: 'is-late' },
    { value: 'ABSENT', label: 'Absent', icon: 'x-lg', css: 'is-absent' }
  ];

  constructor(
    private route: ActivatedRoute,
    private teacherClassService: TeacherClassService,
    private attendanceService: AttendanceService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
  }

  get isDirty(): boolean {
    return this.snapshot() !== this.savedSnapshot;
  }

  get counts(): Record<AttendanceStatus, number> {
    return {
      PRESENT: this.rows.filter((r) => r.status === 'PRESENT').length,
      LATE: this.rows.filter((r) => r.status === 'LATE').length,
      ABSENT: this.rows.filter((r) => r.status === 'ABSENT').length
    };
  }

  /** Day of week of the selected date doesn't match the class's scheduled day. */
  get offScheduleDay(): boolean {
    if (!this.schoolClass) {
      return false;
    }
    const day = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date(this.selectedDate + 'T00:00:00').getDay()];
    return day !== this.schoolClass.dayOfWeek;
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherClassService.getClass(this.classId).subscribe((cls) => (this.schoolClass = cls));
    this.loadRoster();
  }

  async onDateChange(value: string): Promise<void> {
    if (!value || value === this.selectedDate) {
      return;
    }
    if (this.isDirty) {
      const ok = await this.confirmService.ask({
        title: 'Discard unsaved attendance?',
        message: 'You changed some statuses for this date without saving.',
        confirmText: 'Discard changes',
        tone: 'warning',
        icon: 'exclamation-triangle'
      });
      if (!ok) {
        // Re-render the input with the old value.
        const keep = this.selectedDate;
        this.selectedDate = '';
        setTimeout(() => (this.selectedDate = keep));
        return;
      }
    }
    this.selectedDate = value;
    this.loadRoster();
  }

  shiftDate(days: number): void {
    const d = new Date(this.selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const next = toLocalIsoDate(d);
    if (next <= this.today) {
      this.onDateChange(next);
    }
  }

  loadRoster(): void {
    this.loading = true;
    this.loadError = false;
    forkJoin({
      students: this.teacherClassService.roster(this.classId),
      // A date with no saved session is not an error - treat it as empty.
      existing: this.attendanceService.getSession(this.classId, this.selectedDate).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ students, existing }) => {
        const statusByStudent = new Map(existing.map((e) => [e.studentId, e.status]));
        this.alreadyRecorded = existing.length > 0;
        this.rows = students
          .sort((a, b) => a.fullName.localeCompare(b.fullName))
          .map((student) => ({ student, status: statusByStudent.get(student.id) ?? 'PRESENT' }));
        this.savedSnapshot = this.alreadyRecorded ? this.snapshot() : '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  setStatus(row: RosterRow, status: AttendanceStatus): void {
    row.status = status;
  }

  markAll(status: AttendanceStatus): void {
    this.rows.forEach((r) => (r.status = status));
  }

  save(): void {
    if (this.rows.length === 0) {
      return;
    }
    this.saving = true;
    const request = {
      date: this.selectedDate,
      entries: this.rows.map((row) => ({ studentId: row.student.id, status: row.status }))
    };

    this.attendanceService.mark(this.classId, request).subscribe({
      next: () => {
        this.saving = false;
        this.alreadyRecorded = true;
        this.savedSnapshot = this.snapshot();
        const c = this.counts;
        this.toastr.success(`${c.PRESENT} present · ${c.LATE} late · ${c.ABSENT} absent`, 'Attendance saved');
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message ?? 'Could not save attendance');
      }
    });
  }

  private snapshot(): string {
    return this.rows.map((r) => `${r.student.id}:${r.status}`).join(',');
  }
}
