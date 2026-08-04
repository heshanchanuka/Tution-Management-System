import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ClassResponse } from '../../../core/models/admin.models';
import { TeacherStatsResponse } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {

  classes: ClassResponse[] = [];
  stats: TeacherStatsResponse | null = null;
  loading = true;

  constructor(
    public authService: AuthService,
    private teacherClassService: TeacherClassService,
    private dashboardService: DashboardService
  ) {
  }

  ngOnInit(): void {
    this.dashboardService.teacherStats().subscribe((stats) => (this.stats = stats));

    this.teacherClassService.myClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
