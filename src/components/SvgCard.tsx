import { deleteSvg, updateSvgName, type Svg } from "@/db";
import { useSvgSize } from "@/lib/useSvgSize";
import { preProcessor } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import React, { useRef, useState } from "react";
import InlineSvg from "react-inlinesvg";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props extends Svg {
  onDelete: () => void;
}

export function SvgCard({ code, id, name: initialName, onDelete }: Props) {
  const { sizeClass } = useSvgSize();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveName = async () => {
    const trimmed = name?.trim();
    if (trimmed && trimmed !== initialName) {
      await updateSvgName(id, trimmed);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.info("Copied to clipboard");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSvg(id);
    onDelete();
  };

  return (
    <div
      onClick={handleCopy}
      className={`relative group rounded-lg flex flex-col items-center justify-center gap-2 aspect-square cursor-pointer transition-all border p-2 hover:border-primary hover:shadow-lg`}>
      <InlineSvg
        preProcessor={(svgCode: string) => preProcessor({ svgCode, id })}
        className={`${sizeClass} duration-150`}
        src={code}
      />

      {/* Dropdown Menu */}
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
        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
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
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem data-no-drawer onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Editable name */}
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full text-center border border-border rounded px-1 py-0.5 text-sm outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => void saveName()}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      ) : (
        <span className="truncate w-full text-sm text-accent-muted text-center" title={name}>
          {name}
        </span>
      )}
    </div>
  );
}
