import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, FolderPlus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { FolderCard } from "../components/FolderCard";
import { IconGrid } from "../components/IconGrid";
import { addFolder, addSvg, getFolders, getSvgs } from "../lib/db";
import { useSelection } from "../lib/selection";
import { iconNameFromFile, isValidSvg, useCtrlV } from "../lib/utils";

const foldersKey = ["folders"] as const;
const svgsKey = (folderId?: string) => ["svgs", folderId ?? "root"] as const;

export function LibraryPage() {
  const { folderId } = useParams();
  const isHome = !folderId;
  const queryClient = useQueryClient();
  const { isSelecting, setCurrentFolderId } = useSelection();
  const [message, setMessage] = useState("");

  const foldersQuery = useQuery({
    queryKey: foldersKey,
    queryFn: getFolders,
  });

  const svgsQuery = useQuery({
    queryKey: svgsKey(folderId),
    queryFn: () => getSvgs(folderId),
  });

  const folders = foldersQuery.data ?? [];
  const svgs = svgsQuery.data ?? [];
  const folder = useMemo(() => folders.find((item) => item.id === folderId), [folderId, folders]);

  const invalidateIcons = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: svgsKey(folderId) });
  }, [folderId, queryClient]);

  const addFolderMutation = useMutation({
    mutationFn: () => addFolder(`New Folder ${folders.length + 1}`),
    onSuccess: async () => {
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: foldersKey });
    },
  });

  const addSvgMutation = useMutation({
    mutationFn: (payload: { code: string; name?: string }) => addSvg({ ...payload, folderId }),
    onSuccess: async () => {
      setMessage("");
      await invalidateIcons();
    },
  });

  const addFromClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    if (!isValidSvg(text)) {
      setMessage("Clipboard does not contain a valid SVG.");
      return;
    }

    await addSvgMutation.mutateAsync({ code: text });
  }, [addSvgMutation]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const svgFiles = Array.from(files).filter((file) => file.type === "image/svg+xml" || file.name.endsWith(".svg"));
      if (!svgFiles.length) {
        setMessage("No SVG files detected.");
        return;
      }

      let added = 0;
      for (const file of svgFiles) {
        const code = await file.text();
        if (isValidSvg(code)) {
          await addSvgMutation.mutateAsync({ code, name: iconNameFromFile(file.name) });
          added += 1;
        }
      }

      setMessage(added ? "" : "No valid SVG files found.");
    },
    [addSvgMutation],
  );

  useEffect(() => {
    setCurrentFolderId(folderId);
  }, [folderId, setCurrentFolderId]);

  useCtrlV(() => {
    if (!isSelecting) void addFromClipboard();
  });

  return (
    <section
      className="drop-zone"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void handleFiles(event.dataTransfer.files);
      }}
    >
      <div className="library-topline">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {!isHome && (
            <>
              <ChevronRight size={15} />
              <span>{folder?.name ?? "Folder"}</span>
            </>
          )}
        </nav>

        <div className="page-actions">
          {isHome && (
            <button className="button soft" onClick={() => addFolderMutation.mutate()} disabled={addFolderMutation.isPending}>
              <FolderPlus size={15} /> Add Folder
            </button>
          )}
          <button className="button primary" onClick={addFromClipboard} disabled={addSvgMutation.isPending}>
            <Plus size={15} /> Add SVG
          </button>
        </div>
      </div>

      {message && <p className="inline-message">{message}</p>}

      {isHome && folders.length > 0 && (
        <section className="library-section compact-section">
          <div className="section-label">Folders</div>
          <div className="folder-grid">
            {folders.map((item) => (
              <FolderCard
                key={item.id}
                folder={item}
                onChanged={() => {
                  void queryClient.invalidateQueries({ queryKey: foldersKey });
                  void invalidateIcons();
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="library-section">
        <div className="section-label">{isHome ? "Icons" : folder?.name ?? "Folder icons"}</div>
        {svgsQuery.isLoading ? (
          <div className="soft-loading">Loading icons...</div>
        ) : svgs.length ? (
          <IconGrid svgs={svgs} onChanged={() => void invalidateIcons()} />
        ) : (
          <EmptyState title={isHome ? "No icons yet" : "No icons in this folder"} actionLabel="Add SVG" onAction={addFromClipboard} />
        )}
      </section>
    </section>
  );
}
