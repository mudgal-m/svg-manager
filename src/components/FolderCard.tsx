import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteFolder, updateFolderName, type Folder as FolderType } from "../lib/db";

export function FolderCard({ folder, onChanged }: { folder: FolderType; onChanged: () => void }) {
  const [menuPoint, setMenuPoint] = useState<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();

  const rename = async () => {
    setMenuPoint(null);
    const nextName = window.prompt("Rename folder", folder.name);
    if (!nextName?.trim()) return;
    await updateFolderName(folder.id, nextName.trim());
    onChanged();
  };

  const remove = async () => {
    setMenuPoint(null);
    await deleteFolder(folder.id);
    onChanged();
  };

  return (
    <>
      <article
        className="folder-card"
        onClick={() => navigate(`/folders/${folder.id}`)}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuPoint({ x: event.clientX, y: event.clientY });
        }}
      >
        <div className="folder-illustration" aria-hidden="true">
          <span className="folder-tab" />
          <span className="folder-body" />
        </div>
        <div className="folder-copy">
          <div className="folder-name" title={folder.name}>{folder.name}</div>
          <div className="folder-subtitle">in Iconicon</div>
        </div>
      </article>

      {menuPoint && (
        <div className="context-backdrop" onClick={() => setMenuPoint(null)}>
          <div className="context-menu" style={{ left: menuPoint.x, top: menuPoint.y }} onClick={(event) => event.stopPropagation()}>
            <button onClick={rename}><Pencil size={15} /> Rename</button>
            <button className="danger-text" onClick={remove}><Trash2 size={15} /> Delete</button>
          </div>
        </div>
      )}
    </>
  );
}
