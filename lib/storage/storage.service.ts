import { supabase } from "../supabase/client";

async function uploadFile(bucket: string, file: File, path: string, cacheControl = "3600") {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl,
      upsert: true,
    });

  if (error) throw error;
  return data;
}

function getPublicUrl(bucket: string, path: string) {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl || null;
}

function deleteFiles(bucket: string, paths: string[]) {
  return supabase.storage.from(bucket).remove(paths);
}

export const GpxStorage = {
  bucket: "gpx_files",
  async uploadGpxFile(file: File, path: string) {
    return uploadFile(this.bucket, file, path);
  },
  async getGpxPublicUrl(path: string) {
    return getPublicUrl(this.bucket, path);
  },
  async deleteGpxFile(path: string) {
    return deleteFiles(this.bucket, [path]);
  },
};

export const RouteStorage = {
  bucket: "route_map",
  /** Uploads a rendered route map PNG (see lib/map-thumbnail.ts). */
  /**
   * Uploads the light (thumbnail-<id>.png, also the OG image) and dark
   * (thumbnail-<id>-dark.png) thumbnails and returns the light one's URL.
   * The dark one is best effort: cards fall back to the light image.
   */
  async uploadRouteThumbnails(images: { light: Blob; dark: Blob }, routeId: string) {
    // URLs get a new ?v= on every change, so the files can be cached for long
    const year = String(60 * 60 * 24 * 365);
    const path = `thumbnail-${routeId}.png`;
    await uploadFile(this.bucket, new File([images.light], path, { type: "image/png" }), path, year);
    const darkPath = `thumbnail-${routeId}-dark.png`;
    try {
      await uploadFile(this.bucket, new File([images.dark], darkPath, { type: "image/png" }), darkPath, year);
    } catch (e) {
      console.warn("Could not upload the dark route thumbnail:", e);
    }
    return getPublicUrl(this.bucket, path);
  },

  getRouteThumbnailUrl(routeId: string) {
    return getPublicUrl(this.bucket, `thumbnail-${routeId}.png`);
  },

  deleteRouteThumbnail(routeId: string) {
    return deleteFiles(this.bucket, [`thumbnail-${routeId}.png`, `thumbnail-${routeId}-dark.png`]);
  },
};
