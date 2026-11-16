/**
 * Renders a static PNG of a route on OpenStreetMap tiles in the browser,
 * styled like the route cover map (greyed tiles, red route line), in a light
 * and a dark version. Stored as the route's thumbnails: route cards show the
 * one for the current theme, and the light one is the social/OG image.
 * Mirrors jobs/lib/route_thumbnail.ts, which does the same in Node.
 */

type LatLng = { lat: number; lng: number };

const TILE_SIZE = 256;
const TILE_URL = (z: number, x: number, y: number) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
const LINE_COLOR = "#ef233c";

function project({ lat, lng }: LatLng, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function loadTile(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export type ThumbnailTheme = "light" | "dark";

/** Light and dark thumbnails of a route (the second render reuses cached tiles) */
export async function renderRouteThumbnails(points: LatLng[]) {
  const [light, dark] = await Promise.all([
    renderRouteThumbnail(points, { theme: "light" }),
    renderRouteThumbnail(points, { theme: "dark" }),
  ]);
  return { light, dark };
}

/**
 * Dark map like `.dark .route-cover-map` (grayscale 1, invert 1, brightness
 * 1.05, contrast .95), done on the pixels: ctx.filter is missing in older Safari.
 */
function darken(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    const grey = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    const v = Math.max(0, Math.min(255, (255 - grey) * 1.05 * 0.95 + 128 * 0.05));
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  ctx.putImageData(image, 0, 0);
}

export async function renderRouteThumbnail(
  points: LatLng[],
  { width = 700, height = 400, padding = 40, theme = "light" as ThumbnailTheme } = {},
): Promise<Blob> {
  const dark = theme === "dark";
  if (points.length < 2) throw new Error("Route needs at least two points");

  // Largest zoom where the route fits inside the padded canvas
  let zoom = 17;
  for (; zoom > 1; zoom--) {
    const px = points.map((p) => project(p, zoom));
    const w = Math.max(...px.map((p) => p.x)) - Math.min(...px.map((p) => p.x));
    const h = Math.max(...px.map((p) => p.y)) - Math.min(...px.map((p) => p.y));
    if (w <= width - padding * 2 && h <= height - padding * 2) break;
  }

  const px = points.map((p) => project(p, zoom));
  const minX = Math.min(...px.map((p) => p.x));
  const maxX = Math.max(...px.map((p) => p.x));
  const minY = Math.min(...px.map((p) => p.y));
  const maxY = Math.max(...px.map((p) => p.y));
  const originX = (minX + maxX) / 2 - width / 2;
  const originY = (minY + maxY) / 2 - height / 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");
  ctx.fillStyle = "#e5e5e5";
  ctx.fillRect(0, 0, width, height);

  // Tiles
  const tiles = 2 ** zoom;
  const jobs: Promise<void>[] = [];
  for (let tx = Math.floor(originX / TILE_SIZE); tx <= Math.floor((originX + width) / TILE_SIZE); tx++) {
    for (let ty = Math.floor(originY / TILE_SIZE); ty <= Math.floor((originY + height) / TILE_SIZE); ty++) {
      if (ty < 0 || ty >= tiles) continue;
      const wrappedX = ((tx % tiles) + tiles) % tiles;
      jobs.push(
        loadTile(TILE_URL(zoom, wrappedX, ty)).then((img) => {
          if (!img) return;
          ctx.save();
          // Same look as .route-cover-map in light mode (dark: see darken())
          if (!dark) ctx.filter = "grayscale(0.85) contrast(1.05) brightness(0.97)";
          ctx.drawImage(img, tx * TILE_SIZE - originX, ty * TILE_SIZE - originY);
          ctx.restore();
        }),
      );
    }
  }
  await Promise.all(jobs);
  if (dark) darken(ctx, width, height);

  // Route line with a soft glow underneath
  const drawLine = (lineWidth: number, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    px.forEach((p, i) => {
      const x = p.x - originX;
      const y = p.y - originY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  };
  drawLine(12, 0.25);
  drawLine(4, 1);

  // OSM attribution
  ctx.font = "10px sans-serif";
  const label = "© OpenStreetMap contributors";
  const lw = ctx.measureText(label).width + 8;
  ctx.fillStyle = dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.75)";
  ctx.fillRect(width - lw, height - 14, lw, 14);
  ctx.fillStyle = dark ? "#bbb" : "#333";
  ctx.fillText(label, width - lw + 4, height - 4);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
