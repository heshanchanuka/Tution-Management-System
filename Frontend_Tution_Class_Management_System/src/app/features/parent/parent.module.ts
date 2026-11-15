import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ParentShellComponent } from './parent-shell/parent-shell.component';
import { ParentDashboardComponent } from './dashboard/parent-dashboard.component';
import { MyChildrenComponent } from './my-children/my-children.component';
import { ChildAttendanceComponent } from './child-attendance/child-attendance.component';
import { ChildFeesComponent } from './child-fees/child-fees.component';
import { ChildResultsComponent } from './child-results/child-results.component';
import { AnnouncementsViewComponent } from './announcements-view/announcements-view.component';
import { ChildHeaderComponent } from './child-header/child-header.component';

const routes: Routes = [
  {
    path: '',
    component: ParentShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ParentDashboardComponent, data: { title: 'Dashboard' } },
      { path: 'children', component: MyChildrenComponent, data: { title: 'My children' } },
      { path: 'children/:id/attendance', component: ChildAttendanceComponent, data: { title: 'Attendance' } },
      { path: 'children/:id/fees', component: ChildFeesComponent, data: { title: 'Fees' } },
      { path: 'children/:id/results', component: ChildResultsComponent, data: { title: 'Results' } },
      { path: 'announcements', component: AnnouncementsViewComponent, data: { title: 'Announcements' } }
    ]
  }
];

@NgModule({
  declarations: [
    ParentShellComponent,
    ParentDashboardComponent,
    MyChildrenComponent,
    ChildAttendanceComponent,
    ChildFeesComponent,
    ChildResultsComponent,
    AnnouncementsViewComponent,
    ChildHeaderComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ParentModule {
}
