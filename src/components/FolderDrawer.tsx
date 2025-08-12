import { addSvg, getSvgs, type Folder, type Svg } from "@/db";
import { isValidSvg, useCtrlV } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SvgCard } from "./SvgCard";
import { Button } from "./ui/button";

export default function FolderDrawer({ id, name }: Folder) {
  const [svgs, setSvgs] = useState<Svg[]>([]);

  const fetchData = async () => {
    const fetchedSvgs = await getSvgs(id);
    setSvgs(fetchedSvgs);
  };

  const handleAddSvg = async () => {
    const text = await navigator.clipboard.readText();
    const svgRegex = /<svg[^>]*>[\s\S]*<\/svg>/;
    const isSvg = svgRegex.test(text);
    if (!isSvg) {
      toast.error("Not a valid SVG");
      return;
    }
    await addSvg({
      code: text,
      folderId: id,
    });
    fetchData();
  };

  async function handleSvgFiles(files: FileList) {
    const svgFiles = Array.from(files).filter(
      (file) => file.type === "image/svg+xml"
    );

    if (svgFiles.length === 0) {
      toast.error("No SVG files detected");
      return;
    }

    for (const file of svgFiles) {
      const text = await file.text();
      if (!isValidSvg(text)) {
        toast.error(`File "${file.name}" is not a valid SVG`);
        continue;
      }
      await addSvg({ code: text, folderId: id });
    }
    toast.success(`Added ${svgFiles.length} SVG file(s)`);
    fetchData();
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    await handleSvgFiles(e.dataTransfer.files);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useCtrlV(handleAddSvg);
  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <div className="max-w-6xl mx-auto px-4 lg:px-0 w-full max-h-[75vh] min-h-[30vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">{name}</h2>
          <Button onClick={handleAddSvg} variant={"outline"}>
            Add Svg
          </Button>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
          {svgs.map((s, idx) => (
            <SvgCard onDelete={fetchData} key={idx} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}
