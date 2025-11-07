import { useCallback, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { applyTheme } from "@/utils/theme";

export { applyTheme };

export function useTheme() {
  const { user, updateUser } = useAuthContext();
  const theme = user?.theme ?? "light";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback(
    (nextTheme) => {
      applyTheme(nextTheme);
      updateUser((prev) => {
        if (!prev) return prev;
        return { ...prev, theme: nextTheme };
      });
    },
    [updateUser]
  );

  return { theme, setTheme };
}

