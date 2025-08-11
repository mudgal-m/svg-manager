import { deleteSvg, type Svg } from "@/db";
import { useSvgSize } from "@/lib/useSvgSize";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface Props extends Svg {
  onDelete: () => void;
}

export function SvgCard({ code, id, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const { sizeClass } = useSvgSize();
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.info("Copied to clipboard");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSvg(id);
    onDelete();
  };

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <div
      title="Click to Copy"
      onClick={handleCopy}
      className={`relative active:shadow-none group rounded-lg flex gap-4 flex-col items-center justify-center aspect-square cursor-pointer transition-all border p-2 hover:border-primary hover:shadow-xl shadow-accent hover:text-accent-foreground`}>
      <div
        className={`flex items-center justify-center ${sizeClass} duration-200`}
        dangerouslySetInnerHTML={{ __html: code }}
      />
      <Button
        title="Delete Icon"
        onClick={handleDelete}
        size={"icon"}
        variant={"outline"}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 border text-muted-foreground hover:bg-destructive/10 hover:border-destructive hover:text-destructive ">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
