import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { dashboardFor } from '../../layout/public-layout.components';

@Component({
  selector: 'app-forbidden',
  template: `
    <app-public-header></app-public-header>
    <section class="error-page">
      <div>
        <div class="error-code">403</div>
        <h1>You don't have access to this page</h1>
        <p>Your account doesn't have permission to open this page. If you think this is a mistake, contact the institute office.</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <a *ngIf="authService.currentUser$ | async as user; else guest" class="btn btn-primary" [routerLink]="dashboardLink(user.roles)">
            <i class="bi bi-grid-1x2"></i> Go to my dashboard
          </a>
          <ng-template #guest>
            <a class="btn btn-primary" routerLink="/login"><i class="bi bi-box-arrow-in-right"></i> Sign in</a>
          </ng-template>
          <a class="btn btn-white" routerLink="/home">Back to home</a>
        </div>
      </div>
    </section>
  `
})
export class ForbiddenComponent {
  constructor(public authService: AuthService) {
  }

  dashboardLink(roles: string[]): string {
    return dashboardFor(roles);
  }
}
