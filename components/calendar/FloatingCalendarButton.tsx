'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { MonthYearPicker } from './MonthYearPicker';

const MONTH_LABELS = [
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

export function FloatingCalendarButton() {
  const selectedMonth = useDashboardStore((s) => s.selectedMonth);
  const selectedYear = useDashboardStore((s) => s.selectedYear);
  const [isOpen, setIsOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const label =
    selectedMonth === 0
      ? `${selectedYear}`
      : `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}`;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
      }}
    >
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: 12,
          }}
        >
          <MonthYearPicker onClose={() => setIsOpen(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        aria-label="Open month and year picker"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          borderRadius: 999,
          background: 'var(--pop-yellow)',
          border: '2.5px solid var(--ink)',
          color: '#1C1C1E',
          fontFamily: 'Cabin, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          boxShadow: isHover
            ? '5px 5px 0px var(--ink)'
            : '3px 3px 0px var(--ink)',
          transform: isHover ? 'translate(-2px, -2px)' : 'translate(0, 0)',
          transition: 'transform 150ms ease, box-shadow 150ms ease',
        }}
      >
        <Calendar size={16} />
        <span>{label}</span>
      </button>
    </div>
  );
}
