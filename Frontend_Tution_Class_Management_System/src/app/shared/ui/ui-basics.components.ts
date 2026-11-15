import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'neutral';

/** Page title row: optional back link, title, subtitle and projected action buttons. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <div class="min-w-0">
        <a *ngIf="backLink" class="page-back" [routerLink]="backLink">
          <i class="bi bi-arrow-left"></i>{{ backLabel }}
        </a>
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
      </div>
    </header>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle: string | null = null;
  @Input() backLink: string | any[] | null = null;
  @Input() backLabel = 'Back';
}

/** KPI tile with a coloured icon. Shows a skeleton while `loading`. */
@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="link; else plain">
      <a class="stat-card is-link text-decoration-none" [routerLink]="link">
        <ng-container *ngTemplateOutlet="body"></ng-container>
      </a>
    </ng-container>
    <ng-template #plain>
      <div class="stat-card">
        <ng-container *ngTemplateOutlet="body"></ng-container>
      </div>
    </ng-template>

    <ng-template #body>
      <div class="stat-icon" [ngClass]="'tone-' + tone"><i class="bi" [ngClass]="'bi-' + icon"></i></div>
      <div class="min-w-0 flex-grow-1">
        <div class="stat-label">{{ label }}</div>
        <ng-container *ngIf="!loading; else skeleton">
          <div class="stat-value">{{ value }}</div>
          <div class="stat-hint" *ngIf="hint">{{ hint }}</div>
        </ng-container>
        <ng-template #skeleton>
          <span class="skeleton mt-1" style="height: 1.75rem; width: 60%;"></span>
        </ng-template>
      </div>
    </ng-template>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number | null = null;
  @Input() icon = 'bar-chart';
  @Input() tone: Tone = 'primary';
  @Input() hint: string | null = null;
  @Input() loading = false;
  @Input() link: string | any[] | null = null;
}

/** Friendly placeholder for empty lists and failed loads. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" [class.empty-compact]="compact">
      <div class="empty-icon" [ngClass]="'tone-' + tone"><i class="bi" [ngClass]="'bi-' + icon"></i></div>
      <div class="empty-title">{{ title }}</div>
      <p class="empty-message" *ngIf="message">{{ message }}</p>
      <div class="empty-action"><ng-content></ng-content></div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() message: string | null = null;
  @Input() tone: Tone = 'primary';
  @Input() compact = false;
}

/** Shimmering placeholder rows shown while a list loads. */
@Component({
  selector: 'app-skeleton-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-list" aria-busy="true" aria-label="Loading">
      <div class="skeleton-row" *ngFor="let row of rowsArray">
        <span class="skeleton" *ngIf="avatar" style="width: 2.25rem; height: 2.25rem; border-radius: 50%;"></span>
        <div class="flex-grow-1">
          <span class="skeleton mb-2" style="height: .8rem; width: 38%;"></span>
          <span class="skeleton" style="height: .65rem; width: 22%;"></span>
        </div>
        <span class="skeleton d-none d-md-block" style="height: .8rem; width: 15%;"></span>
        <span class="skeleton d-none d-md-block" style="height: .8rem; width: 10%;"></span>
      </div>
    </div>
  `
})
export class SkeletonListComponent {
  @Input() rows = 5;
  @Input() avatar = true;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}

const AVATAR_TONES: Tone[] = ['primary', 'success', 'warning', 'info', 'violet', 'danger'];

/** Circular initials avatar; the colour is derived from the name so it stays stable. */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="avatar" [ngClass]="['tone-' + toneFor, size ? 'avatar-' + size : '']" [attr.title]="name" aria-hidden="true">
      {{ initials }}
    </span>
  `
})
export class AvatarComponent {
  @Input() name: string | null | undefined = '';
  @Input() size: 'sm' | 'lg' | 'xl' | null = null;

  get initials(): string {
    const parts = (this.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  get toneFor(): Tone {
    const value = this.name ?? '';
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
  }
}

interface StatusStyle {
  tone: Tone;
  label: string;
  icon?: string;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  PAID: { tone: 'success', label: 'Paid' },
  PARTIAL: { tone: 'warning', label: 'Partial' },
  DUE: { tone: 'info', label: 'Due' },
  OVERDUE: { tone: 'danger', label: 'Overdue' },
  PRESENT: { tone: 'success', label: 'Present' },
  LATE: { tone: 'warning', label: 'Late' },
  ABSENT: { tone: 'danger', label: 'Absent' },
  PENDING: { tone: 'warning', label: 'Pending' },
  ACTIVE: { tone: 'success', label: 'Active' },
  FULL: { tone: 'danger', label: 'Full' },
  OPEN: { tone: 'success', label: 'Open' }
};

/** Pill badge for invoice / attendance / account statuses. */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge-soft" [ngClass]="'tone-' + style.tone"><span class="dot"></span>{{ label || style.label }}</span>`
})
export class StatusBadgeComponent {
  @Input() status: string | null | undefined = '';
  @Input() label: string | null = null;

  get style(): StatusStyle {
    const key = (this.status ?? '').toUpperCase();
    return STATUS_STYLES[key] ?? { tone: 'neutral', label: this.status ?? '' };
  }
}
