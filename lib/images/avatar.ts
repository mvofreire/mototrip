/** Side of the stored profile photo (shown at up to 128px, so 2× covers retina) */
export const AVATAR_SIZE = 512

/**
 * Square crop of an image. At zoom 1 the square is as large as the short side;
 * x/y move its center from the image center, as a fraction of the short side.
 */
export interface AvatarCrop {
  zoom: number
  x: number
  y: number
}

/** Keeps the crop square inside a `width`×`height` image */
export function clampCrop(crop: AvatarCrop, width: number, height: number): AvatarCrop {
  const short = Math.min(width, height)
  const maxX = (width / short - 1 / crop.zoom) / 2
  const maxY = (height / short - 1 / crop.zoom) / 2
  return {
    zoom: crop.zoom,
    x: Math.max(-maxX, Math.min(maxX, crop.x)),
    y: Math.max(-maxY, Math.min(maxY, crop.y)),
  }
}

/** Draws the crop of `image` onto a `size`×`size` area of `ctx` */
export function drawAvatarCrop(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  crop: AvatarCrop,
  size: number,
) {
  const short = Math.min(image.width, image.height)
  const side = short / crop.zoom
  // Positive x/y move the photo right/down, so the crop window goes the other way
  const cx = image.width / 2 - crop.x * short
  const cy = image.height / 2 - crop.y * short
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, cx - side / 2, cy - side / 2, side, side, 0, 0, size, size)
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

/**
 * Renders the crop as a 512×512 WebP (tens of KB). Browsers that can't encode
 * WebP (older Safari hands back a PNG) get a JPEG instead.
 */
export async function exportAvatar(
  image: CanvasImageSource & { width: number; height: number },
  crop: AvatarCrop,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = AVATAR_SIZE
  drawAvatarCrop(canvas.getContext('2d')!, image, crop, AVATAR_SIZE)
  const webp = await toBlob(canvas, 'image/webp', 0.82)
  if (webp?.type === 'image/webp') return webp
  const jpeg = await toBlob(canvas, 'image/jpeg', 0.85)
  if (!jpeg) throw new Error('Could not encode the profile photo')
  return jpeg
}
