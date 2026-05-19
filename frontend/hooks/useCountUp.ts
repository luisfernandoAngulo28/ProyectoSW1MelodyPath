import { useEffect, useRef, useState } from "react";

/**
 * Animated counter that goes from 0 → target over `duration` ms.
 * Only starts when `trigger` becomes true (useful to wait for data to load).
 */
export function useCountUp(
  target: number,
  duration = 1400,
  trigger = true
): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (target === 0) { setCount(0); return; }

    // Reset on each new target
    setCount(0);
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, trigger]);

  return count;
}
