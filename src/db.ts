import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface SvgManagerDB extends DBSchema {
  folders: {
    key: string; // folder id
    value: {
      id: string;
      name: string;
      createdAt: number;
    };
    indexes: { "by-name": string };
  };
  svgs: {
    key: string; // svg id
    value: {
      id: string;
      code: string; // SVG code text
      folderId?: string; // optional, null means root
      name?:string;
      createdAt: number;
    };
    indexes: { "by-folder": string; "by-name": string };
  };
}

export type Folder = { id: string; name: string };
export type Svg = {
  id: string;
  code: string;
  folderId?: string;
  name?:string
};

let dbPromise: Promise<IDBPDatabase<SvgManagerDB>>;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SvgManagerDB>("svg-manager-db", 3, {
      upgrade(db, oldVersion, _, tx) {
        // Create stores if missing
        if (!db.objectStoreNames.contains("folders")) {
          const folderStore = db.createObjectStore("folders", { keyPath: "id" });
          folderStore.createIndex("by-name", "name");
        }
      
        if (!db.objectStoreNames.contains("svgs")) {
          const svgStore = db.createObjectStore("svgs", { keyPath: "id" });
          svgStore.createIndex("by-folder", "folderId");
          svgStore.createIndex("by-name", "name");
        }
      
        // ✅ Migration step 2 → ensure every svg has a name
        if (oldVersion < 2) {
          const store = tx.objectStore("svgs");
          store.openCursor().then(async function iterate(cursor): Promise<void> {
            if (!cursor) return;
            const value = cursor.value as any;
            if (!value.name) {
              value.name = `icon-${Math.random().toString(36).slice(2, 8)}`;
              await cursor.update(value);
            }
            return cursor.continue().then(iterate);
          });
        }
      
        // future migrations: if (oldVersion < 3) { … }
      }
      
    });
  }
  return dbPromise;
}


export async function addFolder(name: string) {
  const db = await getDB();
  const folder = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
  };
  await db.put("folders", folder);
  return folder;
}

export async function getFolders(): Promise<Array<Folder>> {
  const db = await getDB();
  return await db.getAll("folders");
}

export async function updateFolderName(id: string, newName: string) {
  const db = await getDB();
  const folder = await db.get("folders", id);
  if (!folder) throw new Error("Folder not found");
  folder.name = newName;
  await db.put("folders", folder);
}

export async function deleteFolder(id: string) {
  const db = await getDB();
  await db.delete("folders", id);

  // Optional: also delete all svgs in this folder
  const tx = db.transaction("svgs", "readwrite");
  const index = tx.store.index("by-folder");
  let cursor = await index.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function addSvg({
  code,
  folderId,
  name,
}: {
  code: string;
  folderId?: string;
  name?: string;
}) {
  const db = await getDB();
  const svg = {
    id: crypto.randomUUID(),
    code,
    name: name ?? `icon-${Math.random().toString(36).slice(2, 8)}`,
    folderId,
    createdAt: Date.now(),
  };
  await db.put("svgs", svg);
  return svg;
}

export async function updateSvgName(id: string, newName: string) {
  const db = await getDB();
  const svg = await db.get("svgs", id);
  if (!svg) throw new Error("SVG not found");
  svg.name = newName;
  await db.put("svgs", svg);
}


export async function getSvgs(
  folderId?: string
): Promise<Array<Svg>> {
  const db = await getDB();

  if (folderId) {
    const index = db.transaction("svgs").store.index("by-folder");
    return await index.getAll(folderId);
  } else {
    // ✅ Only root-level SVGs
    const all = await db.getAll("svgs");
    return all.filter((svg) => !svg.folderId);
  }
}

export async function deleteSvg(id: string) {
  const db = await getDB();
  await db.delete("svgs", id);
}

export async function exportData(): Promise<string> {
  const db = await getDB();

  const folders = await db.getAll("folders");
  const svgs = await db.getAll("svgs");

  const payload = {
    folders,
    svgs,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(payload);
}

export async function importData(jsonData: string): Promise<void> {
  const db = await getDB();
  let data: {
    folders: Array<SvgManagerDB["folders"]["value"]>;
    svgs: Array<SvgManagerDB["svgs"]["value"]>;
  };

  try {
    data = JSON.parse(jsonData);
  } catch {
    throw new Error("Invalid JSON format");
  }

  if (!Array.isArray(data.folders) || !Array.isArray(data.svgs)) {
    throw new Error("Invalid data structure");
  }

  // Wipe existing data before importing
  const tx = db.transaction(["folders", "svgs"], "readwrite");
  await tx.objectStore("folders").clear();
  await tx.objectStore("svgs").clear();

  for (const folder of data.folders) {
    await tx.objectStore("folders").put(folder);
  }
  for (const svg of data.svgs) {
    await tx.objectStore("svgs").put(svg);
  }

  await tx.done;
}
