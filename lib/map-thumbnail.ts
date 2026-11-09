/**
 * Renders a static PNG of a route on OpenStreetMap tiles in the browser,
 * styled like the route cover map (greyed tiles, red route line). Used as the
 * route's stored thumbnail (social/OG image). Cards render a live Leaflet map.
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

export async function renderRouteThumbnail(
  points: LatLng[],
  { width = 700, height = 400, padding = 40 } = {},
): Promise<Blob> {
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
          // Same look as .route-cover-map in light mode
          ctx.filter = "grayscale(0.85) contrast(1.05) brightness(0.97)";
          ctx.drawImage(img, tx * TILE_SIZE - originX, ty * TILE_SIZE - originY);
          ctx.restore();
        }),
      );
    }
  }
  await Promise.all(jobs);

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
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(width - lw, height - 14, lw, 14);
  ctx.fillStyle = "#333";
  ctx.fillText(label, width - lw + 4, height - 4);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
