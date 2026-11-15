import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { TeacherListComponent } from './teachers/teacher-list/teacher-list.component';
import { TeacherFormComponent } from './teachers/teacher-form/teacher-form.component';
import { ParentListComponent } from './parents/parent-list/parent-list.component';
import { ParentFormComponent } from './parents/parent-form/parent-form.component';
import { StudentListComponent } from './students/student-list/student-list.component';
import { StudentFormComponent } from './students/student-form/student-form.component';
import { ClassListComponent } from './classes/class-list/class-list.component';
import { ClassFormComponent } from './classes/class-form/class-form.component';
import { ClassEnrollmentComponent } from './classes/class-enrollment/class-enrollment.component';
import { FeeManagementComponent } from './fees/fee-management.component';
import { ReportsComponent } from './reports/reports.component';
import { AnnouncementManagementComponent } from './announcements/announcement-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent, data: { title: 'Dashboard' } },

      { path: 'teachers', component: TeacherListComponent, data: { title: 'Teachers' } },
      { path: 'teachers/new', component: TeacherFormComponent, data: { title: 'New teacher' } },
      { path: 'teachers/:id/edit', component: TeacherFormComponent, data: { title: 'Edit teacher' } },

      { path: 'parents', component: ParentListComponent, data: { title: 'Parents' } },
      { path: 'parents/new', component: ParentFormComponent, data: { title: 'New parent' } },
      { path: 'parents/:id/edit', component: ParentFormComponent, data: { title: 'Edit parent' } },

      { path: 'students', component: StudentListComponent, data: { title: 'Students' } },
      { path: 'students/new', component: StudentFormComponent, data: { title: 'New student' } },
      { path: 'students/:id/edit', component: StudentFormComponent, data: { title: 'Edit student' } },

      { path: 'classes', component: ClassListComponent, data: { title: 'Classes' } },
      { path: 'classes/new', component: ClassFormComponent, data: { title: 'New class' } },
      { path: 'classes/:id/edit', component: ClassFormComponent, data: { title: 'Edit class' } },
      { path: 'classes/:id/students', component: ClassEnrollmentComponent, data: { title: 'Enrolment' } },

      { path: 'fees', component: FeeManagementComponent, data: { title: 'Fees & payments' } },
      { path: 'reports', component: ReportsComponent, data: { title: 'Reports' } },
      { path: 'announcements', component: AnnouncementManagementComponent, data: { title: 'Announcements' } }
    ]
  }
];

@NgModule({
  declarations: [
    AdminShellComponent,
    AdminDashboardComponent,
    TeacherListComponent,
    TeacherFormComponent,
    ParentListComponent,
    ParentFormComponent,
    StudentListComponent,
    StudentFormComponent,
    ClassListComponent,
    ClassFormComponent,
    ClassEnrollmentComponent,
    FeeManagementComponent,
    ReportsComponent,
    AnnouncementManagementComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AdminModule {
}
