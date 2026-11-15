import { Pipe, PipeTransform } from '@angular/core';

/** 12500 -> "LKR 12,500.00" (or "LKR 12,500" with digits = 0). */
@Pipe({ name: 'lkr' })
export class LkrPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 2): string {
    const amount = Number(value ?? 0);
    return 'LKR ' + amount.toLocaleString('en-LK', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }
}

interface Schedulable {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

/** Class schedule -> "Mon · 16:00–18:00" (short) or "Monday · 16:00–18:00". */
@Pipe({ name: 'schedule' })
export class SchedulePipe implements PipeTransform {
  transform(value: Schedulable | null | undefined, format: 'short' | 'long' = 'short'): string {
    if (!value) {
      return '';
    }
    const day = value.dayOfWeek.charAt(0) + value.dayOfWeek.slice(1).toLowerCase();
    const dayLabel = format === 'short' ? day.slice(0, 3) : day;
    return `${dayLabel} · ${(value.startTime ?? '').slice(0, 5)}–${(value.endTime ?? '').slice(0, 5)}`;
  }
}

/** "MONDAY" -> "Monday", "BANK_TRANSFER" -> "Bank transfer". */
@Pipe({ name: 'humanize' })
export class HumanizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const text = value.replace(/_/g, ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

/** ISO date/time -> "just now", "5 min ago", "3 days ago", or a date for older items. */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    const seconds = Math.round((Date.now() - date.getTime()) / 1000);
    if (isNaN(seconds)) {
      return '';
    }
    if (seconds < 60) {
      return 'just now';
    }
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min ago`;
    }
    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    }
    const days = Math.round(hours / 24);
    if (days < 7) {
      return days === 1 ? 'yesterday' : `${days} days ago`;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

/** Safe percentage: (part / whole) * 100, 0 when whole is 0. */
@Pipe({ name: 'percentOf' })
export class PercentOfPipe implements PipeTransform {
  transform(part: number | null | undefined, whole: number | null | undefined): number {
    const w = Number(whole ?? 0);
    if (!w) {
      return 0;
    }
    return Math.max(0, Math.min(100, (Number(part ?? 0) / w) * 100));
  }
}
