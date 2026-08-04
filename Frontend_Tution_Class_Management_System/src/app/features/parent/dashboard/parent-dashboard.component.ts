import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { ParentStatsResponse } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-parent-dashboard',
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.scss']
})
export class ParentDashboardComponent implements OnInit {

  children: StudentResponse[] = [];
  stats: ParentStatsResponse | null = null;
  loading = true;

  constructor(
    public authService: AuthService,
    private parentPortalService: ParentPortalService,
    private dashboardService: DashboardService
  ) {
  }

  ngOnInit(): void {
    this.dashboardService.parentStats().subscribe((stats) => (this.stats = stats));

    this.parentPortalService.myChildren().subscribe({
      next: (children) => {
        this.children = children;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
