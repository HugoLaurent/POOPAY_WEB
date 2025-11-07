import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ConfidentialitePermissions from "@/pages/SettingsComponents/ConfidentialitePermissions.jsx";

const PrivacyModalContext = createContext(null);

export function PrivacyModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
    }),
    [isOpen, open, close]
  );

  return (
    <PrivacyModalContext.Provider value={value}>
      {children}
      <ConfidentialitePermissions isOpen={isOpen} onClose={close} />
    </PrivacyModalContext.Provider>
  );
}

export function usePrivacyModal() {
  const ctx = useContext(PrivacyModalContext);
  if (!ctx) {
    throw new Error("usePrivacyModal must be used within a PrivacyModalProvider");
  }
  return ctx;
}
