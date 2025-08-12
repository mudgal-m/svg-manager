import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { FolderCard } from "./components/FolderCard";
import FolderDrawer from "./components/FolderDrawer";
import { Header } from "./components/Header";
import NoData from "./components/NoData";
import { SvgCard } from "./components/SvgCard";
import ThemeToggle from "./components/ThemeToggle";
import { Button } from "./components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "./components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  addFolder,
  addSvg,
  getFolders,
  getSvgs,
  type Folder,
  type Svg,
} from "./db";
import { isValidSvg, useCtrlV } from "./lib/utils";
export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [svgs, setSvgs] = useState<Svg[]>([]);
  const [drawerData, setDrawerData] = useState<Folder | null>(null);

  const handleAddFolder = async () => {
    await addFolder(`New Folder ${folders.length + 1}`);
    fetchData();
  };

  const handleAddSvg = async () => {
    const text = await navigator.clipboard.readText();
    if (!isValidSvg(text)) {
      toast.error("Not a valid SVG");
      return;
    }
    await addSvg({ code: text });
    fetchData();
  };

  const fetchData = async () => {
    const [fetchedFolders, fetchedSvgs] = await Promise.all([
      getFolders(),
      getSvgs(),
    ]);
    setFolders(fetchedFolders);
    setSvgs(fetchedSvgs);
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
      await addSvg({ code: text });
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

  useCtrlV(() => {
    if (!drawerData) handleAddSvg();
  });

  return (
    <div className="flex relative flex-col min-h-screen px-4 md:px-6">
      <Header onImport={fetchData} />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="pt-20 flex-1 max-w-7xl mx-auto px-4 l:px-0 w-full">
        <Tabs defaultValue="svgs">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="border">
              <TabsTrigger value="svgs" className="py-2 px-6">
                SVGs
              </TabsTrigger>
              <TabsTrigger value="folders" className="py-2 px-6">
                Folders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="folders">
              <Button
                className="float-right"
                onClick={handleAddFolder}
                variant="outline">
                Add Folder
              </Button>
            </TabsContent>
            <TabsContent value="svgs">
              <Button
                className="float-right"
                onClick={handleAddSvg}
                variant="outline">
                Add Svg
              </Button>
            </TabsContent>
          </div>

          {/* Folders Tab */}
          <TabsContent value="folders">
            {folders.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {folders.map((f) => (
                  <FolderCard
                    key={f.id}
                    onDelete={fetchData}
                    id={f.id}
                    name={f.name}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("[data-no-drawer]"))
                        return;
                      if ((e.target as HTMLElement).tagName === "INPUT") return;
                      setDrawerData(f);
                      setDrawerOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <NoData onAdd={handleAddFolder} buttonLabel="Add Folder" />
            )}
          </TabsContent>

          {/* SVGs Tab */}
          <TabsContent value="svgs">
            {svgs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {svgs.map((s, idx) => (
                  <SvgCard onDelete={fetchData} key={idx} {...s} />
                ))}
              </div>
            ) : (
              <NoData onAdd={handleAddSvg} buttonLabel="Add SVG" />
            )}
          </TabsContent>
        </Tabs>
      </div>
      {drawerData?.id && (
        <Drawer
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) {
              setTimeout(() => setDrawerData(null), 300);
            }
          }}>
          <DrawerContent className="pb-10 max-h-[80vh]">
            <DrawerDescription className="leading-0"></DrawerDescription>
            <DrawerTitle className="leading-0"></DrawerTitle>
            <FolderDrawer {...drawerData} />
          </DrawerContent>
        </Drawer>
      )}

      <Toaster position="top-center" richColors theme="dark" />
      <p className="absolute bottom-0 left-0 text-slate-100 dark:text-slate-900 text-xs">
        Mudgal
      </p>
      <ThemeToggle />
    </div>
  );
}
