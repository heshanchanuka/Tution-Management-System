import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ParentShellComponent } from './parent-shell/parent-shell.component';
import { ParentDashboardComponent } from './dashboard/parent-dashboard.component';
import { MyChildrenComponent } from './my-children/my-children.component';
import { ChildAttendanceComponent } from './child-attendance/child-attendance.component';
import { ChildFeesComponent } from './child-fees/child-fees.component';
import { ChildResultsComponent } from './child-results/child-results.component';
import { AnnouncementsViewComponent } from './announcements-view/announcements-view.component';

const routes: Routes = [
  {
    path: '',
    component: ParentShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ParentDashboardComponent },
      { path: 'children', component: MyChildrenComponent },
      { path: 'children/:id/attendance', component: ChildAttendanceComponent },
      { path: 'children/:id/fees', component: ChildFeesComponent },
      { path: 'children/:id/results', component: ChildResultsComponent },
      { path: 'announcements', component: AnnouncementsViewComponent }
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
    AnnouncementsViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ParentModule {
}
