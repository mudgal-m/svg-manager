import { Button } from "@/components/ui/button";
import { exportData, importData } from "@/db";
import { useSvgSize } from "@/lib/useSvgSize";
import { Check, MoreVertical } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header({ onImport }: { onImport: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { changeSize, size } = useSvgSize();
  const handleImportFile = async (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.name.endsWith(".json")) {
      toast.error("Invalid file type. Please select a .json file.");
      return;
    }

    try {
      const text = await file.text();

      if (text.length > 1_000_000) {
        toast.error("File too large");
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("File is not valid JSON");
        return;
      }

      if (
        !parsed ||
        !Array.isArray(parsed.folders) ||
        !Array.isArray(parsed.svgs) ||
        parsed.folders.some(
          (f: any) => typeof f?.id !== "string" || typeof f?.name !== "string"
        ) ||
        parsed.svgs.some(
          (s: any) => typeof s?.id !== "string" || typeof s?.code !== "string"
        )
      ) {
        toast.error("File does not match expected SVG manager format");
        return;
      }

      await importData(text);
      onImport();
      toast.success("Import successful");
    } catch (err) {
      console.error(err);
      toast.error("Import failed");
    }
  };

  const handleExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "svg-manager-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 border-b bg-background/80 backdrop-blur-sm md:px-6">
      <div className="max-w-7xl mx-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-4 font-semibold text-2xl">
          SvgManager
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>Svg Size</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => changeSize("small")}>
                Small
                {size === "small" && <Check className="size-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSize("medium")}>
                Medium
                {size === "medium" && <Check className="size-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSize("large")}>
                large
                {size === "large" && <Check className="size-4 ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop buttons */}
          <div className="hidden sm:flex gap-2">
            <Button
              variant={"secondary"}
              onClick={() => inputRef.current?.click()}>
              Import
            </Button>
            <Button variant={"secondary"} onClick={handleExport}>
              Export
            </Button>
          </div>

          {/* Mobile dropdown */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => inputRef.current?.click()}>
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <input
            type="file"
            name="file input"
            hidden
            ref={inputRef}
            onChange={(e) => handleImportFile(e.target.files?.[0])}
          />
        </div>
      </div>
    </header>
  );
}
