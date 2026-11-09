/**
 * Node renderer for route thumbnails on OpenStreetMap tiles, styled like the
 * route cover map in the app (greyed tiles, red route line with a glow).
 * Mirrors lib/map-thumbnail.ts, which does the same in the browser.
 */

import sharp from 'sharp';

type LngLat = [number, number]; // [lng, lat]

const TILE_SIZE = 256;
const LINE_COLOR = '#ef233c';
const USER_AGENT = 'MotoTrip-thumbnails/1.0 (+https://mototrip.pt)';

function project([lng, lat]: LngLat, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

async function fetchTile(z: number, x: number, y: number): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {
        headers: { 'User-Agent': USER_AGENT },
      });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  return null;
}

export async function renderRouteThumbnail(
  coordinates: LngLat[],
  { width = 700, height = 400, padding = 40 } = {},
): Promise<Buffer> {
  if (coordinates.length < 2) throw new Error('Route needs at least two points');

  let zoom = 17;
  for (; zoom > 1; zoom--) {
    const px = coordinates.map((c) => project(c, zoom));
    const w = Math.max(...px.map((p) => p.x)) - Math.min(...px.map((p) => p.x));
    const h = Math.max(...px.map((p) => p.y)) - Math.min(...px.map((p) => p.y));
    if (w <= width - padding * 2 && h <= height - padding * 2) break;
  }

  const px = coordinates.map((c) => project(c, zoom));
  const originX = (Math.min(...px.map((p) => p.x)) + Math.max(...px.map((p) => p.x))) / 2 - width / 2;
  const originY = (Math.min(...px.map((p) => p.y)) + Math.max(...px.map((p) => p.y))) / 2 - height / 2;

  // Tiles
  const tiles = 2 ** zoom;
  const composites: sharp.OverlayOptions[] = [];
  const jobs: Promise<void>[] = [];
  for (let tx = Math.floor(originX / TILE_SIZE); tx <= Math.floor((originX + width) / TILE_SIZE); tx++) {
    for (let ty = Math.floor(originY / TILE_SIZE); ty <= Math.floor((originY + height) / TILE_SIZE); ty++) {
      if (ty < 0 || ty >= tiles) continue;
      const wrappedX = ((tx % tiles) + tiles) % tiles;
      jobs.push(
        fetchTile(zoom, wrappedX, ty).then(async (buf) => {
          if (!buf) return;
          let left = Math.round(tx * TILE_SIZE - originX);
          let top = Math.round(ty * TILE_SIZE - originY);
          // sharp needs overlays inside the canvas, so crop edge tiles
          const cropL = Math.max(0, -left);
          const cropT = Math.max(0, -top);
          const cropW = Math.min(TILE_SIZE - cropL, width - Math.max(left, 0));
          const cropH = Math.min(TILE_SIZE - cropT, height - Math.max(top, 0));
          if (cropW <= 0 || cropH <= 0) return;
          const input = await sharp(buf)
            .extract({ left: cropL, top: cropT, width: cropW, height: cropH })
            .toBuffer();
          composites.push({ input, left: Math.max(left, 0), top: Math.max(top, 0) });
        }),
      );
    }
  }
  await Promise.all(jobs);

  // Greyed base map, like `.route-cover-map` (grayscale .85, contrast 1.05, brightness .97)
  const base = await sharp({
    create: { width, height, channels: 3, background: '#e5e5e5' },
  })
    .composite(composites)
    .png()
    .toBuffer();
  const grey = await sharp(base)
    .modulate({ saturation: 0.15, brightness: 0.97 })
    .linear(1.05, -0.025 * 255)
    .toBuffer();

  const d = px
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.x - originX).toFixed(1)},${(p.y - originY).toFixed(1)}`)
    .join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <g fill="none" stroke="${LINE_COLOR}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${d}" stroke-width="12" stroke-opacity="0.25"/>
    <path d="${d}" stroke-width="4"/>
  </g>
  <rect x="${width - 150}" y="${height - 14}" width="150" height="14" fill="#fff" fill-opacity="0.75"/>
  <text x="${width - 146}" y="${height - 4}" font-family="sans-serif" font-size="10" fill="#333">© OpenStreetMap contributors</text>
</svg>`;

  return sharp(grey)
    .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
    .png()
    .toBuffer();
}
