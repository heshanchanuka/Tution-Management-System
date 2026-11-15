import { Component, Input } from '@angular/core';
import { ClassResponse } from '../../../core/models/admin.models';

/**
 * Header shared by every per-class teacher page: class name, schedule, and
 * tabs to move between roster, attendance, history and marks.
 */
@Component({
  selector: 'app-class-header',
  template: `
    <app-page-header [title]="schoolClass ? schoolClass.subject + ' · ' + schoolClass.gradeLevel : ' '"
                     [subtitle]="schoolClass ? (schoolClass | schedule:'long') + ' · ' + schoolClass.enrolledCount + ' student' + (schoolClass.enrolledCount === 1 ? '' : 's') : null"
                     backLink="/teacher/classes" backLabel="My classes">
      <ng-content></ng-content>
    </app-page-header>

    <nav class="nav-segmented mb-4" aria-label="Class sections">
      <a class="nav-link" [routerLink]="['/teacher/classes', classId, 'students']" routerLinkActive="active">
        <i class="bi bi-people"></i> Roster
      </a>
      <a class="nav-link" [routerLink]="['/teacher/classes', classId, 'attendance']" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <i class="bi bi-calendar2-check"></i> Attendance
      </a>
      <a class="nav-link" [routerLink]="['/teacher/classes', classId, 'attendance', 'history']" routerLinkActive="active">
        <i class="bi bi-clock-history"></i> History
      </a>
      <a class="nav-link" [routerLink]="['/teacher/classes', classId, 'marks']" routerLinkActive="active">
        <i class="bi bi-journal-check"></i> Exams &amp; marks
      </a>
    </nav>
  `
})
export class ClassHeaderComponent {
  @Input() classId!: number;
  @Input() schoolClass: ClassResponse | null = null;
}
