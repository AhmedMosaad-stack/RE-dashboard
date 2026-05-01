import { format, formatDistanceToNow } from 'date-fns';
import numeral from 'numeral';

export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${numeral(amount).format('0.0a').toUpperCase()}`;
  }
  return `$${numeral(amount).format('0,0')}`;
}

export function formatNumber(num: number): string {
  if (Math.abs(num) >= 1000) {
    return numeral(num).format('0.0a').toUpperCase();
  }
  return numeral(num).format('0,0');
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatPercentChange(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}
