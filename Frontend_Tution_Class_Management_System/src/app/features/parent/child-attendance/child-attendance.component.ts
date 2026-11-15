import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { AttendanceResponse } from '../../../core/models/teacher-portal.models';
import { daysAgoIso, todayIso } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-child-attendance',
  templateUrl: './child-attendance.component.html'
})
export class ChildAttendanceComponent implements OnInit {

  studentId!: number;
  child: StudentResponse | null = null;
  records: AttendanceResponse[] = [];
  from: string = daysAgoIso(90);
  to: string = todayIso();
  readonly today = todayIso();
  loading = true;
  loadError = false;
  subjectFilter = '';

  readonly presets = [
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
    { label: '1 year', days: 365 }
  ];

  constructor(private route: ActivatedRoute, private parentPortalService: ParentPortalService) {
  }

  ngOnInit(): void {
    // Re-load when switching between children without leaving the page.
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.studentId = Number(params.get('id'));
      this.child = null;
      this.parentPortalService.getChild(this.studentId).subscribe((child) => (this.child = child));
      this.load();
    });
  }

  get subjects(): string[] {
    return [...new Set(this.records.map((r) => r.subject))].sort();
  }

  get visible(): AttendanceResponse[] {
    return this.subjectFilter ? this.records.filter((r) => r.subject === this.subjectFilter) : this.records;
  }

  get presentCount(): number {
    return this.visible.filter((r) => r.status === 'PRESENT').length;
  }

  get lateCount(): number {
    return this.visible.filter((r) => r.status === 'LATE').length;
  }

  get absentCount(): number {
    return this.visible.filter((r) => r.status === 'ABSENT').length;
  }

  get rate(): number {
    return this.visible.length ? ((this.presentCount + this.lateCount) / this.visible.length) * 100 : 0;
  }

  get rateColor(): string {
    return this.rate >= 85 ? '#22c55e' : this.rate >= 70 ? '#f59e0b' : '#ef4444';
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
      return;
    }
    this.loading = true;
    this.loadError = false;
    this.parentPortalService.attendance(this.studentId, this.from, this.to).subscribe({
      next: (records) => {
        this.records = records.sort((a, b) => b.date.localeCompare(a.date));
        if (this.subjectFilter && !this.subjects.includes(this.subjectFilter)) {
          this.subjectFilter = '';
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }
}
