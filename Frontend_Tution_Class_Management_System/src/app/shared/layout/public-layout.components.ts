import { Component, HostListener, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/** Landing-page role for an account: the dashboard a signed-in user should go to. */
export function dashboardFor(roles: string[] | undefined | null): string {
  const r = roles ?? [];
  if (r.includes('ADMIN')) {
    return '/admin/dashboard';
  }
  if (r.includes('TEACHER')) {
    return '/teacher/dashboard';
  }
  if (r.includes('PARENT')) {
    return '/parent/dashboard';
  }
  return '/home';
}

/** Sticky translucent header for public pages (landing, 403, 404). */
@Component({
  selector: 'app-public-header',
  template: `
    <header class="public-header" [class.is-scrolled]="scrolled">
      <div class="container public-header-inner">
        <a class="brand" routerLink="/home">
          <span class="brand-mark"><i class="bi bi-mortarboard-fill"></i></span>
          <span class="brand-text">
            <span class="brand-name">TCMS</span>
            <span class="brand-tag">Tuition Class Management</span>
          </span>
        </a>

        <nav class="public-nav d-none d-lg-flex" *ngIf="showSections">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#roles">For you</a>
        </nav>

        <div class="ms-auto d-flex align-items-center gap-2">
          <app-theme-toggle></app-theme-toggle>
          <ng-container *ngIf="authService.currentUser$ | async as user; else guest">
            <a class="btn btn-primary" [routerLink]="dashboardLink(user.roles)">
              Go to dashboard <i class="bi bi-arrow-right"></i>
            </a>
          </ng-container>
          <ng-template #guest>
            <a class="btn btn-link text-decoration-none fw-medium d-none d-sm-inline-flex" style="color: var(--app-text-2)" routerLink="/login">Sign in</a>
            <a class="btn btn-primary" routerLink="/register">Get started</a>
          </ng-template>
        </div>
      </div>
    </header>
  `
})
export class PublicHeaderComponent {
  @Input() showSections = false;
  scrolled = false;

  constructor(public authService: AuthService) {
  }

  dashboardLink(roles: string[]): string {
    return dashboardFor(roles);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 8;
  }
}

/** Split-screen layout for sign-in and registration: brand panel + form column. */
@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth">
      <aside class="auth-aside">
        <a class="brand" routerLink="/home">
          <span class="brand-mark"><i class="bi bi-mortarboard-fill"></i></span>
          <span class="brand-text">
            <span class="brand-name">TCMS</span>
            <span class="brand-tag">Tuition Class Management</span>
          </span>
        </a>

        <div class="auth-quote">
          <h2>{{ headline }}</h2>
          <p>{{ tagline }}</p>
          <ul class="auth-features">
            <li><span class="icon-tile"><i class="bi bi-calendar2-check"></i></span>Attendance marked in seconds, visible to parents instantly</li>
            <li><span class="icon-tile"><i class="bi bi-receipt"></i></span>Invoices, payments and PDF receipts in one place</li>
            <li><span class="icon-tile"><i class="bi bi-graph-up-arrow"></i></span>Exam results and report cards for every student</li>
          </ul>
        </div>

        <div class="auth-aside-footer">© {{ year }} Tuition Class Management System</div>
      </aside>

      <main class="auth-main">
        <div class="auth-topbar">
          <a class="brand d-lg-none" routerLink="/home">
            <span class="brand-mark"><i class="bi bi-mortarboard-fill"></i></span>
            <span class="brand-text"><span class="brand-name">TCMS</span></span>
          </a>
          <a class="d-none d-lg-inline-flex align-items-center gap-1 small fw-medium text-muted" routerLink="/home">
            <i class="bi bi-arrow-left"></i> Back to home
          </a>
          <app-theme-toggle></app-theme-toggle>
        </div>

        <div class="auth-form-wrap" [class.is-wide]="wide">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `
})
export class AuthLayoutComponent {
  @Input() wide = false;
  @Input() headline = 'Run your tuition classes without the paperwork.';
  @Input() tagline = 'One place for the institute, teachers and parents to stay on the same page.';
  readonly year = new Date().getFullYear();
}
