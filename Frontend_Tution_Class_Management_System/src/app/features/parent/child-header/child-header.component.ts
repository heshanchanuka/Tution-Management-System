import { Component, Input } from '@angular/core';
import { StudentResponse } from '../../../core/models/admin.models';

/** Child name/avatar plus tabs to switch between attendance, results and fees. */
@Component({
  selector: 'app-child-header',
  template: `
    <a routerLink="/parent/children" class="page-back d-inline-flex align-items-center gap-1 small fw-medium text-muted mb-2">
      <i class="bi bi-arrow-left"></i> My children
    </a>
    <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
      <app-avatar [name]="child?.fullName" size="xl"></app-avatar>
      <div class="flex-grow-1 min-w-0">
        <h1 class="page-title mb-1" style="font-size: 1.5rem; font-weight: 700">
          <ng-container *ngIf="child; else loadingName">{{ child.fullName }}</ng-container>
          <ng-template #loadingName><span class="skeleton d-inline-block" style="height: 1.5rem; width: 12rem"></span></ng-template>
        </h1>
        <div class="text-muted small" *ngIf="child">
          {{ child.gradeLevel }}<ng-container *ngIf="child.dateOfBirth"> · Born {{ child.dateOfBirth | date:'d MMM y' }}</ng-container>
        </div>
      </div>
      <ng-content></ng-content>
    </div>

    <nav class="nav-segmented mb-4" aria-label="Child sections">
      <a class="nav-link" [routerLink]="['/parent/children', childId, 'attendance']" routerLinkActive="active">
        <i class="bi bi-calendar2-check"></i> Attendance
      </a>
      <a class="nav-link" [routerLink]="['/parent/children', childId, 'results']" routerLinkActive="active">
        <i class="bi bi-mortarboard"></i> Results
      </a>
      <a class="nav-link" [routerLink]="['/parent/children', childId, 'fees']" routerLinkActive="active">
        <i class="bi bi-wallet2"></i> Fees
      </a>
    </nav>
  `
})
export class ChildHeaderComponent {
  @Input() childId!: number;
  @Input() child: StudentResponse | null = null;
}
