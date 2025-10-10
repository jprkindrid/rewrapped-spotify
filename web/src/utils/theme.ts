type ThemeMode = "light" | "dark" | "system";

function getSystemPreference(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme() {
  document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) && getSystemPreference())
  );
}

export function setTheme(mode: ThemeMode) {
  if (mode === "system") {
    localStorage.removeItem("theme");
  } else {
    localStorage.theme = mode;
  }
  applyTheme();
}

export function getTheme(): ThemeMode {
  if (!("theme" in localStorage)) return "system";
  return localStorage.theme as ThemeMode;
}

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function initTheme() {
  applyTheme();

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (!("theme" in localStorage)) {
        applyTheme();
      }
    });
}
