import { addSvg, getSvgs, type Folder, type Svg } from "@/db";
import { useCtrlV } from "@/lib/utils";
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

  useEffect(() => {
    fetchData();
  }, []);

  useCtrlV(handleAddSvg);
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0 w-full max-h-[75vh] overflow-y-auto">
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
  );
}
