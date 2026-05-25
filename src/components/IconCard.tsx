import { Check, Copy, MousePointer2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteSvg, updateSvgName, type Svg } from "../lib/db";
import { useSelection } from "../lib/selection";
import { preProcessor } from "../lib/utils";

export function IconCard({ svg, onChanged }: { svg: Svg; onChanged: () => void }) {
  const [menuPoint, setMenuPoint] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const { isSelecting, selectedIds, setIsSelecting, setSelectedIds, toggleSelected } = useSelection();
  const selected = selectedIds.includes(svg.id);

  const copySvg = async () => {
    if (isSelecting) {
      toggleSelected(svg.id);
      return;
    }

    await navigator.clipboard.writeText(svg.code);
    setMenuPoint(null);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1100);
  };

  const rename = async () => {
    setMenuPoint(null);
    const nextName = window.prompt("Rename icon", svg.name);
    if (!nextName?.trim()) return;
    await updateSvgName(svg.id, nextName.trim());
    onChanged();
  };

  const remove = async () => {
    setMenuPoint(null);
    await deleteSvg(svg.id);
    onChanged();
  };

  const selectIcon = () => {
    setIsSelecting(true);
    setSelectedIds([svg.id]);
    setMenuPoint(null);
  };

  return (
    <>
      <article
        className={`icon-card ${selected ? "selected" : ""}`}
        onClick={copySvg}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuPoint({ x: event.clientX, y: event.clientY });
        }}
      >
        {isSelecting && (
          <span className={`check-wrap ${selected ? "checked" : ""}`} aria-hidden="true">
            {selected ? <Check size={15} /> : null}
          </span>
        )}
        {copied && <span className="copy-badge">Copied</span>}
        <div
          className="icon-preview"
          dangerouslySetInnerHTML={{ __html: preProcessor({ svgCode: svg.code, id: svg.id }) }}
        />
        <div className="icon-name" title={svg.name}>{svg.name}</div>
      </article>

      {menuPoint && !isSelecting && (
        <div className="context-backdrop" onClick={() => setMenuPoint(null)}>
          <div className="context-menu" style={{ left: menuPoint.x, top: menuPoint.y }} onClick={(event) => event.stopPropagation()}>
            <button onClick={copySvg}><Copy size={15} /> Copy SVG</button>
            <button onClick={selectIcon}><MousePointer2 size={15} /> Select</button>
            <button onClick={rename}><Pencil size={15} /> Rename</button>
            <button className="danger-text" onClick={remove}><Trash2 size={15} /> Delete</button>
          </div>
        </div>
      )}
    </>
  );
}
