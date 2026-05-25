import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderInput, Trash2, X } from "lucide-react";
import { deleteSvgs, getFolders, moveSvgs } from "../lib/db";
import { useSelection } from "../lib/selection";

export function SelectionToolbar() {
  const queryClient = useQueryClient();
  const { isSelecting, selectedIds, currentFolderId, clearSelection, requestRefresh, setIsSelecting } = useSelection();
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

  return (
    <div className="selection-toolbar" role="toolbar" aria-label="Selected icon actions">
      <button className="icon-button" onClick={cancel} title="Cancel selection">
        <X size={17} />
      </button>
      <span className="selected-count">{selectedIds.length} selected</span>
      <label className="move-control">
        <FolderInput size={16} />
        <select value="" aria-label="Move selected icons" onChange={(event) => event.target.value && moveMutation.mutate(event.target.value)}>
          <option value="">Move to</option>
          <option value="__root">Root icons</option>
          {folders
            .filter((folder) => folder.id !== currentFolderId)
            .map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
        </select>
      </label>
      <button className="button danger-button" onClick={() => deleteMutation.mutate()}>
        <Trash2 size={16} /> Delete
      </button>
    </div>
  );
}
