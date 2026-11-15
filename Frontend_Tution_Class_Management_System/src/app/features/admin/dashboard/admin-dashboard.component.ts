import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { FeeService } from '../../../core/services/fee.service';
import { ParentService } from '../../../core/services/parent.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AdminStatsResponse, RevenueReportPoint } from '../../../core/models/dashboard.models';
import { FeeInvoiceResponse } from '../../../core/models/fee.models';
import { applyChartTheme, Chart, CHART_COLORS, shortMonthLabel } from '../../../core/utils/chart.utils';
import { greeting } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('revenueCanvas') revenueCanvas?: ElementRef<HTMLCanvasElement>;

  stats: AdminStatsResponse | null = null;
  loadingStats = true;

  revenue: RevenueReportPoint[] = [];
  loadingRevenue = true;

  overdue: FeeInvoiceResponse[] = [];
  overdueTotal = 0;
  loadingOverdue = true;

  readonly greeting = greeting();
  readonly today = new Date();
  readonly firstName: string;

  readonly quickActions = [
    { icon: 'person-plus', tone: 'primary', title: 'Add a student', desc: 'Register a new student', link: '/admin/students/new' },
    { icon: 'journal-plus', tone: 'success', title: 'Create a class', desc: 'Subject, teacher & schedule', link: '/admin/classes/new' },
    { icon: 'receipt', tone: 'warning', title: 'Generate invoices', desc: 'Bill a class for the month', link: '/admin/fees' },
    { icon: 'megaphone', tone: 'violet', title: 'Post announcement', desc: 'Notify parents', link: '/admin/announcements' }
  ];

  private chart?: Chart;
  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private feeService: FeeService,
    public parentService: ParentService,
    private theme: ThemeService
  ) {
    this.firstName = (this.authService.getUser()?.fullName ?? '').split(' ')[0];
  }

  get revenueTotal(): number {
    return this.revenue.reduce((sum, p) => sum + p.totalAmount, 0);
  }

  ngOnInit(): void {
    this.dashboardService.adminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: () => (this.loadingStats = false)
    });

    this.feeService.overdueInvoices(0, 5).subscribe({
      next: (result) => {
        this.overdue = result.content;
        this.overdueTotal = result.totalElements;
        this.loadingOverdue = false;
      },
      error: () => (this.loadingOverdue = false)
    });

    this.parentService.refreshPendingCount();
  }

  ngAfterViewInit(): void {
    this.dashboardService.revenueReport(6).subscribe({
      next: (points) => {
        this.revenue = points;
        this.loadingRevenue = false;
        // Canvas is rendered after loading flips; wait a tick for it.
        setTimeout(() => this.renderChart());
      },
      error: () => (this.loadingRevenue = false)
    });

    this.subs.add(this.theme.mode$.pipe(skip(1)).subscribe(() => this.renderChart()));
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subs.unsubscribe();
  }

  private renderChart(): void {
    if (!this.revenueCanvas || this.revenueTotal === 0) {
      return;
    }
    this.chart?.destroy();
    applyChartTheme();

    const ctx = this.revenueCanvas.nativeElement.getContext('2d');
    const gradient = ctx?.createLinearGradient(0, 0, 0, 240);
    gradient?.addColorStop(0, 'rgba(99, 102, 241, .35)');
    gradient?.addColorStop(1, 'rgba(99, 102, 241, 0)');

    this.chart = new Chart(this.revenueCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.revenue.map((p) => shortMonthLabel(p.month)),
        datasets: [{
          label: 'Revenue',
          data: this.revenue.map((p) => p.totalAmount),
          borderColor: CHART_COLORS.primary,
          backgroundColor: gradient ?? CHART_COLORS.primarySoft,
          fill: true,
          tension: .35,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: CHART_COLORS.primary
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
}
