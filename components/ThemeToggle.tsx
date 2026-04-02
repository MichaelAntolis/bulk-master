"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full bg-border/20 opacity-50 flex-shrink-0 shadow-inner"></div>;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-border/10 hover:bg-border/30 text-muted hover:text-foreground transition-all flex-shrink-0 ring-1 ring-border/20 hover:ring-primary/50 shadow-inner group"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={14} className="group-hover:text-primary transition-colors" />
      ) : (
        <Moon size={14} className="group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
