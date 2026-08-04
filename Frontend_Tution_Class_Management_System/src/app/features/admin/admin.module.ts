import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

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

import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },

      { path: 'teachers', component: TeacherListComponent },
      { path: 'teachers/new', component: TeacherFormComponent },
      { path: 'teachers/:id/edit', component: TeacherFormComponent },

      { path: 'parents', component: ParentListComponent },
      { path: 'parents/new', component: ParentFormComponent },
      { path: 'parents/:id/edit', component: ParentFormComponent },

      { path: 'students', component: StudentListComponent },
      { path: 'students/new', component: StudentFormComponent },
      { path: 'students/:id/edit', component: StudentFormComponent },

      { path: 'classes', component: ClassListComponent },
      { path: 'classes/new', component: ClassFormComponent },
      { path: 'classes/:id/edit', component: ClassFormComponent },
      { path: 'classes/:id/students', component: ClassEnrollmentComponent },

      { path: 'fees', component: FeeManagementComponent },

      { path: 'reports', component: ReportsComponent },
      { path: 'announcements', component: AnnouncementManagementComponent }
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
    AnnouncementManagementComponent,
    PaginationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule {
}
