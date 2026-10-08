export type ThemePref = "system" | "light" | "dark";

export const resolveTheme = (pref: ThemePref, prefersDark: boolean): "light" | "dark" =>
  pref === "system" ? (prefersDark ? "dark" : "light") : pref;

/** Runs in <head> before paint: applies .dark from the persisted pref so there's no light flash. */
export const THEME_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("grow-ui")||"{}").state||{};var t=p.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
