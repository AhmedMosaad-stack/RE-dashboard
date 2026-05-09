'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Calendar } from 'lucide-react';

const MonthYearPicker = dynamic(
  () => import('./MonthYearPicker').then((m) => m.MonthYearPicker),
  { ssr: false },
);

const BTN_SIZE = 52; // px — diameter of the button
const EDGE_MARGIN = 16; // px — gap from viewport edges
const DRAG_THRESHOLD = 6; // px — movement before a press becomes a drag

interface Pos {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function FloatingCalendarButton() {
  // Start at bottom-right corner (set after mount to avoid SSR crash)
  const [pos, setPos] = useState<Pos | null>(null);

  useEffect(() => {
    setPos({
      x: window.innerWidth - BTN_SIZE - EDGE_MARGIN,
      y: window.innerHeight - BTN_SIZE - EDGE_MARGIN - 80,
    });
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    active: false,
    startPointerX: 0,
    startPointerY: 0,
    startBtnX: 0,
    startBtnY: 0,
    moved: false,
  });
  const posRef = useRef<Pos>({ x: 0, y: 0 });
  if (pos) posRef.current = pos;

  // ─── Close picker on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // ─── Snap to nearest vertical edge ───────────────────────────────────────
  const snapToEdge = useCallback((currentPos: Pos) => {
    setIsSnapping(true);
    const midX = window.innerWidth / 2;
    const snappedX =
      currentPos.x + BTN_SIZE / 2 < midX
        ? EDGE_MARGIN
        : window.innerWidth - BTN_SIZE - EDGE_MARGIN;
    const snappedY = clamp(
      currentPos.y,
      EDGE_MARGIN,
      window.innerHeight - BTN_SIZE - EDGE_MARGIN,
    );
    setPos({ x: snappedX, y: snappedY });
    setTimeout(() => setIsSnapping(false), 320);
  }, []);

  // ─── Pointer events ───────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startBtnX: posRef.current.x,
      startBtnY: posRef.current.y,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startPointerX;
    const dy = e.clientY - dragRef.current.startPointerY;

    if (!dragRef.current.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragRef.current.moved = true;
      setIsDragging(true);
      setIsOpen(false); // close picker while dragging
    }

    if (dragRef.current.moved) {
      setPos({
        x: clamp(
          dragRef.current.startBtnX + dx,
          EDGE_MARGIN,
          window.innerWidth - BTN_SIZE - EDGE_MARGIN,
        ),
        y: clamp(
          dragRef.current.startBtnY + dy,
          EDGE_MARGIN,
          window.innerHeight - BTN_SIZE - EDGE_MARGIN,
        ),
      });
    }
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    setIsDragging(false);

    if (wasDrag) {
      snapToEdge(posRef.current);
    } else {
      // It was a tap/click
      setIsOpen((o) => !o);
    }
  }, [snapToEdge]);

  // ─── Picker opens on the side with more room ──────────────────────────────
  const onRightSide = pos
    ? pos.x + BTN_SIZE / 2 > window.innerWidth / 2
    : true;

  if (!pos) return null; // not mounted yet

  const pickerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    ...(onRightSide
      ? { right: BTN_SIZE + 12 }
      : { left: BTN_SIZE + 12 }),
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: BTN_SIZE,
        height: BTN_SIZE,
        zIndex: 9999,
        transition: isSnapping ? 'left 300ms cubic-bezier(.4,0,.2,1), top 300ms cubic-bezier(.4,0,.2,1)' : 'none',
        userSelect: 'none',
      }}
    >
      {/* Picker popup */}
      {isOpen && (
        <div style={pickerStyle}>
          <MonthYearPicker onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Draggable button */}
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        aria-label="Open month and year picker"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: 999,
          background: 'var(--pop-yellow)',
          border: '2.5px solid var(--ink)',
          color: '#1C1C1E',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isHover && !isDragging
            ? '5px 5px 0px var(--ink)'
            : '3px 3px 0px var(--ink)',
          transform: isHover && !isDragging ? 'scale(1.08)' : 'scale(1)',
          transition: isDragging
            ? 'none'
            : 'transform 150ms ease, box-shadow 150ms ease',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
      >
        <Calendar size={20} />
      </button>
    </div>
  );
}
