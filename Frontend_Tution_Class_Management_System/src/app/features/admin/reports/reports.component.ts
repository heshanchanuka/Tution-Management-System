import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements AfterViewInit {

  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('attendanceCanvas') attendanceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('examCanvas') examCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private dashboardService: DashboardService) {
  }

  ngAfterViewInit(): void {
    this.renderRevenueChart();
    this.renderAttendanceChart();
    this.renderExamPerformanceChart();
  }

  private renderRevenueChart(): void {
    this.dashboardService.revenueReport(6).subscribe((points) => {
      new Chart(this.revenueCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: points.map((p) => p.month),
          datasets: [{
            label: 'Revenue (LKR)',
            data: points.map((p) => p.totalAmount),
            backgroundColor: '#0d6efd'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    });
  }

  private renderAttendanceChart(): void {
    this.dashboardService.attendanceSummary().subscribe((summary) => {
      new Chart(this.attendanceCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Late', 'Absent'],
          datasets: [{
            data: [summary.present, summary.late, summary.absent],
            backgroundColor: ['#198754', '#ffc107', '#dc3545']
          }]
        },
        options: { responsive: true }
      });
    });
  }

  private renderExamPerformanceChart(): void {
    this.dashboardService.examPerformance().subscribe((points) => {
      new Chart(this.examCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: points.map((p) => p.subject),
          datasets: [{
            label: 'Average %',
            data: points.map((p) => Math.round(p.averagePercentage * 10) / 10),
            backgroundColor: '#20c997'
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, max: 100 } }
        }
      });
    });
  }
}
