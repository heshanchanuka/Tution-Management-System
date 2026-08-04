import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AdminStatsResponse } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  stats: AdminStatsResponse | null = null;
  loading = true;

  constructor(public authService: AuthService, private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.dashboardService.adminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
