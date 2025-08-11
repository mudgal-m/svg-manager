import { deleteFolder, updateFolderName, type Folder } from "@/db";
import { EllipsisVertical, FolderHeart } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type DivProps = Omit<React.HTMLAttributes<HTMLDivElement>, "id">;

interface Props extends Folder, DivProps {
  onDelete: () => void;
}

export const FolderCard = React.forwardRef<HTMLDivElement, Props>(
  ({ id, name: initialName, onDelete, className = "", ...rest }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);

    const inputRef = useRef<HTMLInputElement>(null);

    const saveName = async () => {
      const trimmed = name.trim();
      if (trimmed && trimmed !== initialName) {
        await updateFolderName(id, trimmed);
      } else {
        setName(initialName);
      }
      setIsEditing(false);
    };

    const cancelEdit = () => {
      setName(initialName);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveName();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    };

    const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteFolder(id);
      onDelete();
    };

    return (
      <div
        ref={ref}
        {...rest}
        className={`relative group rounded-lg flex gap-4 flex-col items-center justify-center aspect-square cursor-pointer transition-all border p-2 hover:border-primary hover:shadow-lg shadow-accent hover:text-accent-foreground ${className}`}>
        <FolderHeart className="size-10 mb-2 text-muted-foreground group-hover:text-accent-foreground" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-no-drawer
              className="absolute top-2 right-2">
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem
              data-no-drawer
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                  inputRef.current?.select();
                });
              }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              data-no-drawer
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(e);
              }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isEditing ? (
          <input
            ref={inputRef}
            className="w-full text-center border border-border rounded px-1 py-0.5 text-sm outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              // avoid unhandled promise
              void saveName();
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        ) : (
          <span
            className="select-none truncate w-full text-center"
            title={name}>
            {name}
          </span>
        )}
      </div>
    );
  }
);

FolderCard.displayName = "FolderCard";
