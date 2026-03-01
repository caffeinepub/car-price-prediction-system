import { useCallback } from 'react';

/**
 * Returns an event handler that adds the `.icon-dance` CSS class to the
 * nearest icon element inside the event target, then removes it after the
 * animation completes (~650 ms).  Works for both click and touchstart events.
 *
 * Usage:
 *   const handleDance = useIconDance();
 *   <button onClick={handleDance}><SomeIcon /></button>
 *
 * Or pass a ref directly:
 *   const ref = useRef<HTMLElement>(null);
 *   const handleDance = useIconDance();
 *   <SomeIcon ref={ref} onClick={() => handleDance(null, ref.current)} />
 */
export function useIconDance() {
  const triggerDance = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent | null,
      targetEl?: HTMLElement | SVGElement | null,
    ) => {
      const el: Element | null =
        targetEl ??
        (event?.currentTarget as Element | null) ??
        null;

      if (!el) return;

      // Find the SVG icon inside the element (or use the element itself if it is an SVG)
      const icon: Element | null =
        el.tagName.toLowerCase() === 'svg'
          ? el
          : el.querySelector('svg') ?? el;

      if (!icon) return;

      // Prevent overlapping animations
      if (icon.classList.contains('icon-dance')) return;

      icon.classList.add('icon-dance');

      const cleanup = () => {
        icon.classList.remove('icon-dance');
        icon.removeEventListener('animationend', cleanup);
      };

      icon.addEventListener('animationend', cleanup, { once: true });

      // Safety fallback in case animationend never fires
      setTimeout(() => {
        icon.classList.remove('icon-dance');
      }, 800);
    },
    [],
  );

  return triggerDance;
}
