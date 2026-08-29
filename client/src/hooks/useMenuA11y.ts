import { useEffect } from "react";

/**
 * Shared behaviour for an open overlay menu / drawer:
 * - locks body scroll while open
 * - closes on Escape
 * - closes on pointer-down outside `containerRef` (when provided)
 */
export function useMenuA11y(
  open: boolean,
  onClose: () => void,
  containerRef?: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      const el = containerRef?.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    if (containerRef) document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (containerRef) document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, containerRef]);
}
