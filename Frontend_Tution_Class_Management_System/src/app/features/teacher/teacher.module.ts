import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TeacherShellComponent } from './teacher-shell/teacher-shell.component';
import { TeacherDashboardComponent } from './dashboard/teacher-dashboard.component';
import { MyClassesComponent } from './my-classes/my-classes.component';
import { ClassStudentsComponent } from './class-students/class-students.component';
import { AttendanceMarkingComponent } from './attendance-marking/attendance-marking.component';
import { AttendanceHistoryComponent } from './attendance-history/attendance-history.component';
import { MarksEntryComponent } from './marks-entry/marks-entry.component';

const routes: Routes = [
  {
    path: '',
    component: TeacherShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TeacherDashboardComponent },
      { path: 'classes', component: MyClassesComponent },
      { path: 'classes/:id/students', component: ClassStudentsComponent },
      { path: 'classes/:id/attendance', component: AttendanceMarkingComponent },
      { path: 'classes/:id/attendance/history', component: AttendanceHistoryComponent },
      { path: 'classes/:id/marks', component: MarksEntryComponent }
    ]
  }
];

@NgModule({
  declarations: [
    TeacherShellComponent,
    TeacherDashboardComponent,
    MyClassesComponent,
    ClassStudentsComponent,
    AttendanceMarkingComponent,
    AttendanceHistoryComponent,
    MarksEntryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class TeacherModule {
}
