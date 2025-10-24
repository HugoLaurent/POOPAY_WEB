import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ANIMATION_DURATION = 200;
const VARIANT_STYLES = {
  success:
    "bg-green-500 text-white shadow-[0_10px_30px_-12px_rgba(34,197,94,0.65)]",
  error:
    "bg-red-500 text-white shadow-[0_10px_30px_-12px_rgba(239,68,68,0.65)]",
  info: "bg-poopay-card text-poopay-text shadow-soft border border-black/5 dark:border-white/10",
};

export default function Toast({
  isOpen,
  message,
  variant = "success",
  duration = 3000,
  onClose,
}) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef();
  const autoCloseTimeoutRef = useRef();

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
      closeTimeoutRef.current = setTimeout(() => {
        setIsMounted(false);
      }, ANIMATION_DURATION);
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
    if (!isOpen || duration <= 0) {
      return undefined;
    }

    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
    autoCloseTimeoutRef.current = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = undefined;
      }
    };
  }, [duration, isOpen, onClose, message]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = undefined;
      }
    };
  }, []);

  if (!isMounted || !portalTarget) {
    return null;
  }

  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  const isDarkVariant = variant === "success" || variant === "error";
  const closeButtonClass = isDarkVariant
    ? "text-white/70 hover:bg-white/20 hover:text-white"
    : "text-poopay-text/60 hover:bg-poopay-bg/70 hover:text-poopay-text";

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-end px-4 pt-4 sm:px-6 sm:pt-6">
      <div
        role="status"
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ease-out ${variantClass} ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      >
        <span className="mt-0.5 text-sm leading-relaxed">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className={`ml-auto mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs leading-none font-semibold uppercase tracking-wide transition ${closeButtonClass}`}
        >
          x
        </button>
      </div>
    </div>,
    portalTarget
  );
}
