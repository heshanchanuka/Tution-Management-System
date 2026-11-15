import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ClassResponse } from '../../../core/models/admin.models';
import { TeacherStatsResponse } from '../../../core/models/dashboard.models';
import { greeting, todayDayName } from '../../../core/utils/date.utils';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html'
})
export class TeacherDashboardComponent implements OnInit {

  classes: ClassResponse[] = [];
  stats: TeacherStatsResponse | null = null;
  loading = true;
  loadingStats = true;

  readonly greeting = greeting();
  readonly today = new Date();
  readonly todayName = todayDayName();
  readonly firstName: string;

  constructor(
    private authService: AuthService,
    private teacherClassService: TeacherClassService,
    private dashboardService: DashboardService
  ) {
    this.firstName = (this.authService.getUser()?.fullName ?? '').split(' ')[0];
  }

  get todaysClasses(): ClassResponse[] {
    return this.classes
      .filter((c) => c.dayOfWeek === this.todayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /** All classes in week order (Mon..Sun, then by start time). */
  get weekClasses(): ClassResponse[] {
    return [...this.classes].sort((a, b) =>
      DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
  }

  /** "In progress" / "Starts in 40 min" / "Finished" for a class happening today. */
  status(cls: ClassResponse): { label: string; tone: string } {
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
    const start = toMin(cls.startTime);
    const end = toMin(cls.endTime);
    if (minutesNow >= start && minutesNow < end) {
      return { label: 'In progress', tone: 'success' };
    }
    if (minutesNow < start) {
      const diff = start - minutesNow;
      return { label: diff <= 90 ? `Starts in ${diff} min` : 'Later today', tone: 'primary' };
    }
    return { label: 'Finished', tone: 'neutral' };
  }

  ngOnInit(): void {
    this.dashboardService.teacherStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: () => (this.loadingStats = false)
    });

    this.teacherClassService.myClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
