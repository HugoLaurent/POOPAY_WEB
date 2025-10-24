import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ANIMATION_DURATION = 200;

export default function ConfirmModal({
  isOpen,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  error = "",
  isConfirming = false,
  closeOnBackdrop = true,
  onConfirm,
  onCancel,
  onClose,
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

  const triggerClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const triggerCancel = useCallback(() => {
    if (isConfirming) return;
    onCancel?.();
    triggerClose();
  }, [isConfirming, onCancel, triggerClose]);

  const handleConfirm = useCallback(() => {
    if (isConfirming) {
      return;
    }

    onConfirm?.();
  }, [isConfirming, onConfirm]);

  const handleBackdropClick = useCallback(() => {
    if (!closeOnBackdrop || isConfirming) {
      return;
    }

    triggerCancel();
  }, [closeOnBackdrop, isConfirming, triggerCancel]);

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
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        triggerCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, triggerCancel]);

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div
        role="presentation"
        aria-hidden="true"
        onClick={handleBackdropClick}
        className={`absolute inset-0 bg-black/50 transition-opacity ease-out pointer-events-auto ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative max-w-md w-full rounded-2xl bg-poopay-card text-poopay-text shadow-soft border border-black/5 dark:border-white/10 pointer-events-auto transition-[opacity,transform] ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      >
        <div className="p-6 space-y-4">
          <header className="space-y-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {message ? (
              <p className="text-sm text-poopay-mute leading-relaxed">
                {message}
              </p>
            ) : null}
          </header>

          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-500">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={triggerCancel}
              disabled={isConfirming}
              className="inline-flex items-center justify-center rounded-full border border-poopay-mute/40 px-4 py-2 text-sm font-medium text-poopay-text hover:bg-poopay-bg/60 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConfirming ? "Suppression..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  );
}
