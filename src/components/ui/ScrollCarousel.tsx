'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './ScrollCarousel.module.css';

interface ScrollCarouselProps {
  children: React.ReactNode;
  /** Horizontal padding before first / after last item */
  gap?: number;
  sidePadding?: number;
  showDots?: boolean;
  /** Rough card width to calculate dot count */
  itemWidth?: number;
  className?: string;
}

export default function ScrollCarousel({
  children,
  gap = 12,
  sidePadding = 16,
  showDots = false,
  itemWidth = 140,
  className = '',
}: ScrollCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Count children for dots
  useEffect(() => {
    if (trackRef.current) {
      setTotalItems(trackRef.current.children.length);
    }
  }, [children]);

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);

    // Calculate active dot
    const scrollable = el.scrollWidth - el.clientWidth;
    const dots = Math.max(1, el.children.length - 1);
    setActiveIndex(Math.round((el.scrollLeft / scrollable) * dots));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateState, { passive: true });
    updateState();
    return () => el.removeEventListener('scroll', updateState);
  }, [updateState]);

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = itemWidth + gap;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const dotCount = Math.max(1, totalItems);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => scroll('left')}
          aria-label="Cuộn trái"
        >
          ‹
        </button>
      )}

      {/* Fade edges */}
      <div className={`${styles.fade} ${styles.fadeLeft} ${canScrollLeft ? styles.visible : ''}`} />
      <div className={`${styles.fade} ${styles.fadeRight} ${canScrollRight ? styles.visible : ''}`} />

      {/* Scroll track */}
      <div
        ref={trackRef}
        className={styles.track}
        style={{
          gap,
          paddingLeft: sidePadding,
          paddingRight: sidePadding,
        }}
      >
        {children}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => scroll('right')}
          aria-label="Cuộn phải"
        >
          ›
        </button>
      )}

      {/* Dots */}
      {showDots && dotCount > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: Math.min(dotCount, 8) }).map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
