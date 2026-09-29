"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("precedent-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("precedent-theme", "dark");
    }
  };

  if (!mounted) {
    return <div className="w-10 h-10" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="inline-flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-full text-text-2 hover:text-text hover:bg-surface-2 transition-colors focus-visible:outline-action"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 stroke-[1.5]" />
      ) : (
        <Moon className="w-4 h-4 stroke-[1.5]" />
      )}
    </button>
  );
}
