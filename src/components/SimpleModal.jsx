import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ANIMATION_DURATION = 300;

export default function SimpleModal({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
  className = "",
}) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef();

  const portalTarget = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    return document.getElementById("modal-root") ?? document.body;
  }, []);

  useEffect(() => {
    if (!portalTarget) {
      return undefined;
    }

    let rafId = null;
    let rafIdDelayed = null;

    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
      setIsMounted(true);
      rafId = requestAnimationFrame(() => {
        rafIdDelayed = requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      closeTimeoutRef.current = setTimeout(
        () => setIsMounted(false),
        ANIMATION_DURATION
      );
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (rafIdDelayed) {
        cancelAnimationFrame(rafIdDelayed);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
    };
  }, [isOpen, portalTarget]);

  useEffect(() => {
    if (!isMounted || typeof document === "undefined") {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, onClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
    };
  }, []);

  if (!isMounted || !portalTarget) {
    return null;
  }

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose?.();
    }
  };

  return createPortal(
    <div className="fixed  inset-0 z-50 flex flex-col justify-end pointer-events-none">
      <div
        role="presentation"
        aria-hidden="true"
        onClick={handleBackdropClick}
        className={`absolute inset-0 transition-opacity duration-300 ease-out pointer-events-auto bg-poopay-bg/70 dark:bg-black/60 supports-[backdrop-filter]:backdrop-blur-sm ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-h-[90vh] overflow-y-auto bg-poopay-card text-poopay-text shadow-soft border border-black/5 dark:border-white/10 transition-transform duration-300 ease-out pointer-events-auto ${
          isVisible ? "translate-y-0" : "translate-y-full"
        } ${className}`}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      >
        {children}
      </div>
    </div>,
    portalTarget
  );
}
