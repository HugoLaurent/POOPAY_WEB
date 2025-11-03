import { useEffect } from "react";

const ADSENSE_ID = import.meta.env.VITE_GOOGLE_ADS_CLIENT || "";

export default function CookieConsent() {
  useEffect(() => {
    const initialize = () => {
      const tac = window.tarteaucitron;
      if (!tac || typeof tac.init !== "function") return false;

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

      if (ADSENSE_ID) {
        tac.user = tac.user || {};
        tac.user.adsenseId = ADSENSE_ID;
        tac.job = tac.job || [];
        if (!tac.job.includes("adsense")) {
          tac.job.push("adsense");
        }
      }
      return true;
    };

    if (!initialize()) {
      const timer = setInterval(() => {
        if (initialize()) {
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }

    return undefined;
  }, []);

  return null;
}
