import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type SelectionContextValue = {
  isSelecting: boolean;
  selectedIds: string[];
  currentFolderId?: string;
  setCurrentFolderId: (folderId?: string) => void;
  setIsSelecting: (value: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelected: (id: string) => void;
  clearSelection: () => void;
  refreshToken: number;
  requestRefresh: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [isSelecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [refreshToken, setRefreshToken] = useState(0);

  const setIsSelecting = useCallback((value: boolean) => {
    setSelecting(value);
    if (!value) setSelectedIds([]);
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((ids) => {
      if (!ids.includes(id)) return [...ids, id];

      const nextIds = ids.filter((item) => item !== id);
      if (!nextIds.length) setSelecting(false);
      return nextIds;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelecting(false);
  }, []);
  const requestRefresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  const value = useMemo(
    () => ({
      isSelecting,
      selectedIds,
      currentFolderId,
      setCurrentFolderId,
      setIsSelecting,
      setSelectedIds,
      toggleSelected,
      clearSelection,
      refreshToken,
      requestRefresh,
    }),
    [clearSelection, currentFolderId, isSelecting, refreshToken, requestRefresh, selectedIds, setIsSelecting, toggleSelected],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("useSelection must be used inside SelectionProvider");
  return context;
}
