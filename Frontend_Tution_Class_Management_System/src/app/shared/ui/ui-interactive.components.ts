import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmRequest, ConfirmService } from '../services/confirm.service';
import { ThemeService } from '../../core/services/theme.service';

/** Numbered pagination with ellipses and a "Showing x–y of z" summary. */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="app-pagination" *ngIf="totalPages > 1 || (totalElements ?? 0) > 0" aria-label="Pagination">
      <span class="page-info">
        <ng-container *ngIf="totalElements !== null; else pageOnly">
          Showing <strong>{{ rangeStart }}–{{ rangeEnd }}</strong> of <strong>{{ totalElements }}</strong>
        </ng-container>
        <ng-template #pageOnly>Page {{ page + 1 }} of {{ totalPages }}</ng-template>
      </span>
      <div class="page-buttons" *ngIf="totalPages > 1">
        <button type="button" class="page-btn" [disabled]="page === 0" (click)="goTo(page - 1)" aria-label="Previous page">
          <i class="bi bi-chevron-left"></i>
        </button>
        <ng-container *ngFor="let item of pages">
          <span *ngIf="item === -1" class="page-ellipsis">…</span>
          <button *ngIf="item !== -1" type="button" class="page-btn" [class.active]="item === page"
                  [attr.aria-current]="item === page ? 'page' : null" (click)="goTo(item)">
            {{ item + 1 }}
          </button>
        </ng-container>
        <button type="button" class="page-btn" [disabled]="page >= totalPages - 1" (click)="goTo(page + 1)" aria-label="Next page">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </nav>
  `
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() totalElements: number | null = null;
  @Input() pageSize = 10;
  @Output() pageChange = new EventEmitter<number>();

  get rangeStart(): number {
    return (this.totalElements ?? 0) === 0 ? 0 : this.page * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.page + 1) * this.pageSize, this.totalElements ?? 0);
  }

  /** Page indexes to render; -1 marks an ellipsis. */
  get pages(): number[] {
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const current = this.page;
    const set = new Set<number>([0, total - 1, current, current - 1, current + 1]);
    if (current <= 2) {
      [1, 2, 3].forEach((p) => set.add(p));
    }
    if (current >= total - 3) {
      [total - 2, total - 3, total - 4].forEach((p) => set.add(p));
    }
    const sorted = [...set].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
    const result: number[] = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) {
        result.push(-1);
      }
      result.push(p);
    });
    return result;
  }

  goTo(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.page) {
      return;
    }
    this.pageChange.emit(page);
  }
}

/** Search box with icon, clear button and debounced output. */
@Component({
  selector: 'app-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="input-icon">
      <i class="bi bi-search"></i>
      <input #input type="search" class="form-control" [placeholder]="placeholder" [attr.aria-label]="placeholder"
             [value]="value" (input)="onInput(input.value)" (keydown.enter)="flush(input.value)" />
      <button *ngIf="input.value" type="button" class="btn btn-icon btn-sm input-icon-end" (click)="clear(input)" aria-label="Clear search">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search…';
  @Input() value = '';
  @Input() debounce = 350;
  @Output() search = new EventEmitter<string>();

  private input$ = new Subject<string>();
  private sub?: Subscription;
  private lastEmitted = '';

  ngOnInit(): void {
    this.lastEmitted = this.value;
    this.sub = this.input$.pipe(debounceTime(this.debounce), distinctUntilChanged()).subscribe((term) => this.emit(term));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onInput(term: string): void {
    this.input$.next(term);
  }

  flush(term: string): void {
    this.emit(term);
  }

  clear(input: HTMLInputElement): void {
    input.value = '';
    input.focus();
    this.input$.next('');
    this.emit('');
  }

  private emit(term: string): void {
    const trimmed = term.trim();
    if (trimmed !== this.lastEmitted) {
      this.lastEmitted = trimmed;
      this.search.emit(trimmed);
    }
  }
}

/** The single confirmation dialog, driven by ConfirmService. Lives in AppComponent. */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="app-modal-backdrop" *ngIf="request" (click)="cancel()">
      <div class="app-modal" role="alertdialog" aria-modal="true" [attr.aria-labelledby]="'confirm-title'"
           (click)="$event.stopPropagation()">
        <div class="modal-icon" [ngClass]="'tone-' + request.tone"><i class="bi" [ngClass]="'bi-' + request.icon"></i></div>
        <div class="modal-title" id="confirm-title">{{ request.title }}</div>
        <p class="modal-message" *ngIf="request.message">{{ request.message }}</p>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-white" (click)="cancel()">{{ request.cancelText }}</button>
          <button #confirmBtn type="button" class="btn"
                  [ngClass]="request.tone === 'danger' ? 'btn-danger' : request.tone === 'warning' ? 'btn-warning' : 'btn-primary'"
                  (click)="accept()">
            {{ request.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  request: ConfirmRequest | null = null;
  private sub?: Subscription;
  private previouslyFocused: HTMLElement | null = null;

  @ViewChild('confirmBtn') set confirmButton(el: ElementRef<HTMLButtonElement> | undefined) {
    // Focus the action as soon as the dialog renders, for keyboard users.
    if (el) {
      setTimeout(() => el.nativeElement.focus());
    }
  }

  constructor(private confirmService: ConfirmService) {
  }

  ngOnInit(): void {
    this.sub = this.confirmService.request$.subscribe((request) => {
      if (request && !this.request) {
        this.previouslyFocused = document.activeElement as HTMLElement | null;
      }
      if (!request && this.request) {
        setTimeout(() => this.previouslyFocused?.focus?.());
      }
      this.request = request;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  cancel(): void {
    if (this.request) {
      this.confirmService.settle(false);
    }
  }

  accept(): void {
    this.confirmService.settle(true);
  }
}

/** Sun/moon button that flips the colour theme. */
@Component({
  selector: 'app-theme-toggle',
  template: `
    <button type="button" [ngClass]="buttonClass" (click)="theme.toggle()"
            [attr.aria-label]="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            [title]="theme.isDark ? 'Light mode' : 'Dark mode'">
      <i class="bi" [ngClass]="theme.isDark ? 'bi-sun' : 'bi-moon-stars'"></i>
    </button>
  `
})
export class ThemeToggleComponent {
  @Input() buttonClass = 'topbar-btn';

  constructor(public theme: ThemeService) {
  }
}
