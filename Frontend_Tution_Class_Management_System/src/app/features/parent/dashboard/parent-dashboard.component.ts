import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { ParentStatsResponse } from '../../../core/models/dashboard.models';
import { AnnouncementResponse } from '../../../core/models/announcement.models';
import { greeting } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-parent-dashboard',
  templateUrl: './parent-dashboard.component.html'
})
export class ParentDashboardComponent implements OnInit {

  children: StudentResponse[] = [];
  stats: ParentStatsResponse | null = null;
  announcements: AnnouncementResponse[] = [];
  loading = true;
  loadingStats = true;
  loadingAnnouncements = true;

  readonly greeting = greeting();
  readonly today = new Date();
  readonly firstName: string;

  constructor(
    private authService: AuthService,
    private parentPortalService: ParentPortalService,
    private dashboardService: DashboardService,
    private announcementService: AnnouncementService
  ) {
    this.firstName = (this.authService.getUser()?.fullName ?? '').split(' ')[0];
  }

  ngOnInit(): void {
    this.dashboardService.parentStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: () => (this.loadingStats = false)
    });

    this.parentPortalService.myChildren().subscribe({
      next: (children) => {
        this.children = children;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });

    this.announcementService.relevantForParent().subscribe({
      next: (items) => {
        this.announcements = items
          .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
          .slice(0, 3);
        this.loadingAnnouncements = false;
      },
      error: () => (this.loadingAnnouncements = false)
    });
  }

  isNew(a: AnnouncementResponse): boolean {
    return Date.now() - new Date(a.postedAt).getTime() < 3 * 86400000;
  }
}
