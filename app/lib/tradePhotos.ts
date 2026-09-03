import { getSupabaseClient } from "./supabase";

const BUCKET = "trade-card-photos";
const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  return file.type === "image/png" ? "png" : "jpg";
}

export async function uploadTradePhotos(files: File[], minimumPhotos = 4) {
  if (files.length < minimumPhotos) throw new Error(`Please add at least ${minimumPhotos} clear card photos.`);
  if (files.length > MAX_PHOTOS) throw new Error("You can upload up to 6 card photos.");

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Photo uploads are unavailable in this browser.");

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error("Please sign in before uploading card photos.");

  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error("Only image files can be uploaded.");
    if (file.size > MAX_FILE_SIZE) throw new Error("Each card photo must be 10 MB or smaller.");
  }

  return Promise.all(files.map(async (file) => {
    const path = `${user.id}/${crypto.randomUUID()}.${extensionFor(file)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(`Unable to upload ${file.name}: ${error.message}`);
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }));
}
