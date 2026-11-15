import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';

// Register only the pieces we use (keeps the bundle smaller than `registerables`).
Chart.register(
  BarController, BarElement, LineController, LineElement, PointElement, DoughnutController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
);

export { Chart };

export const CHART_COLORS = {
  primary: '#6366f1',
  primarySoft: 'rgba(99, 102, 241, .15)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  violet: '#a855f7',
  teal: '#14b8a6'
};

/** Reads the current theme's text/grid colours and applies them as Chart.js defaults. */
export function applyChartTheme(): { text: string; grid: string; surface: string } {
  const styles = getComputedStyle(document.documentElement);
  const text = styles.getPropertyValue('--app-muted').trim() || '#64748b';
  const grid = styles.getPropertyValue('--app-border').trim() || '#e6e8ef';
  const surface = styles.getPropertyValue('--app-surface').trim() || '#ffffff';

  Chart.defaults.color = text;
  Chart.defaults.borderColor = grid;
  Chart.defaults.font.family = '"Inter", system-ui, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.tooltip.backgroundColor = '#0f172a';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold' };
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.maintainAspectRatio = false;

  return { text, grid, surface };
}

/** "2026-08" -> "Aug 26"; anything else is returned unchanged. */
export function shortMonthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(month);
  if (!match) {
    return month;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}
