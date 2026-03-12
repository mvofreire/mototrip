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
  async createRouteThumbnail(googleStaticImageUrl: string, routeId: string) {
    // get image from google static maps url
    const response = await fetch(googleStaticImageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${routeId}.png`, { type: "image/png" });

    // create route thumbnail (350x200)
    const thumbnailCanvas = document.createElement("canvas");
    thumbnailCanvas.width = 350;
    thumbnailCanvas.height = 200;
    const ctx = thumbnailCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        resolve(null);
      };
    });

    const thumbnailBlob = await new Promise<Blob>((resolve) =>
      thumbnailCanvas.toBlob((blob) => resolve(blob!), "image/png"),
    );
    const thumbnailFile = new File(
      [thumbnailBlob],
      `thumbnail-${routeId}.png`,
      {
        type: "image/png",
      },
    );

    await uploadFile(this.bucket, thumbnailFile, `thumbnail-${routeId}.png`);
    const thumbnailUrl = getPublicUrl(this.bucket, `thumbnail-${routeId}.png`);
    return thumbnailUrl;
  },

  getRouteThumbnailUrl(routeId: string) {
    return getPublicUrl(this.bucket, `thumbnail-${routeId}.png`);
  },

  async deleteRouteThumbnail(routeId: string) {
    return deleteFile(this.bucket, `thumbnail-${routeId}.png`);
  },
};
