import { useEffect, useRef } from "react";

const SCRIPT_ID = "google-adsbygoogle-script";

const loadGoogleAdsScript = (client) => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    if (existing.dataset.loaded === "true") {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
};

const GoogleAd = ({
  slot = import.meta.env.VITE_GOOGLE_ADS_SLOT,
  format = "auto",
  layout = "",
  layoutKey = "",
  className = "",
  style,
}) => {
  const adRef = useRef(null);
  const client = import.meta.env.VITE_GOOGLE_ADS_CLIENT;
  const isTestMode = import.meta.env.MODE !== "production";

  useEffect(() => {
    if (typeof window === "undefined" || !client || !slot || !adRef.current) {
      return;
    }

    let cancelled = false;

    loadGoogleAdsScript(client)
      .then(() => {
        if (cancelled || !adRef.current) {
          return;
        }

        if (adRef.current.getAttribute("data-adsbygoogle-status")) {
          adRef.current.innerHTML = "";
          adRef.current.removeAttribute("data-adsbygoogle-status");
        }

        try {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        } catch (err) {
          console.warn("Google AdSense inject error", err);
        }
      })
      .catch((err) => {
        console.error("Google AdSense script failed to load", err);
      });

    return () => {
      cancelled = true;
    };
  }, [client, slot]);

  if (!client || !slot) {
    return (
      <div
        className={`rounded-3xl bg-poopay-card shadow-soft px-5 py-6 text-center text-sm text-poopay-mute ${className}`}
      >
        Configurez vos identifiants Google AdSense pour afficher une publicite.
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl bg-poopay-card shadow-soft px-5 py-4 ${className}`}
    >
      <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-poopay-mute">
        Publicite
      </span>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", ...(style || {}) }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-ad-layout={layout || undefined}
        data-ad-layout-key={layoutKey || undefined}
        data-adtest={isTestMode ? "on" : undefined}
        ref={adRef}
      />
    </div>
  );
};

export default GoogleAd;

