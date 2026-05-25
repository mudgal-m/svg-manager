import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  { id: "purple", label: "Purple", color: "#8b5cf6" },
  { id: "blue", label: "Blue", color: "#38bdf8" },
  { id: "pink", label: "Pink", color: "#ec4899" },
  { id: "amber", label: "Amber", color: "#f59e0b" },
  { id: "mint", label: "Mint", color: "#10b981" },
] as const;

type ThemeId = (typeof themes)[number]["id"];

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(() => (localStorage.getItem("iconicon-theme") as ThemeId | null) ?? "purple");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("iconicon-theme", theme);
  }, [theme]);

  return (
    <div className="theme-picker">
      <button className="button soft theme-trigger" onClick={() => setOpen((value) => !value)}>
        <Palette size={15} /> Theme
      </button>

      {open && (
        <div className="theme-popover">
          {themes.map((item) => (
            <button
              key={item.id}
              className={item.id === theme ? "active" : ""}
              onClick={() => {
                setTheme(item.id);
                setOpen(false);
              }}
            >
              <span style={{ background: item.color }} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
