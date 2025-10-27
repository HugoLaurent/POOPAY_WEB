export function applyTheme(theme = "system") {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "light") {
    root.classList.add("light");
    return;
  }

  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }

  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    root.classList.add("dark");
  }
}

