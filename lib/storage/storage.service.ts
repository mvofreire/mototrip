import { supabase } from "../supabase/client";

async function uploadFile(bucket: string, file: File, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
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

function deleteFile(bucket: string, path: string) {
  return supabase.storage.from(bucket).remove([path]);
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
    return deleteFile(this.bucket, path);
  },
};

export const RouteStorage = {
  bucket: "route_map",
  /** Uploads a rendered route map PNG (see lib/map-thumbnail.ts). */
  async uploadRouteThumbnail(image: Blob, routeId: string) {
    const path = `thumbnail-${routeId}.png`;
    const file = new File([image], path, { type: "image/png" });
    await uploadFile(this.bucket, file, path);
    return getPublicUrl(this.bucket, path);
  },

  getRouteThumbnailUrl(routeId: string) {
    return getPublicUrl(this.bucket, `thumbnail-${routeId}.png`);
  },

  async deleteRouteThumbnail(routeId: string) {
    return deleteFile(this.bucket, `thumbnail-${routeId}.png`);
  },
};
