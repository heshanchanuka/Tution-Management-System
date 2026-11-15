import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'tcms_theme';

/**
 * Light/dark theme. index.html applies the saved (or OS) theme before Angular
 * boots; this service keeps it in sync and lets the user toggle it.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private modeSubject = new BehaviorSubject<ThemeMode>(this.readInitial());
  readonly mode$ = this.modeSubject.asObservable();

  get mode(): ThemeMode {
    return this.modeSubject.value;
  }

  get isDark(): boolean {
    return this.mode === 'dark';
  }

  toggle(): void {
    this.set(this.isDark ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-bs-theme', mode);
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      // Storage unavailable (private mode) - theme still applies for this visit.
    }
    this.modeSubject.next(mode);
  }

  private readInitial(): ThemeMode {
    const attr = document.documentElement.getAttribute('data-bs-theme');
    return attr === 'dark' ? 'dark' : 'light';
  }
}
