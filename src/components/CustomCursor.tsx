import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    const moveCursor = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      gsap.to(dot, {
        x,
        y,
        duration: 0.1,
        ease: 'power2.out'
      });

      gsap.to(ring, {
        x,
        y,
        duration: 0.35,
        ease: 'power2.out'
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, [role="button"]')) {
        gsap.to(ring, {
          scale: 1.8,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          duration: 0.25
        });
        gsap.to(dot, {
          scale: 0.5,
          backgroundColor: '#06b6d4',
          duration: 0.25
        });
      } else {
        gsap.to(ring, {
          scale: 1,
          borderColor: 'rgba(129, 140, 248, 0.4)',
          backgroundColor: 'transparent',
          duration: 0.25
        });
        gsap.to(dot, {
          scale: 1,
          backgroundColor: '#818cf8',
          duration: 0.25
        });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Inner Dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-indigo-400 rounded-full pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
      {/* Outer Ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-8 h-8 border border-indigo-400/40 rounded-full pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 hidden md:block transition-colors"
      />
    </>
  );
};
