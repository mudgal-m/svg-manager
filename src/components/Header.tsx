import { Grid2X2 } from "lucide-react";
import { ThemePicker } from "./ThemePicker";

export function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <Grid2X2 size={17} />
        </span>
        <span>Iconicon</span>
      </div>

      <ThemePicker />
    </header>
  );
}
