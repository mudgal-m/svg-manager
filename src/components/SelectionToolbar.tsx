import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, ChevronDown, FolderInput, Home, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deleteSvgs, getFolders, moveSvgs, type Svg } from "../lib/db";
import { useSelection } from "../lib/selection";

export function SelectionToolbar() {
  const [moveOpen, setMoveOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isSelecting, selectedIds, currentFolderId, clearSelection, requestRefresh, setIsSelecting, setSelectedIds } = useSelection();
  const foldersQuery = useQuery({
    queryKey: ["folders"],
    queryFn: getFolders,
    enabled: isSelecting,
  });
  const folders = foldersQuery.data ?? [];

  const cancel = () => setIsSelecting(false);

  const moveMutation = useMutation({
    mutationFn: (folderId: string) => moveSvgs(selectedIds, folderId === "__root" ? undefined : folderId),
    onSuccess: async () => {
      clearSelection();
      requestRefresh();
      await queryClient.invalidateQueries({ queryKey: ["svgs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSvgs(selectedIds),
    onSuccess: async () => {
      clearSelection();
      requestRefresh();
      await queryClient.invalidateQueries({ queryKey: ["svgs"] });
    },
  });

  if (!isSelecting || !selectedIds.length) return null;

  const moveTo = (folderId: string) => {
    setMoveOpen(false);
    moveMutation.mutate(folderId);
  };

  const selectAll = () => {
    const cacheKey = ["svgs", currentFolderId ?? "root"];
    const svgs = queryClient.getQueryData<Svg[]>(cacheKey) ?? [];
    setSelectedIds(svgs.map((svg) => svg.id));
  };

  return (
    <div className="selection-toolbar" role="toolbar" aria-label="Selected icon actions">
      <button className="icon-button" onClick={cancel} title="Cancel selection">
        <X size={17} />
      </button>
      <span className="selected-count">{selectedIds.length} selected</span>
      <button className="button select-all-button" onClick={selectAll}>
        <CheckSquare size={16} /> Select all
      </button>
      <div className="move-menu-wrap">
        <button className="move-control" onClick={() => setMoveOpen((open) => !open)}>
          Move to
          <ChevronDown size={14} />
        </button>
        {moveOpen && (
          <div className="move-menu">
            <button onClick={() => moveTo("__root")} disabled={!currentFolderId}>
              <Home size={15} />
              <span>Root icons</span>
            </button>
            <div className="move-menu-divider" />
            <div className="move-menu-label">Folders</div>
            {folders.filter((folder) => folder.id !== currentFolderId).length ? (
              folders
                .filter((folder) => folder.id !== currentFolderId)
                .map((folder) => (
                  <button key={folder.id} onClick={() => moveTo(folder.id)}>
                    <FolderInput size={15} />
                    <span>{folder.name}</span>
                  </button>
                ))
            ) : (
              <div className="move-menu-empty">No other folders</div>
            )}
          </div>
        )}
      </div>
      <button className="button danger-button" onClick={() => deleteMutation.mutate()}>
        <Trash2 size={16} /> Delete
      </button>
    </div>
  );
}
