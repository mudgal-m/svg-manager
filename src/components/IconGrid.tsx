import { IconCard } from "./IconCard";
import type { Svg } from "../lib/db";

export function IconGrid({ svgs, onChanged }: { svgs: Svg[]; onChanged: () => void }) {
  return (
    <div className="icon-grid">
      {svgs.map((svg) => (
        <IconCard key={svg.id} svg={svg} onChanged={onChanged} />
      ))}
    </div>
  );
}
