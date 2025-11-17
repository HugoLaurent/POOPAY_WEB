import { useCallback, useEffect, useRef, useState } from "react";

import Toast from "./Toast.jsx";
import { api } from "@/api";
import { useAuthContext } from "@/context/AuthContext.jsx";

const ADSENSE_ID = import.meta.env.VITE_GOOGLE_ADS_CLIENT || "";
const BANNER_VERSION = import.meta.env.VITE_COOKIE_BANNER_VERSION || "v1";
const CONSENT_QUEUE_KEY = "poopay_cookie_consent_queue";
const RETRY_INITIAL_DELAY = 2000;
const RETRY_MAX_DELAY = 30000;

function getDeviceType() {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "mobile";
  if (/iphone|ipad|ipod/i.test(ua)) return "mobile";
  if (navigator.userAgentData?.mobile) return "mobile";
  if (/mobi/i.test(ua)) return "mobile";
  return "desktop";
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `consent_${Math.random().toString(36).slice(2, 10)}`;
}

function readConsentQueue() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONSENT_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistConsentQueue(queue) {
  if (typeof window === "undefined") return;
  try {
    if (!queue || queue.length === 0) {
      localStorage.removeItem(CONSENT_QUEUE_KEY);
    } else {
      localStorage.setItem(CONSENT_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch {
    // Ignore persistence failures (private mode, etc.).
  }
}

function getConsentCookieSnapshot(tac) {
  if (typeof document === "undefined") return null;
  const cookieName = tac?.parameters?.cookieName;
  if (!cookieName) return null;
  const cookieSegment = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  if (!cookieSegment) return null;
  return cookieSegment.split("=")[1] || null;
}

function gatherServiceKeys(tac) {
  const job = Array.isArray(tac?.job) ? tac.job : [];
  const stateKeys = tac?.state ? Object.keys(tac.state) : [];
  return Array.from(new Set([...job, ...stateKeys])).filter(Boolean);
}

function buildConsentPayload(tacInstance) {
  if (typeof window === "undefined") return null;
  const tac = tacInstance || window.tarteaucitron;
  if (!tac) return null;
  const serviceKeys = gatherServiceKeys(tac);
  if (serviceKeys.length === 0) return null;

  const states = tac.state || {};
  const decidedKeys = serviceKeys.filter(
    (key) => states[key] === true || states[key] === false
  );
  const acceptedServices = decidedKeys.filter((key) => states[key] === true);

  let decision = "custom";
  if (decidedKeys.length && acceptedServices.length === decidedKeys.length) {
    decision = "accept";
  } else if (acceptedServices.length === 0) {
    decision = "deny";
  }

  const consentId = tac.uuid || getConsentCookieSnapshot(tac) || generateId();

  return {
    type: "cookie_banner",
    grantedAt: new Date().toISOString(),
    metadata: {
      provider: "tarteaucitron",
      decision,
      consentId,
      bannerVersion: BANNER_VERSION,
      acceptedServices,
      device: getDeviceType(),
      locale:
        typeof navigator !== "undefined" && navigator.language
          ? navigator.language
          : "fr",
    },
  };
}

export default function CookieConsent() {
  const { token, logout } = useAuthContext();
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    variant: "error",
  });
  const queueRef = useRef(readConsentQueue());
  const isSyncingRef = useRef(false);
  const retryDelayRef = useRef(RETRY_INITIAL_DELAY);
  const retryTimerRef = useRef(null);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showToast = useCallback((message, variant = "error") => {
    setToast({ isOpen: true, message, variant });
  }, []);

  const initializeTarteAuCitron = useCallback(() => {
    if (typeof window === "undefined") return false;
    const tac = window.tarteaucitron;
    if (!tac || typeof tac.init !== "function") return false;

    // --- Déclaration du service Umami (mesure d'audience) ---
    tac.services = tac.services || {};
    tac.services.umami = {
      key: "umami",
      type: "analytic",
      name: "Umami Analytics",
      needConsent: true,
      cookies: [],
      js: function () {
        const script = document.createElement("script");
        script.defer = true;
        script.src = "https://cloud.umami.is/script.js";
        script.setAttribute(
          "data-website-id",
          "32518c22-7104-4efd-a2aa-92a83168b7ab"
        );
        document.head.appendChild(script);
      },
      fallback: function () {
        // Rien à nettoyer : Umami ne pose pas de cookies côté client
      },
    };

    tac.init({
      privacyUrl: "",
      bodyPosition: "bottom",
      hashtag: "#poopay-cookies",
      cookieName: "poopay_cookie_consent",
      orientation: "bottom",
      showAlertSmall: false,
      cookieslist: true,
      acceptAllCta: true,
      highPrivacy: true,
      handleBrowserDNTRequest: true,
      removeCredit: true,
      moreInfoLink: true,
      useExternalCss: false,
      useExternalJs: false,
      mandatory: true,
    });

    // --- AdSense (si configuré) ---
    if (ADSENSE_ID) {
      tac.user = tac.user || {};
      tac.user.adsenseId = ADSENSE_ID;
      tac.job = tac.job || [];
      if (!tac.job.includes("adsense")) {
        tac.job.push("adsense");
      }
    }

    // --- Ajout du job Umami pour la mesure d'audience ---
    tac.user = tac.user || {};
    tac.job = tac.job || [];
    tac.user.umami = true;
    if (!tac.job.includes("umami")) {
      tac.job.push("umami");
    }

    return true;
  }, []);

  const sendConsentEntry = useCallback(
    async (entry) => {
      if (!token) return { ok: false, retry: false };
      try {
        await api("/consents", {
          method: "POST",
          body: entry.payload,
          token,
        });
        return { ok: true };
      } catch (error) {
        const status = error?.status;

        if (status === 401) {
          logout?.({ notifyServer: false });
          return { ok: false, remove: true };
        }
        if (status === 422) {
          showToast("Impossible d’enregistrer ce consentement.", "error");
          return { ok: false, remove: true };
        }
        if (status >= 500) {
          console.error("Consent sync failed (server error)", error);
          window?.Sentry?.captureException?.(error);
          return { ok: false, retry: true };
        }

        console.error("Consent sync failed", error);
        return { ok: false, retry: true };
      }
    },
    [logout, showToast, token]
  );

  const flushQueue = useCallback(async () => {
    if (!token || isSyncingRef.current || queueRef.current.length === 0) {
      return queueRef.current.length === 0 ? "done" : "idle";
    }
    isSyncingRef.current = true;

    while (queueRef.current.length) {
      const [entry] = queueRef.current;
      const result = await sendConsentEntry(entry);

      if (result.ok || result.remove) {
        queueRef.current = queueRef.current.slice(1);
        persistConsentQueue(queueRef.current);
        continue;
      }

      isSyncingRef.current = false;
      return "retry";
    }

    isSyncingRef.current = false;
    return "done";
  }, [sendConsentEntry, token]);

  const resetRetry = useCallback(() => {
    retryDelayRef.current = RETRY_INITIAL_DELAY;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback(() => {
    if (retryTimerRef.current) return;
    const delay = retryDelayRef.current || RETRY_INITIAL_DELAY;
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      retryDelayRef.current = Math.min(delay * 2, RETRY_MAX_DELAY);
      flushQueue();
    }, delay);
  }, [flushQueue]);

  const drainQueue = useCallback(async () => {
    const status = await flushQueue();
    if (status === "retry") {
      scheduleRetry();
    } else if (status === "done") {
      resetRetry();
    }
  }, [flushQueue, resetRetry, scheduleRetry]);

  const enqueueConsent = useCallback((payload) => {
    if (!payload) return;
    const consentId = payload?.metadata?.consentId || generateId();
    const entry = {
      id: consentId,
      payload: {
        ...payload,
        metadata: {
          ...payload.metadata,
          consentId,
        },
      },
      createdAt: payload?.grantedAt || new Date().toISOString(),
    };
    queueRef.current = [...queueRef.current, entry];
    persistConsentQueue(queueRef.current);
  }, []);

  const handleConsentDecision = useCallback(() => {
    const payload = buildConsentPayload();
    if (!payload) return;
    enqueueConsent(payload);
    drainQueue();
  }, [drainQueue, enqueueConsent]);

  useEffect(() => {
    let initialized = initializeTarteAuCitron();
    if (!initialized) {
      const timer = setInterval(() => {
        initialized = initializeTarteAuCitron();
        if (initialized) {
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [initializeTarteAuCitron]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.addEventListener("tac.consent_updated", handleConsentDecision);
    return () => {
      document.removeEventListener(
        "tac.consent_updated",
        handleConsentDecision
      );
    };
  }, [handleConsentDecision]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const tac = window.tarteaucitron;
    const supportedEvents =
      tac?.events && typeof tac.events.on === "function"
        ? ["acceptAll", "accept", "denyAll", "deny", "personalize"]
        : [];

    supportedEvents.forEach((eventName) => {
      try {
        tac.events.on(eventName, handleConsentDecision);
      } catch (err) {
        console.warn(`Unable to register ${eventName} handler`, err);
      }
    });

    return () => {
      if (!supportedEvents.length) return;
      if (typeof tac?.events?.off === "function") {
        supportedEvents.forEach((eventName) => {
          tac.events.off(eventName, handleConsentDecision);
        });
      }
    };
  }, [handleConsentDecision]);

  useEffect(() => {
    if (token) {
      drainQueue();
    }
  }, [token, drainQueue]);

  useEffect(
    () => () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    },
    []
  );

  return (
    <>
      {toast.isOpen && (
        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          variant={toast.variant}
          onClose={closeToast}
        />
      )}
    </>
  );
}
