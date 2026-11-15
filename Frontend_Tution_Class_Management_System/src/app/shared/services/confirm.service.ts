import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** danger = destructive action (red), primary = normal confirmation. */
  tone?: 'danger' | 'primary' | 'warning';
  /** Bootstrap Icons name without the "bi-" prefix. */
  icon?: string;
}

export interface ConfirmRequest extends Required<Omit<ConfirmOptions, 'message'>> {
  message: string;
  resolve: (result: boolean) => void;
}

/**
 * Promise-based confirmation dialog, rendered once by <app-confirm-dialog> in
 * the root component:
 *
 *   if (await this.confirm.ask({ title: 'Delete class?', tone: 'danger' })) { ... }
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  private requestSubject = new BehaviorSubject<ConfirmRequest | null>(null);
  readonly request$ = this.requestSubject.asObservable();

  ask(options: ConfirmOptions): Promise<boolean> {
    // Settle any dialog that is still open, so its caller isn't left hanging.
    this.requestSubject.value?.resolve(false);

    const tone = options.tone ?? 'danger';
    return new Promise<boolean>((resolve) => {
      this.requestSubject.next({
        title: options.title,
        message: options.message ?? '',
        confirmText: options.confirmText ?? (tone === 'danger' ? 'Delete' : 'Confirm'),
        cancelText: options.cancelText ?? 'Cancel',
        tone,
        icon: options.icon ?? (tone === 'danger' ? 'trash3' : 'question-circle'),
        resolve
      });
    });
  }

  /** Called by the dialog component. */
  settle(result: boolean): void {
    const current = this.requestSubject.value;
    if (current) {
      this.requestSubject.next(null);
      current.resolve(result);
    }
  }
}
