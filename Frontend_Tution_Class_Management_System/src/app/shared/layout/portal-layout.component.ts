import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { UserResponse } from '../../core/models/auth.models';

export interface NavItem {
  label: string;
  /** Bootstrap Icons name without the "bi-" prefix. */
  icon: string;
  link: string;
  exact?: boolean;
  /** Optional live count shown as a pill (e.g. pending approvals). */
  badge$?: Observable<number | null>;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

const COLLAPSED_KEY = 'tcms_sidebar_collapsed';

const PORTALS: { role: string; label: string; link: string; icon: string }[] = [
  { role: 'ADMIN', label: 'Admin portal', link: '/admin/dashboard', icon: 'shield-lock' },
  { role: 'TEACHER', label: 'Teacher portal', link: '/teacher/dashboard', icon: 'easel' },
  { role: 'PARENT', label: 'Parent portal', link: '/parent/dashboard', icon: 'people' }
];

/**
 * Shell for every signed-in portal: collapsible sidebar (off-canvas on mobile),
 * sticky top bar with the current page title, theme toggle and user menu.
 * Page titles come from each route's `data.title`.
 */
@Component({
  selector: 'app-portal-layout',
  template: `
    <div class="portal" [class.is-collapsed]="collapsed" [class.is-mobile-open]="mobileOpen">
      <aside class="portal-sidebar" aria-label="Main navigation">
        <div class="sidebar-header">
          <a class="brand" [routerLink]="homeLink">
            <span class="brand-mark"><i class="bi bi-mortarboard-fill"></i></span>
            <span class="brand-text">
              <span class="brand-name">TCMS</span>
              <span class="brand-tag">{{ portalName }}</span>
            </span>
          </a>
        </div>

        <nav class="sidebar-nav">
          <ng-container *ngFor="let section of nav">
            <div class="sidebar-section" *ngIf="section.title">{{ section.title }}</div>
            <a *ngFor="let item of section.items" class="sidebar-link" [routerLink]="item.link"
               routerLinkActive="active" [routerLinkActiveOptions]="{ exact: !!item.exact }"
               [attr.title]="collapsed ? item.label : null">
              <i class="bi" [ngClass]="'bi-' + item.icon"></i>
              <span>{{ item.label }}</span>
              <ng-container *ngIf="item.badge$ | async as count">
                <span class="sidebar-badge" *ngIf="count > 0">{{ count }}</span>
              </ng-container>
            </a>
          </ng-container>
        </nav>

        <div class="sidebar-footer" *ngIf="user">
          <div class="sidebar-user">
            <app-avatar [name]="user.fullName" size="sm"></app-avatar>
            <div class="sidebar-user-text min-w-0">
              <div class="sidebar-user-name">{{ user.fullName }}</div>
              <div class="sidebar-user-role">{{ user.roles.join(' · ') | titlecase }}</div>
            </div>
          </div>
        </div>
      </aside>

      <div class="portal-backdrop" (click)="mobileOpen = false"></div>

      <div class="portal-main">
        <header class="portal-topbar">
          <button type="button" class="topbar-btn d-lg-none" (click)="mobileOpen = true" aria-label="Open menu">
            <i class="bi bi-list"></i>
          </button>
          <button type="button" class="topbar-btn d-none d-lg-grid" (click)="toggleCollapsed()"
                  [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                  [title]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
            <i class="bi" [ngClass]="collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'"></i>
          </button>

          <div class="topbar-title">
            <span class="topbar-crumb d-none d-sm-inline">{{ portalName }} <i class="bi bi-chevron-right mx-1 small"></i></span>
            {{ pageTitle }}
          </div>

          <div class="topbar-actions">
            <app-theme-toggle></app-theme-toggle>

            <div class="position-relative" #menuRoot>
              <button type="button" class="user-trigger" (click)="menuOpen = !menuOpen"
                      aria-haspopup="menu" [attr.aria-expanded]="menuOpen">
                <app-avatar [name]="user?.fullName" size="sm"></app-avatar>
                <span class="user-trigger-name d-none d-md-inline">{{ user?.fullName }}</span>
                <i class="bi bi-chevron-down small text-muted"></i>
              </button>

              <div class="app-dropdown-menu" *ngIf="menuOpen" role="menu">
                <div class="px-2 py-2 d-flex align-items-center gap-2">
                  <app-avatar [name]="user?.fullName"></app-avatar>
                  <div class="min-w-0">
                    <div class="fw-semibold text-truncate">{{ user?.fullName }}</div>
                    <div class="small text-muted text-truncate">&#64;{{ user?.username }}</div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <ng-container *ngIf="otherPortals.length > 0">
                  <div class="section-eyebrow px-2 pt-1 pb-1">Switch portal</div>
                  <a *ngFor="let portal of otherPortals" class="dropdown-item" [routerLink]="portal.link" (click)="menuOpen = false" role="menuitem">
                    <i class="bi" [ngClass]="'bi-' + portal.icon"></i>{{ portal.label }}
                  </a>
                  <div class="dropdown-divider"></div>
                </ng-container>
                <a class="dropdown-item" routerLink="/home" (click)="menuOpen = false" role="menuitem">
                  <i class="bi bi-house"></i>Home page
                </a>
                <button type="button" class="dropdown-item text-danger" (click)="logout()" role="menuitem">
                  <i class="bi bi-box-arrow-right"></i>Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main class="portal-content" id="main-content">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `
})
export class PortalLayoutComponent implements OnInit, OnDestroy {

  @Input() nav: NavSection[] = [];
  @Input() portalName = '';
  @Input() homeLink = '/';

  @ViewChild('menuRoot') menuRoot?: ElementRef<HTMLElement>;

  user: UserResponse | null = null;
  pageTitle = '';
  collapsed = false;
  mobileOpen = false;
  menuOpen = false;

  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private toastr: ToastrService
  ) {
  }

  get otherPortals() {
    const roles = this.user?.roles ?? [];
    const current = this.router.url.split('/')[1]?.toUpperCase();
    return PORTALS.filter((p) => roles.includes(p.role) && p.role !== current);
  }

  ngOnInit(): void {
    try {
      this.collapsed = localStorage.getItem(COLLAPSED_KEY) === '1';
    } catch {
      this.collapsed = false;
    }

    this.subs.add(this.authService.currentUser$.subscribe((user) => (this.user = user)));

    this.updateTitle();
    this.subs.add(
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
        this.mobileOpen = false;
        this.menuOpen = false;
        this.updateTitle();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    try {
      localStorage.setItem(COLLAPSED_KEY, this.collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
    this.toastr.info('You have been signed out.');
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen && this.menuRoot && !this.menuRoot.nativeElement.contains(event.target as Node)) {
      this.menuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuOpen = false;
    this.mobileOpen = false;
  }

  /** Uses the deepest route's data.title for the top bar and the browser tab. */
  private updateTitle(): void {
    let current: ActivatedRoute | null = this.route;
    let found = '';
    while (current) {
      const t = current.snapshot?.data?.['title'];
      if (t) {
        found = t;
      }
      current = current.firstChild;
    }
    this.pageTitle = found;
    this.title.setTitle(found ? `${found} · ${this.portalName} · TCMS` : `${this.portalName} · TCMS`);
  }
}
