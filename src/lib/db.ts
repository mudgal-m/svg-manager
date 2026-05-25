import { createClient } from "@supabase/supabase-js";
import { randomIconName } from "./utils";

type FolderRow = {
  id: string;
  name: string;
  created_at: string;
};

type SvgRow = {
  id: string;
  code: string;
  folder_id: string | null;
  name: string;
  created_at: string;
};

export type Folder = {
  id: string;
  name: string;
};

export type Svg = {
  id: string;
  code: string;
  folderId?: string;
  name: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function mapFolder(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
  };
}

function mapSvg(row: SvgRow): Svg {
  return {
    id: row.id,
    code: row.code,
    folderId: row.folder_id ?? undefined,
    name: row.name,
  };
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function addFolder(name: string) {
  const { data, error } = await supabase
    .from("folders")
    .insert({ name })
    .select("id, name, created_at")
    .single<FolderRow>();

  throwIfError(error);
  if (!data) throw new Error("Folder was not created");
  return mapFolder(data);
}

export async function getFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("id, name, created_at")
    .order("name", { ascending: true });

  throwIfError(error);
  return (data ?? []).map(mapFolder);
}

export async function updateFolderName(id: string, name: string) {
  const { error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", id);
  throwIfError(error);
}

export async function deleteFolder(id: string) {
  const { error } = await supabase.from("folders").delete().eq("id", id);
  throwIfError(error);
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
  const { data, error } = await supabase
    .from("svgs")
    .insert({
      code,
      folder_id: folderId ?? null,
      name: name?.trim() || randomIconName(),
    })
    .select("id, code, folder_id, name, created_at")
    .single<SvgRow>();

  throwIfError(error);
  if (!data) throw new Error("SVG was not created");
  return mapSvg(data);
}

export async function getSvgs(folderId?: string): Promise<Svg[]> {
  let query = supabase
    .from("svgs")
    .select("id, code, folder_id, name, created_at")
    .order("name", { ascending: true });

  query = folderId
    ? query.eq("folder_id", folderId)
    : query.is("folder_id", null);

  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []).map(mapSvg);
}

export async function updateSvgName(id: string, name: string) {
  const { error } = await supabase.from("svgs").update({ name }).eq("id", id);
  throwIfError(error);
}

export async function moveSvgs(ids: string[], folderId?: string) {
  const { error } = await supabase
    .from("svgs")
    .update({ folder_id: folderId ?? null })
    .in("id", ids);
  throwIfError(error);
}

export async function deleteSvgs(ids: string[]) {
  const { error } = await supabase.from("svgs").delete().in("id", ids);
  throwIfError(error);
}

export async function deleteSvg(id: string) {
  await deleteSvgs([id]);
}
