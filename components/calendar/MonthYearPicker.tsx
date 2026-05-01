'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';

interface MonthYearPickerProps {
  onClose: () => void;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MIN_YEAR = 2020;
const MAX_YEAR = 2026;

export function MonthYearPicker({ onClose }: MonthYearPickerProps) {
  const selectedMonth = useDashboardStore((s) => s.selectedMonth);
  const selectedYear = useDashboardStore((s) => s.selectedYear);
  const setSelectedMonth = useDashboardStore((s) => s.setSelectedMonth);
  const setSelectedYear = useDashboardStore((s) => s.setSelectedYear);
  const resetCalendarFilter = useDashboardStore((s) => s.resetCalendarFilter);

  const canDecrement = selectedYear > MIN_YEAR;
  const canIncrement = selectedYear < MAX_YEAR;

  function handleMonthClick(monthNumber: number) {
    setSelectedMonth(monthNumber);
    setSelectedYear(selectedYear);
    onClose();
  }

  function handleReset() {
    resetCalendarFilter();
    onClose();
  }

  return (
    <div
      style={{
        width: 260,
        padding: 16,
        background: 'var(--surface)',
        border: '2.5px solid var(--ink)',
        borderRadius: 14,
        boxShadow: '6px 6px 0px var(--ink)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          onClick={() => canDecrement && setSelectedYear(selectedYear - 1)}
          disabled={!canDecrement}
          aria-label="Previous year"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            background: 'transparent',
            border: 'none',
            color: 'var(--ink)',
            cursor: canDecrement ? 'pointer' : 'not-allowed',
            opacity: canDecrement ? 1 : 0.3,
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <span
          className="font-marker"
          style={{
            fontSize: '1.2rem',
            color: 'var(--ink)',
            lineHeight: 1,
          }}
        >
          {selectedYear}
        </span>

        <button
          type="button"
          onClick={() => canIncrement && setSelectedYear(selectedYear + 1)}
          disabled={!canIncrement}
          aria-label="Next year"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            background: 'transparent',
            border: 'none',
            color: 'var(--ink)',
            cursor: canIncrement ? 'pointer' : 'not-allowed',
            opacity: canIncrement ? 1 : 0.3,
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          marginBottom: 14,
        }}
      >
        {MONTHS.map((label, index) => {
          const monthNumber = index + 1;
          const isSelected = monthNumber === selectedMonth;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleMonthClick(monthNumber)}
              style={{
                fontFamily: 'Cabin, system-ui, sans-serif',
                fontWeight: isSelected ? 700 : 600,
                fontSize: 12,
                padding: '8px 4px',
                borderRadius: 10,
                border: isSelected
                  ? '1.5px solid var(--ink)'
                  : '1.5px solid transparent',
                background: isSelected ? 'var(--pop-red)' : 'transparent',
                color: isSelected ? '#FFFFFF' : 'var(--ink-muted)',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--ink-faint)';
                  e.currentTarget.style.color = 'var(--ink)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = 'var(--ink-muted)';
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: '2.5px solid var(--ink)',
          borderRadius: 14,
          fontFamily: 'Cabin, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 12,
          textTransform: 'uppercase',
          color: 'var(--ink)',
          cursor: 'pointer',
        }}
      >
        Show All Year
      </button>
    </div>
  );
}
