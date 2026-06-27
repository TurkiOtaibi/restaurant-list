"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type VirtualListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string;
  // ClassName applied to the wrapper in the non-windowed path so existing layout
  // (grid/gap) is preserved exactly. Small lists therefore render identically to
  // a plain map() and incur no behavioural change.
  className?: string;
  // Inter-row gap (px) used only by the windowed path to keep scroll math and
  // visual spacing consistent with the original grid gap.
  gap?: number;
  estimateHeight?: number;
  overscan?: number;
  // Lists at or below this size render fully (no windowing). Windowing only
  // engages for large collections, where limiting the DOM matters.
  threshold?: number;
  ariaLabel?: string;
};

// A document-scroll windowing list. It renders only the rows near the viewport
// plus an overscan buffer, using spacer blocks to preserve total scroll height,
// and measures real row heights so variable-height (e.g. two-line) rows stay
// correctly positioned. Below `threshold` items it renders everything, so
// small and medium collections behave exactly as before.
export function VirtualList<T>({
  items,
  renderItem,
  getKey,
  className,
  gap = 0,
  estimateHeight = 72,
  overscan = 6,
  threshold = 40,
  ariaLabel
}: VirtualListProps<T>) {
  const windowed = items.length > threshold;

  if (!windowed) {
    return (
      <div aria-label={ariaLabel} className={className}>
        {items.map((item, index) => (
          <div key={getKey(item, index)}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <WindowedList
      ariaLabel={ariaLabel}
      estimateHeight={estimateHeight}
      gap={gap}
      getKey={getKey}
      items={items}
      overscan={overscan}
      renderItem={renderItem}
    />
  );
}

function WindowedList<T>({
  items,
  renderItem,
  getKey,
  gap = 0,
  estimateHeight = 72,
  overscan = 6,
  ariaLabel
}: Omit<VirtualListProps<T>, "threshold" | "className">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heightsRef = useRef<Map<string, number>>(new Map());
  const [range, setRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [, forceTick] = useState(0);

  const rowHeight = useCallback(
    (index: number) => heightsRef.current.get(getKey(items[index], index)) ?? estimateHeight,
    [estimateHeight, getKey, items]
  );

  // Cumulative offset (including gaps) of a given row index.
  const offsetOf = useCallback(
    (index: number) => {
      let offset = 0;
      for (let i = 0; i < index; i += 1) {
        offset += rowHeight(i) + gap;
      }
      return offset;
    },
    [gap, rowHeight]
  );

  const totalHeight = useCallback(() => {
    let total = 0;
    for (let i = 0; i < items.length; i += 1) {
      total += rowHeight(i) + gap;
    }
    return total > 0 ? total - gap : 0;
  }, [gap, items.length, rowHeight]);

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const viewportTop = -rect.top;
    const viewportBottom = viewportTop + window.innerHeight;

    let start = 0;
    let acc = 0;
    while (start < items.length && acc + rowHeight(start) + gap <= viewportTop) {
      acc += rowHeight(start) + gap;
      start += 1;
    }

    let end = start;
    let bottom = acc;
    while (end < items.length && bottom <= viewportBottom) {
      bottom += rowHeight(end) + gap;
      end += 1;
    }

    const nextStart = Math.max(0, start - overscan);
    const nextEnd = Math.min(items.length, end + overscan);
    setRange((prev) =>
      prev.start === nextStart && prev.end === nextEnd ? prev : { start: nextStart, end: nextEnd }
    );
  }, [gap, items.length, overscan, rowHeight]);

  useEffect(() => {
    recompute();
    let frame = 0;
    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        recompute();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [recompute]);

  // Re-run the window calculation when the item set changes.
  useEffect(() => {
    recompute();
  }, [items, recompute]);

  const measure = useCallback(
    (key: string, element: HTMLElement | null) => {
      if (!element) {
        return;
      }
      const height = element.getBoundingClientRect().height;
      if (height > 0 && Math.abs((heightsRef.current.get(key) ?? 0) - height) > 0.5) {
        heightsRef.current.set(key, height);
        forceTick((value) => value + 1);
        recompute();
      }
    },
    [recompute]
  );

  const safeEnd = Math.min(items.length, Math.max(range.end, range.start + 1));
  const visible = items.slice(range.start, safeEnd);
  const topPad = offsetOf(range.start);
  const bottomPad = Math.max(0, totalHeight() - offsetOf(safeEnd));

  return (
    <div aria-label={ariaLabel} ref={containerRef}>
      <div aria-hidden="true" style={{ height: topPad }} />
      {visible.map((item, localIndex) => {
        const index = range.start + localIndex;
        const key = getKey(item, index);
        return (
          <div key={key} ref={(element) => measure(key, element)} style={{ marginBottom: gap }}>
            {renderItem(item, index)}
          </div>
        );
      })}
      <div aria-hidden="true" style={{ height: bottomPad }} />
    </div>
  );
}
