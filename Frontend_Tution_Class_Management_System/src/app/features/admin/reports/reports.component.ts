import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, skip } from 'rxjs/operators';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AttendanceSummaryResponse, ExamPerformancePoint, RevenueReportPoint } from '../../../core/models/dashboard.models';
import { applyChartTheme, Chart, CHART_COLORS, shortMonthLabel } from '../../../core/utils/chart.utils';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements AfterViewInit, OnDestroy {

  @ViewChild('revenueCanvas') revenueCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('attendanceCanvas') attendanceCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('examCanvas') examCanvas?: ElementRef<HTMLCanvasElement>;

  readonly Math = Math;
  readonly monthOptions = [3, 6, 12];
  months = 6;

  revenue: RevenueReportPoint[] = [];
  attendance: AttendanceSummaryResponse | null = null;
  exams: ExamPerformancePoint[] = [];

  loading = true;
  loadingRevenue = false;
  failed = false;

  private charts: Chart[] = [];
  private revenueChart?: Chart;
  private subs = new Subscription();

  constructor(private dashboardService: DashboardService, private theme: ThemeService) {
  }

  // ---- Summary figures ----
  get revenueTotal(): number {
    return this.revenue.reduce((s, p) => s + p.totalAmount, 0);
  }

  get revenueAverage(): number {
    return this.revenue.length ? this.revenueTotal / this.revenue.length : 0;
  }

  get bestMonth(): RevenueReportPoint | null {
    if (this.revenueTotal === 0) {
      return null;
    }
    return this.revenue.reduce<RevenueReportPoint | null>((best, p) => (!best || p.totalAmount > best.totalAmount ? p : best), null);
  }

  get attendanceTotal(): number {
    const a = this.attendance;
    return a ? a.present + a.late + a.absent : 0;
  }

  get attendanceRate(): number {
    const a = this.attendance;
    return a && this.attendanceTotal ? ((a.present + a.late) / this.attendanceTotal) * 100 : 0;
  }

  get examAverage(): number {
    return this.exams.length ? this.exams.reduce((s, e) => s + e.averagePercentage, 0) / this.exams.length : 0;
  }

  get topClass(): ExamPerformancePoint | null {
    return this.exams.reduce<ExamPerformancePoint | null>((best, e) => (!best || e.averagePercentage > best.averagePercentage ? e : best), null);
  }

  monthLabel(month: string): string {
    return shortMonthLabel(month);
  }

  ngAfterViewInit(): void {
    forkJoin({
      revenue: this.dashboardService.revenueReport(this.months).pipe(catchError(() => of(null))),
      attendance: this.dashboardService.attendanceSummary().pipe(catchError(() => of(null))),
      exams: this.dashboardService.examPerformance().pipe(catchError(() => of(null)))
    }).subscribe(({ revenue, attendance, exams }) => {
      this.failed = revenue === null && attendance === null && exams === null;
      this.revenue = revenue ?? [];
      this.attendance = attendance;
      this.exams = (exams ?? []).sort((a, b) => b.averagePercentage - a.averagePercentage);
      this.loading = false;
      setTimeout(() => this.renderAll());
    });

    // Re-draw with the right colours when the theme changes.
    this.subs.add(this.theme.mode$.pipe(skip(1)).subscribe(() => this.renderAll()));
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    this.revenueChart?.destroy();
    this.subs.unsubscribe();
  }

  changeMonths(months: number): void {
    if (months === this.months) {
      return;
    }
    this.months = months;
    this.loadingRevenue = true;
    this.dashboardService.revenueReport(months).subscribe({
      next: (points) => {
        this.revenue = points;
        this.loadingRevenue = false;
        setTimeout(() => this.renderRevenue());
      },
      error: () => (this.loadingRevenue = false)
    });
  }

  private renderAll(): void {
    applyChartTheme();
    this.destroyCharts();
    this.renderRevenue();
    this.renderAttendance();
    this.renderExams();
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  private renderRevenue(): void {
    this.revenueChart?.destroy();
    this.revenueChart = undefined;
    if (!this.revenueCanvas || this.revenueTotal === 0) {
      return;
    }
    applyChartTheme();
    this.revenueChart = new Chart(this.revenueCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.revenue.map((p) => shortMonthLabel(p.month)),
        datasets: [{
          label: 'Revenue',
          data: this.revenue.map((p) => p.totalAmount),
          backgroundColor: CHART_COLORS.primary,
          hoverBackgroundColor: '#4f46e5',
          borderRadius: 8,
          maxBarThickness: 44
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (item) => ` LKR ${Number(item.raw).toLocaleString('en-LK')}` } }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            border: { display: false },
            ticks: { callback: (v) => Number(v) >= 1000 ? `${Number(v) / 1000}k` : v }
          }
        }
      }
    });
  }

  private renderAttendance(): void {
    if (!this.attendanceCanvas || !this.attendance || this.attendanceTotal === 0) {
      return;
    }
    const { surface } = applyChartTheme();
    this.charts.push(new Chart(this.attendanceCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Late', 'Absent'],
        datasets: [{
          data: [this.attendance.present, this.attendance.late, this.attendance.absent],
          backgroundColor: [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger],
          borderColor: surface,
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        cutout: '72%',
        plugins: { legend: { position: 'bottom' } }
      }
    }));
  }

  private renderExams(): void {
    if (!this.examCanvas || this.exams.length === 0) {
      return;
    }
    applyChartTheme();
    this.charts.push(new Chart(this.examCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.exams.map((p) => p.subject),
        datasets: [{
          label: 'Average %',
          data: this.exams.map((p) => Math.round(p.averagePercentage * 10) / 10),
          backgroundColor: this.exams.map((p) =>
            p.averagePercentage >= 75 ? CHART_COLORS.success : p.averagePercentage >= 50 ? CHART_COLORS.info : CHART_COLORS.warning),
          borderRadius: 6,
          maxBarThickness: 26
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (item) => ` ${item.raw}% average` } }
        },
        scales: {
          x: { beginAtZero: true, max: 100, border: { display: false }, ticks: { callback: (v) => `${v}%` } },
          y: { grid: { display: false } }
        }
      }
    }));
  }
}
