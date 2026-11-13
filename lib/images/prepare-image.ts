/** Image types we accept for uploads (route photos, blog images) */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Downscale a picked image in the browser so uploads stay small: JPEG, longest
 * side at most `maxSide`. Small JPEGs are uploaded as they are.
 */
export async function prepareImage(file: File, maxSide = 2000, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size <= MAX_IMAGE_BYTES && file.type === 'image/jpeg') return file

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', quality))
}
