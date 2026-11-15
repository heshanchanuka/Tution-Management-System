import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { TeacherShellComponent } from './teacher-shell/teacher-shell.component';
import { TeacherDashboardComponent } from './dashboard/teacher-dashboard.component';
import { MyClassesComponent } from './my-classes/my-classes.component';
import { ClassStudentsComponent } from './class-students/class-students.component';
import { AttendanceMarkingComponent } from './attendance-marking/attendance-marking.component';
import { AttendanceHistoryComponent } from './attendance-history/attendance-history.component';
import { MarksEntryComponent } from './marks-entry/marks-entry.component';
import { ClassHeaderComponent } from './class-header/class-header.component';

const routes: Routes = [
  {
    path: '',
    component: TeacherShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TeacherDashboardComponent, data: { title: 'Dashboard' } },
      { path: 'classes', component: MyClassesComponent, data: { title: 'My classes' } },
      { path: 'classes/:id/students', component: ClassStudentsComponent, data: { title: 'Class roster' } },
      { path: 'classes/:id/attendance', component: AttendanceMarkingComponent, data: { title: 'Mark attendance' } },
      { path: 'classes/:id/attendance/history', component: AttendanceHistoryComponent, data: { title: 'Attendance history' } },
      { path: 'classes/:id/marks', component: MarksEntryComponent, data: { title: 'Exams & marks' } }
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
    MarksEntryComponent,
    ClassHeaderComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class TeacherModule {
}
